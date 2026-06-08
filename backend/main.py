from __future__ import annotations

import random
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

DB_PATH = Path(__file__).parent / "tickets.db"

app = FastAPI(title="Event Ticketing API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


class TicketOut(BaseModel):
    id: int
    ticket_number: str
    item_id: str
    title: str
    image_url: str
    format: str
    date_label: str
    time: str
    hall: str
    row: int
    seat: int
    price: float
    created_at: str


def init_db() -> None:
    with get_db() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS tickets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ticket_number TEXT UNIQUE NOT NULL,
                item_id TEXT NOT NULL,
                title TEXT NOT NULL,
                image_url TEXT NOT NULL,
                format TEXT NOT NULL,
                date_label TEXT NOT NULL,
                time TEXT NOT NULL,
                hall TEXT NOT NULL,
                row INTEGER NOT NULL,
                seat INTEGER NOT NULL,
                price REAL NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        conn.commit()


@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


def new_ticket_number() -> str:
    for _ in range(20):
        number = str(random.randint(1_000_000, 9_999_999))
        with get_db() as conn:
            exists = conn.execute(
                "SELECT 1 FROM tickets WHERE ticket_number = ?", (number,)
            ).fetchone()
        if not exists:
            return number
    raise HTTPException(status_code=500, detail="Could not generate ticket number")


def row_to_ticket(row: sqlite3.Row) -> TicketOut:
    return TicketOut(
        id=row["id"],
        ticket_number=row["ticket_number"],
        item_id=row["item_id"],
        title=row["title"],
        image_url=row["image_url"],
        format=row["format"],
        date_label=row["date_label"],
        time=row["time"],
        hall=row["hall"],
        row=row["row"],
        seat=row["seat"],
        price=row["price"],
        created_at=row["created_at"],
    )


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/api/tickets", response_model=List[TicketOut])
def list_tickets() -> List[TicketOut]:
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM tickets ORDER BY id DESC"
        ).fetchall()
    return [row_to_ticket(row) for row in rows]


@app.post("/api/tickets", response_model=List[TicketOut])
def create_tickets(purchase: PurchaseInput) -> List[TicketOut]:
    created_at = datetime.now(timezone.utc).isoformat()
    created: List[TicketOut] = []

    with get_db() as conn:
        for seat in purchase.seats:
            ticket_number = new_ticket_number()
            cursor = conn.execute(
                """
                INSERT INTO tickets (
                    ticket_number, item_id, title, image_url, format,
                    date_label, time, hall, row, seat, price, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    ticket_number,
                    purchase.item_id,
                    purchase.title,
                    purchase.image_url,
                    purchase.format,
                    purchase.date_label,
                    purchase.time,
                    purchase.hall,
                    seat.row,
                    seat.seat,
                    seat.price,
                    created_at,
                ),
            )
            row = conn.execute(
                "SELECT * FROM tickets WHERE id = ?", (cursor.lastrowid,)
            ).fetchone()
            if row:
                created.append(row_to_ticket(row))
        conn.commit()

    return created


class EmailInput(BaseModel):
    email: str | None = None


@app.post("/api/tickets/{ticket_id}/email")
def send_ticket_email(ticket_id: int, body: EmailInput | None = None) -> dict:
    with get_db() as conn:
        row = conn.execute(
            "SELECT id, title, ticket_number FROM tickets WHERE id = ?", (ticket_id,)
        ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return {
        "ok": True,
        "message": f"Ticket {row['ticket_number']} for \"{row['title']}\" queued for email delivery.",
    }
