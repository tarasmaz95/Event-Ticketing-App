from __future__ import annotations

import json
from datetime import datetime, timedelta
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session

from db import AppSetting, Event, get_db, json_loads

router = APIRouter(prefix="/api/showtimes", tags=["showtimes"])


def get_setting(db: Session, key: str) -> Any:
    row = db.query(AppSetting).filter(AppSetting.key == key).first()
    if not row:
        return None
    return json.loads(row.value)


def is_concert_event(event: Event | None) -> bool:
    if not event:
        return False
    if event.category == "CONCERTS":
        return True
    meta = json_loads(event.movie_meta, {}) or {}
    return meta.get("catalogCategory") == "concerts"


def build_date_options() -> list[dict[str, str]]:
    options = []
    base = datetime.now()
    for i in range(7):
        d = base + timedelta(days=i)
        options.append(
            {
                "id": f"d{i + 1}",
                "day": d.strftime("%a").upper()[:3],
                "date": d.strftime("%d").lstrip("0") or "0",
                "label": d.strftime("%B %d"),
            }
        )
    return options


def concert_showtime_for_date(date_id: str, pool: list[dict]) -> dict:
    h = 0
    for ch in date_id:
        h = (h * 31 + ord(ch)) & 0xFFFFFFFF
    return pool[abs(h) % len(pool)]


@router.get("/dates")
def list_dates() -> list[dict[str, str]]:
    return build_date_options()


@router.get("/halls/{item_id}")
def list_halls(item_id: str, date_id: str = "d1") -> dict[str, Any]:
    with get_db() as db:
        event = db.query(Event).filter(Event.id == item_id).first()
        if not event:
            raise HTTPException(404, "Item not found")

        concert = is_concert_event(event)
        if concert:
            halls = get_setting(db, "concert_halls") or []
            pool = get_setting(db, "concert_time_pool") or []
            showtime = concert_showtime_for_date(date_id, pool) if pool else halls[0]["showtimes"][0]
            halls = [{**h, "showtimes": [showtime]} for h in halls]
        else:
            halls = get_setting(db, "cinema_halls") or []

        dates = build_date_options()
        active = next((d for d in dates if d["id"] == date_id), dates[0])

        return {
            "halls": halls,
            "dates": dates,
            "activeDate": active,
            "isConcert": concert,
            "formatFilters": get_setting(db, "format_filters") or ["ALL", "2D", "3D", "SDH"],
        }
