from __future__ import annotations

import json
import os
from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Any, Generator

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    Integer,
    String,
    Text,
    create_engine,
    text,
)
from sqlalchemy.orm import Session, declarative_base, sessionmaker

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://tickets:tickets@localhost:5432/tickets",
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


class Event(Base):
    __tablename__ = "events"

    id = Column(String, primary_key=True)
    title = Column(Text, nullable=False)
    description = Column(Text, default="")
    venue = Column(Text, default="")
    date = Column(String, nullable=False)
    time = Column(String, nullable=False)
    category = Column(String, nullable=False)
    image_url = Column(Text, default="")
    price_from = Column(Float, default=0)
    price_to = Column(Float, default=0)
    top = Column(Boolean, default=False)
    kind = Column(String, default="event")
    hall_map_image = Column(Text, nullable=True)
    sections = Column(Text, default="[]")
    movie_meta = Column(Text, nullable=True)
    is_coming_soon = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), nullable=False)
    updated_at = Column(DateTime(timezone=True), nullable=False)


class Order(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True)
    order_number = Column(String, nullable=False)
    customer_name = Column(String, default="")
    customer_email = Column(String, default="")
    customer_phone = Column(String, default="")
    event_title = Column(Text, nullable=False)
    session_date_label = Column(String, default="")
    session_time = Column(String, default="")
    session_hall = Column(String, default="")
    payment_status = Column(String, default="paid")
    payment_method = Column(String, default="Card · Stripe")
    from_app = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), nullable=False)


class OrderTicket(Base):
    __tablename__ = "order_tickets"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(String, nullable=False, index=True)
    ticket_number = Column(String, nullable=False)
    section = Column(String, default="General")
    row = Column(Integer, default=0)
    seat = Column(Integer, default=0)
    price = Column(Float, default=0)
    status = Column(String, default="active")


class Return(Base):
    __tablename__ = "returns"

    id = Column(String, primary_key=True)
    order_id = Column(String, nullable=False)
    order_number = Column(String, nullable=False)
    ticket_number = Column(String, nullable=False)
    event_title = Column(Text, nullable=False)
    customer_name = Column(String, default="")
    customer_email = Column(String, default="")
    customer_phone = Column(String, default="")
    price = Column(Float, default=0)
    reason = Column(String, default="Customer request")
    returned_at = Column(DateTime(timezone=True), nullable=False)


class AppSetting(Base):
    __tablename__ = "app_settings"

    key = Column(String, primary_key=True)
    value = Column(Text, nullable=False)


class OccupiedSeat(Base):
    __tablename__ = "occupied_seats"

    id = Column(Integer, primary_key=True, autoincrement=True)
    item_id = Column(String, nullable=False, index=True)
    date_label = Column(String, nullable=False)
    time = Column(String, nullable=False)
    hall = Column(String, nullable=False)
    row = Column(Integer, nullable=False)
    seat = Column(Integer, nullable=False)
    seat_id = Column(String, nullable=False)


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ticket_number = Column(String, unique=True, nullable=False)
    item_id = Column(String, nullable=False)
    title = Column(Text, nullable=False)
    image_url = Column(Text, nullable=False)
    format = Column(String, nullable=False)
    date_label = Column(String, nullable=False)
    time = Column(String, nullable=False)
    hall = Column(String, nullable=False)
    row = Column(Integer, nullable=False)
    seat = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    category = Column(String, nullable=False, default="cinema")
    created_at = Column(String, nullable=False)


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def json_loads(raw: str | None, default: Any = None) -> Any:
    if not raw:
        return default if default is not None else []
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return default if default is not None else []


@contextmanager
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    with engine.begin() as conn:
        conn.execute(
            text(
                "ALTER TABLE tickets ADD COLUMN IF NOT EXISTS category VARCHAR NOT NULL DEFAULT 'cinema'"
            )
        )
        conn.execute(
            text(
                """
                UPDATE tickets t
                SET category = COALESCE(
                    (
                        SELECT COALESCE(
                            NULLIF(LOWER(e.movie_meta::json->>'catalogCategory'), ''),
                            CASE WHEN e.kind = 'movie' THEN 'cinema' ELSE LOWER(e.category) END
                        )
                        FROM events e
                        WHERE e.id = t.item_id
                    ),
                    t.category
                )
                WHERE EXISTS (SELECT 1 FROM events e WHERE e.id = t.item_id)
                """
            )
        )


def is_seeded(db: Session) -> bool:
    return db.execute(text("SELECT 1 FROM events LIMIT 1")).first() is not None
