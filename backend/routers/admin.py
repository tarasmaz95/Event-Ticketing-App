from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from db import Event, Order, OrderTicket, Return, get_db, json_loads, utcnow

router = APIRouter(prefix="/api/admin", tags=["admin"])

RETURN_REASONS = [
    "Customer request",
    "Event cancelled",
    "Duplicate purchase",
    "Unable to attend",
    "Other",
]


class SectionInput(BaseModel):
    id: str | None = None
    name: str
    price: float


class EventInput(BaseModel):
    title: str
    description: str = ""
    venue: str
    date: str
    time: str
    category: str
    imageUrl: str | None = None
    hallMapImage: str | None = None
    sections: list[SectionInput] = Field(default_factory=list)


CATEGORY_TO_CATALOG: dict[str, str] = {
    "CONCERTS": "concerts",
    "THEATER": "theater",
    "KIDS": "kids",
    "STAND-UP": "standup",
    "CINEMA": "cinema",
}


def build_event_meta(category: str, date: str, time: str) -> str:
    catalog = CATEGORY_TO_CATALOG.get(category, category.lower())
    display_date = date
    display_time = time
    try:
        from datetime import datetime as dt

        parsed = dt.strptime(date, "%Y-%m-%d")
        display_date = parsed.strftime("%b %d, %a")
        hour, minute = time.split(":")[:2]
        h = int(hour)
        suffix = "AM" if h < 12 else "PM"
        h12 = h % 12 or 12
        display_time = f"{h12}:{minute} {suffix}"
    except (ValueError, AttributeError):
        pass
    return json.dumps(
        {
            "catalogCategory": catalog,
            "displayDate": display_date,
            "displayTime": display_time,
        }
    )


def event_to_admin(row: Event) -> dict[str, Any]:
    return {
        "id": row.id,
        "title": row.title,
        "description": row.description or "",
        "venue": row.venue or "",
        "date": row.date,
        "time": row.time,
        "category": row.category,
        "imageUrl": row.image_url or "",
        "hallMapImage": row.hall_map_image,
        "sections": json_loads(row.sections, []),
        "createdAt": row.created_at.isoformat() if row.created_at else None,
        "updatedAt": row.updated_at.isoformat() if row.updated_at else None,
    }


def enrich_order(db: Session, order: Order) -> dict[str, Any]:
    tickets = db.query(OrderTicket).filter(OrderTicket.order_id == order.id).all()
    returns = db.query(Return).filter(Return.order_id == order.id).all()
    returned_map = {r.ticket_number: r for r in returns}

    ticket_rows = []
    for t in tickets:
        ret = returned_map.get(t.ticket_number)
        status = "returned" if ret or t.status == "returned" else "active"
        ticket_rows.append(
            {
                "ticket_number": t.ticket_number,
                "section": t.section,
                "row": t.row,
                "seat": t.seat,
                "price": t.price,
                "status": status,
                "returnInfo": {
                    "reason": ret.reason,
                    "returnedAt": ret.returned_at.isoformat(),
                }
                if ret
                else None,
            }
        )

    active = [t for t in ticket_rows if t["status"] == "active"]
    returned = [t for t in ticket_rows if t["status"] == "returned"]
    refund_status = "none"
    if returned and active:
        refund_status = "partial"
    elif returned and not active:
        refund_status = "full"

    return {
        "id": order.id,
        "orderNumber": order.order_number,
        "customer": {
            "name": order.customer_name,
            "email": order.customer_email,
            "phone": order.customer_phone,
        },
        "eventTitle": order.event_title,
        "session": {
            "dateLabel": order.session_date_label,
            "time": order.session_time,
            "hall": order.session_hall,
        },
        "paymentStatus": order.payment_status,
        "paymentMethod": order.payment_method,
        "fromApp": order.from_app,
        "tickets": ticket_rows,
        "refundStatus": refund_status,
        "activeTicketCount": len(active),
        "returnedTicketCount": len(returned),
        "refundedAmount": sum(t["price"] for t in returned),
        "createdAt": order.created_at.isoformat(),
    }


def order_total(order: dict[str, Any]) -> float:
    return sum(t["price"] for t in order["tickets"] if t.get("status", "active") == "active")


def compute_stats(db: Session) -> dict[str, Any]:
    events = db.query(Event).count()
    orders = [enrich_order(db, o) for o in db.query(Order).all()]
    paid = [o for o in orders if o["paymentStatus"] == "paid"]
    pending = [o for o in orders if o["paymentStatus"] == "pending"]
    refunded_orders = [o for o in orders if o["refundStatus"] in ("full", "partial")]
    tickets_sold = sum(o.get("activeTicketCount", 0) for o in paid)
    revenue = sum(order_total(o) for o in paid)
    returns = db.query(Return).all()
    refunded_amount = sum(r.price for r in returns)
    return {
        "totalEvents": events,
        "totalOrders": len(orders),
        "paidOrders": len(paid),
        "pendingOrders": len(pending),
        "refundedOrders": len(refunded_orders),
        "ticketsSold": tickets_sold,
        "returnedTickets": len(returns),
        "revenue": revenue,
        "refundedAmount": refunded_amount,
    }


@router.get("/bootstrap")
def bootstrap() -> dict[str, Any]:
    with get_db() as db:
        events = [event_to_admin(e) for e in db.query(Event).order_by(Event.created_at.desc()).all()]
        orders = sorted(
            [enrich_order(db, o) for o in db.query(Order).all()],
            key=lambda o: o["createdAt"],
            reverse=True,
        )
        returns = sorted(
            [
                {
                    "id": r.id,
                    "orderId": r.order_id,
                    "orderNumber": r.order_number,
                    "ticketNumber": r.ticket_number,
                    "eventTitle": r.event_title,
                    "customer": {
                        "name": r.customer_name,
                        "email": r.customer_email,
                        "phone": r.customer_phone,
                    },
                    "price": r.price,
                    "reason": r.reason,
                    "returnedAt": r.returned_at.isoformat(),
                }
                for r in db.query(Return).all()
            ],
            key=lambda r: r["returnedAt"],
            reverse=True,
        )
        stats = compute_stats(db)
        sales_by_event = sales_by_event_data(orders)
        sales_by_section = sales_by_section_data(orders)
        return {
            "events": events,
            "orders": orders,
            "returns": returns,
            "stats": stats,
            "salesByEvent": sales_by_event,
            "salesBySection": sales_by_section,
        }


def sales_by_event_data(orders: list[dict[str, Any]]) -> list[dict[str, Any]]:
    m: dict[str, dict[str, Any]] = {}
    for order in orders:
        if order["paymentStatus"] != "paid":
            continue
        active = order.get("activeTicketCount", 0)
        if not active:
            continue
        key = order["eventTitle"]
        if key not in m:
            m[key] = {"title": key, "tickets": 0, "revenue": 0, "orders": 0}
        m[key]["orders"] += 1
        m[key]["tickets"] += active
        m[key]["revenue"] += order_total(order)
    return sorted(m.values(), key=lambda x: x["revenue"], reverse=True)


def sales_by_section_data(orders: list[dict[str, Any]]) -> list[dict[str, Any]]:
    m: dict[str, dict[str, Any]] = {}
    for order in orders:
        if order["paymentStatus"] != "paid":
            continue
        for t in order["tickets"]:
            if t.get("status", "active") != "active":
                continue
            key = f"{order['eventTitle']} · {t['section']}"
            if key not in m:
                m[key] = {
                    "event": order["eventTitle"],
                    "section": t["section"],
                    "tickets": 0,
                    "revenue": 0,
                }
            m[key]["tickets"] += 1
            m[key]["revenue"] += t.get("price", 0)
    return sorted(m.values(), key=lambda x: x["revenue"], reverse=True)


@router.get("/events")
def list_events() -> list[dict[str, Any]]:
    with get_db() as db:
        return [event_to_admin(e) for e in db.query(Event).order_by(Event.created_at.desc()).all()]


@router.get("/events/{event_id}")
def get_event(event_id: str) -> dict[str, Any]:
    with get_db() as db:
        row = db.query(Event).filter(Event.id == event_id).first()
        if not row:
            raise HTTPException(404, "Event not found")
        return event_to_admin(row)


@router.post("/events")
def create_event(payload: EventInput) -> dict[str, Any]:
    now = utcnow()
    eid = f"evt-{uuid.uuid4().hex[:12]}"
    sections = [
        {"id": s.id or f"sec-{uuid.uuid4().hex[:8]}", "name": s.name, "price": s.price}
        for s in payload.sections
    ]
    prices = [s["price"] for s in sections] or [0]
    with get_db() as db:
        row = Event(
            id=eid,
            title=payload.title.strip(),
            description=payload.description.strip(),
            venue=payload.venue.strip(),
            date=payload.date,
            time=payload.time,
            category=payload.category,
            image_url=(payload.imageUrl or "").strip(),
            price_from=min(prices),
            price_to=max(prices),
            top=False,
            kind="event",
            hall_map_image=payload.hallMapImage,
            sections=json.dumps(sections),
            movie_meta=build_event_meta(payload.category, payload.date, payload.time),
            is_coming_soon=False,
            created_at=now,
            updated_at=now,
        )
        db.add(row)
        db.flush()
        return event_to_admin(row)


@router.put("/events/{event_id}")
def update_event(event_id: str, payload: EventInput) -> dict[str, Any]:
    sections = [
        {"id": s.id or f"sec-{uuid.uuid4().hex[:8]}", "name": s.name, "price": s.price}
        for s in payload.sections
    ]
    prices = [s["price"] for s in sections] or [0]
    with get_db() as db:
        row = db.query(Event).filter(Event.id == event_id).first()
        if not row:
            raise HTTPException(404, "Event not found")
        row.title = payload.title.strip()
        row.description = payload.description.strip()
        row.venue = payload.venue.strip()
        row.date = payload.date
        row.time = payload.time
        row.category = payload.category
        row.image_url = (payload.imageUrl or "").strip()
        row.hall_map_image = payload.hallMapImage
        row.sections = json.dumps(sections)
        row.price_from = min(prices)
        row.price_to = max(prices)
        existing_meta = json_loads(row.movie_meta, {}) or {}
        new_meta = json.loads(build_event_meta(payload.category, payload.date, payload.time))
        row.movie_meta = json.dumps({**existing_meta, **new_meta})
        row.updated_at = utcnow()
        db.flush()
        return event_to_admin(row)


@router.delete("/events/{event_id}")
def delete_event(event_id: str) -> dict[str, bool]:
    with get_db() as db:
        row = db.query(Event).filter(Event.id == event_id).first()
        if not row:
            raise HTTPException(404, "Event not found")
        db.delete(row)
    return {"ok": True}


@router.get("/orders")
def list_orders() -> list[dict[str, Any]]:
    with get_db() as db:
        return sorted(
            [enrich_order(db, o) for o in db.query(Order).all()],
            key=lambda o: o["createdAt"],
            reverse=True,
        )


@router.get("/orders/{order_id}")
def get_order(order_id: str) -> dict[str, Any]:
    with get_db() as db:
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(404, "Order not found")
        return enrich_order(db, order)


class ReturnInput(BaseModel):
    reason: str = "Customer request"
    all: bool = False
    ticketNumber: str | None = None


@router.post("/orders/{order_id}/returns")
def process_return(order_id: str, body: ReturnInput) -> dict[str, Any]:
    ticket_number = body.ticketNumber
    reason = body.reason if body.reason in RETURN_REASONS else "Other"

    with get_db() as db:
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            return {"ok": False, "error": "Order not found."}
        if order.payment_status != "paid":
            return {"ok": False, "error": "Only paid orders can be refunded."}

        enriched = enrich_order(db, order)
        active = [t for t in enriched["tickets"] if t["status"] == "active"]

        targets = active if body.all else [t for t in active if str(t["ticket_number"]) == str(ticket_number)]
        if not targets:
            return {"ok": False, "error": "This ticket cannot be returned."}

        total = 0.0
        count = 0
        for t in targets:
            exists = (
                db.query(Return)
                .filter(Return.order_id == order_id, Return.ticket_number == str(t["ticket_number"]))
                .first()
            )
            if exists:
                continue
            db.add(
                Return(
                    id=f"ret-{uuid.uuid4().hex[:12]}",
                    order_id=order_id,
                    order_number=order.order_number,
                    ticket_number=str(t["ticket_number"]),
                    event_title=order.event_title,
                    customer_name=order.customer_name,
                    customer_email=order.customer_email,
                    customer_phone=order.customer_phone,
                    price=t["price"],
                    reason=reason,
                    returned_at=utcnow(),
                )
            )
            ot = (
                db.query(OrderTicket)
                .filter(OrderTicket.order_id == order_id, OrderTicket.ticket_number == str(t["ticket_number"]))
                .first()
            )
            if ot:
                ot.status = "returned"
            total += t["price"]
            count += 1

        if not count:
            return {"ok": False, "error": "Ticket already returned."}

        if body.all:
            return {"ok": True, "count": count, "refundAmount": total}
        return {"ok": True, "refundAmount": total, "ticketNumber": str(targets[0]["ticket_number"])}


@router.get("/stats")
def get_stats() -> dict[str, Any]:
    with get_db() as db:
        return compute_stats(db)
