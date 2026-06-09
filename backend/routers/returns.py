from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from db import Order, OrderTicket, Return, Ticket, get_db, utcnow
from routers.seats import release_seats_for_tickets

router = APIRouter(prefix="/api/returns", tags=["returns"])

REASON_MAP = {
    "Personal reasons": "Customer request",
    "Other": "Other",
    "Customer request": "Customer request",
    "Event cancelled": "Event cancelled",
    "Duplicate purchase": "Duplicate purchase",
    "Unable to attend": "Unable to attend",
}


class ReturnOrderInput(BaseModel):
    orderKey: str
    reason: str = "Customer request"


def normalize_reason(reason: str) -> str:
    return REASON_MAP.get(reason, "Other")


@router.post("")
def return_app_order(body: ReturnOrderInput) -> dict:
    parts = body.orderKey.split("|", 1)
    if len(parts) != 2:
        raise HTTPException(400, detail="Invalid order key")

    created_at, item_id = parts
    order_id = f"app-{created_at}-{item_id}"
    reason = normalize_reason(body.reason)

    with get_db() as db:
        order = db.query(Order).filter(Order.id == order_id).first()
        tickets = (
            db.query(Ticket)
            .filter(Ticket.created_at == created_at, Ticket.item_id == item_id)
            .all()
        )

        if not order and not tickets:
            return {"ok": False, "error": "Order not found."}

        if order:
            if order.payment_status != "paid":
                return {"ok": False, "error": "Only paid orders can be refunded."}

            order_tickets = (
                db.query(OrderTicket)
                .filter(OrderTicket.order_id == order_id, OrderTicket.status == "active")
                .all()
            )
            if not order_tickets:
                return {"ok": False, "error": "No active tickets to return."}

            total = 0.0
            count = 0
            for ot in order_tickets:
                exists = (
                    db.query(Return)
                    .filter(Return.order_id == order_id, Return.ticket_number == ot.ticket_number)
                    .first()
                )
                if exists:
                    continue
                db.add(
                    Return(
                        id=f"ret-{uuid.uuid4().hex[:12]}",
                        order_id=order_id,
                        order_number=order.order_number,
                        ticket_number=ot.ticket_number,
                        event_title=order.event_title,
                        customer_name=order.customer_name,
                        customer_email=order.customer_email,
                        customer_phone=order.customer_phone,
                        price=ot.price,
                        reason=reason,
                        returned_at=utcnow(),
                    )
                )
                ot.status = "returned"
                total += ot.price
                count += 1

            release_seats_for_tickets(db, tickets)
            for t in tickets:
                db.delete(t)

            if not count:
                return {"ok": False, "error": "Tickets already returned."}

            return {"ok": True, "count": count, "refundAmount": total}

        release_seats_for_tickets(db, tickets)
        for t in tickets:
            db.delete(t)
        return {"ok": True, "count": len(tickets), "refundAmount": sum(t.price for t in tickets)}
