from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session

from db import Event, get_db, json_loads

router = APIRouter(prefix="/api/catalog", tags=["catalog"])


def meta(row: Event) -> dict[str, Any]:
    return json_loads(row.movie_meta, {}) or {}


def event_to_catalog(row: Event) -> dict[str, Any]:
    m = meta(row)
    return {
        "id": row.id,
        "category": m.get("catalogCategory", row.category.lower()),
        "title": row.title,
        "venue": row.venue,
        "date": m.get("displayDate", row.date),
        "time": m.get("displayTime", row.time),
        "priceFrom": row.price_from,
        "priceTo": row.price_to,
        "imageUrl": row.image_url,
        "top": row.top,
        "description": row.description,
    }


def movie_to_catalog(row: Event) -> dict[str, Any]:
    m = meta(row)
    return {
        "id": row.id,
        "title": row.title,
        "originalTitle": m.get("originalTitle", row.title),
        "imageUrl": row.image_url,
        "ageRating": m.get("ageRating", "PG"),
        "formats": m.get("formats", "2D"),
        "rating": m.get("rating", 8.0),
        "nextSessionDate": m.get("nextSessionDate", ""),
        "duration": m.get("duration", ""),
        "genres": m.get("genres", ""),
        "description": row.description,
        "releaseDate": m.get("releaseDate", ""),
    }


def coming_soon_to_catalog(row: Event) -> dict[str, Any]:
    m = meta(row)
    return {
        "id": row.id,
        "kind": row.kind,
        "title": row.title,
        "originalTitle": m.get("originalTitle", row.title),
        "imageUrl": row.image_url,
        "ageRating": m.get("ageRating", "All Ages"),
        "formats": m.get("formats", ""),
        "rating": m.get("rating", 8.0),
        "nextSessionDate": m.get("nextSessionDate", ""),
        "duration": m.get("duration", ""),
        "genres": m.get("genres", ""),
        "description": row.description,
        "releaseDate": m.get("releaseDate", ""),
        "venue": m.get("venue", row.venue),
    }


@router.get("/events")
def list_events(category: str | None = None) -> list[dict[str, Any]]:
    with get_db() as db:
        rows = db.query(Event).filter(Event.is_coming_soon.is_(False), Event.kind != "movie").all()
        items = [event_to_catalog(r) for r in rows]
        if category == "home":
            return [i for i in items if i.get("top")]
        if category and category != "cinema":
            return [i for i in items if i["category"] == category]
        return items


@router.get("/movies")
def list_movies() -> list[dict[str, Any]]:
    with get_db() as db:
        rows = db.query(Event).filter(Event.kind == "movie", Event.is_coming_soon.is_(False)).all()
        return [movie_to_catalog(r) for r in rows]


@router.get("/coming-soon")
def list_coming_soon() -> list[dict[str, Any]]:
    with get_db() as db:
        rows = db.query(Event).filter(Event.is_coming_soon.is_(True)).all()
        return [coming_soon_to_catalog(r) for r in rows]


@router.get("/item/{item_id}")
def get_item(item_id: str) -> dict[str, Any]:
    with get_db() as db:
        row = db.query(Event).filter(Event.id == item_id).first()
        if not row:
            raise HTTPException(404, "Item not found")
        if row.kind == "movie":
            return {"kind": "movie", **movie_to_catalog(row)}
        if row.is_coming_soon:
            return {"kind": "coming_soon", **coming_soon_to_catalog(row)}
        return {"kind": "event", **event_to_catalog(row)}
