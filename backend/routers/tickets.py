from __future__ import annotations

import random
import uuid
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from db import Event, Order, OrderTicket, Ticket, get_db, json_loads, utcnow
from routers.seats import mark_seats_occupied

router = APIRouter(prefix="/api/tickets", tags=["tickets"])


class SeatInput(BaseModel):
    row: int
    seat: int
    price: float


class PurchaseInput(BaseModel):
    item_id: str
    title: str
    image_url: str
    format: str = "2D"
    date_label: str
    time: str
    hall: str
    seats: List[SeatInput] = Field(min_length=1)
    customer_name: str | None = None
    customer_email: str | None = None


class TicketOut(BaseModel):
    id: int
    ticket_number: str
    item_id: str
    title: str
    image_url: str
    format: str
    category: str
    date_label: str
    time: str
    hall: str
    row: int
    seat: int
    price: float
    created_at: str


def resolve_event_category(db: Session, item_id: str) -> str:
    event = db.query(Event).filter(Event.id == item_id).first()
    if not event:
        return "cinema"
    meta = json_loads(event.movie_meta, {}) or {}
    catalog_category = meta.get("catalogCategory")
    if catalog_category:
        return str(catalog_category).lower()
    if event.kind == "movie":
        return "cinema"
    return event.category.lower()


def new_ticket_number(db: Session) -> str:
    for _ in range(20):
        number = str(random.randint(1_000_000, 9_999_999))
        exists = db.query(Ticket).filter(Ticket.ticket_number == number).first()
        if not exists:
            return number
    raise HTTPException(500, "Could not generate ticket number")


def ticket_to_out(row: Ticket) -> TicketOut:
    return TicketOut(
        id=row.id,
        ticket_number=row.ticket_number,
        item_id=row.item_id,
        title=row.title,
        image_url=row.image_url,
        format=row.format,
        category=row.category or "cinema",
        date_label=row.date_label,
        time=row.time,
        hall=row.hall,
        row=row.row,
        seat=row.seat,
        price=row.price,
        created_at=row.created_at,
    )


def create_order_from_purchase(db: Session, purchase: PurchaseInput, created_at: str, tickets: list[Ticket]) -> None:
    order_id = f"app-{created_at}-{purchase.item_id}"
    if db.query(Order).filter(Order.id == order_id).first():
        return

    order_number = f"APP-{tickets[0].id:05d}"
    db.add(
        Order(
            id=order_id,
            order_number=order_number,
            customer_name=purchase.customer_name or "App customer",
            customer_email=purchase.customer_email or "—",
            customer_phone="—",
            event_title=purchase.title,
            session_date_label=purchase.date_label,
            session_time=purchase.time,
            session_hall=purchase.hall,
            payment_status="paid",
            payment_method="Card · Stripe",
            from_app=True,
            created_at=datetime.fromisoformat(created_at.replace("Z", "+00:00")),
        )
    )
    for t in tickets:
        db.add(
            OrderTicket(
                order_id=order_id,
                ticket_number=t.ticket_number,
                section=purchase.format or "General",
                row=t.row,
                seat=t.seat,
                price=t.price,
                status="active",
            )
        )


@router.get("", response_model=List[TicketOut])
def list_tickets() -> List[TicketOut]:
    with get_db() as db:
        rows = db.query(Ticket).order_by(Ticket.id.desc()).all()
        return [ticket_to_out(r) for r in rows]


@router.post("", response_model=List[TicketOut])
def create_tickets(purchase: PurchaseInput) -> List[TicketOut]:
    created_at = datetime.now(timezone.utc).isoformat()
    created: list[TicketOut] = []

    with get_db() as db:
        category = resolve_event_category(db, purchase.item_id)
        ticket_rows: list[Ticket] = []
        for seat in purchase.seats:
            ticket_number = new_ticket_number(db)
            row = Ticket(
                ticket_number=ticket_number,
                item_id=purchase.item_id,
                title=purchase.title,
                image_url=purchase.image_url,
                format=purchase.format,
                category=category,
                date_label=purchase.date_label,
                time=purchase.time,
                hall=purchase.hall,
                row=seat.row,
                seat=seat.seat,
                price=seat.price,
                created_at=created_at,
            )
            db.add(row)
            db.flush()
            ticket_rows.append(row)
            created.append(ticket_to_out(row))

        create_order_from_purchase(db, purchase, created_at, ticket_rows)
        mark_seats_occupied(
            db,
            purchase.item_id,
            purchase.date_label,
            purchase.time,
            purchase.hall,
            [{"row": s.row, "seat": s.seat} for s in purchase.seats],
        )

    return created


class EmailInput(BaseModel):
    email: str | None = None


@router.post("/{ticket_id}/email")
def send_ticket_email(ticket_id: int, body: EmailInput | None = None) -> dict:
    with get_db() as db:
        row = db.query(Ticket).filter(Ticket.id == ticket_id).first()
        if not row:
            raise HTTPException(404, "Ticket not found")
    return {
        "ok": True,
        "message": f'Ticket {row.ticket_number} for "{row.title}" queued for email delivery.',
    }
