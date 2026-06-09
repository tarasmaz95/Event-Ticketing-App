from __future__ import annotations

import json
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session

from db import AppSetting, Event, OccupiedSeat, get_db, json_loads

router = APIRouter(prefix="/api/seats", tags=["seats"])

SEAT_CATEGORY_ORDER = ["good", "superlux"]
DEFAULT_ZONES = [
    {"name": "GOOD", "price": 19.0},
    {"name": "SUPER LUX", "price": 30.0},
]


def get_layout_template(db: Session) -> dict:
    row = db.query(AppSetting).filter(AppSetting.key == "seat_layout").first()
    if not row:
        raise HTTPException(500, "Seat layout not configured")
    return json.loads(row.value)


def event_sections_for_seats(db: Session, item_id: str) -> list[dict]:
    event = db.query(Event).filter(Event.id == item_id).first()
    if not event:
        return []
    return json_loads(event.sections, []) or []


def category_zone_map(sections: list[dict]) -> dict[str, dict[str, Any]]:
    result: dict[str, dict[str, Any]] = {}
    for i, cat in enumerate(SEAT_CATEGORY_ORDER):
        default = DEFAULT_ZONES[i]
        if i < len(sections):
            sec = sections[i]
            result[cat] = {
                "name": str(sec.get("name") or default["name"]),
                "price": float(sec.get("price", default["price"])),
            }
        elif sections:
            sec = sections[-1]
            result[cat] = {
                "name": str(sec.get("name") or default["name"]),
                "price": float(sec.get("price", default["price"])),
            }
        else:
            result[cat] = dict(default)
    return result


def get_occupied_keys(
    db: Session,
    item_id: str,
    date_label: str,
    time: str,
    hall: str,
) -> set[str]:
    rows = (
        db.query(OccupiedSeat)
        .filter(
            OccupiedSeat.item_id == item_id,
            OccupiedSeat.date_label == date_label,
            OccupiedSeat.time == time,
            OccupiedSeat.hall == hall,
        )
        .all()
    )
    return {r.seat_id for r in rows}


@router.get("/layout")
def get_seat_layout(
    item_id: str,
    date_label: str,
    time: str,
    hall: str,
) -> dict[str, Any]:
    with get_db() as db:
        template = get_layout_template(db)
        sections = event_sections_for_seats(db, item_id)
        zones_by_category = category_zone_map(sections)
        seed_sold = set(template.get("seedSoldIds", []))
        occupied = get_occupied_keys(db, item_id, date_label, time, hall)
        sold_ids = seed_sold | occupied

        rows_out = []
        for row in template.get("rows", []):
            seats_out = []
            for seat in row.get("seats", []):
                if seat is None:
                    seats_out.append(None)
                    continue
                cat = seat.get("category", "good")
                zone = zones_by_category.get(cat, zones_by_category["good"])
                seats_out.append(
                    {
                        **seat,
                        "price": zone["price"],
                        "zoneName": zone["name"],
                        "sold": seat["id"] in sold_ids,
                    }
                )
            rows_out.append({"row": row["row"], "seats": seats_out})

        colors_row = db.query(AppSetting).filter(AppSetting.key == "seat_colors").first()
        colors = json.loads(colors_row.value) if colors_row else {}

        zones = [
            {
                "category": cat,
                "name": zones_by_category[cat]["name"],
                "price": zones_by_category[cat]["price"],
                "color": colors.get(cat, ""),
            }
            for cat in SEAT_CATEGORY_ORDER
        ]

        return {"rows": rows_out, "colors": colors, "zones": zones}


def mark_seats_occupied(
    db: Session,
    item_id: str,
    date_label: str,
    time: str,
    hall: str,
    seats: list[dict],
) -> None:
    for seat in seats:
        seat_id = f"r{seat['row']}s{seat['seat']}"
        exists = (
            db.query(OccupiedSeat)
            .filter(
                OccupiedSeat.item_id == item_id,
                OccupiedSeat.date_label == date_label,
                OccupiedSeat.time == time,
                OccupiedSeat.hall == hall,
                OccupiedSeat.seat_id == seat_id,
            )
            .first()
        )
        if exists:
            continue
        db.add(
            OccupiedSeat(
                item_id=item_id,
                date_label=date_label,
                time=time,
                hall=hall,
                row=seat["row"],
                seat=seat["seat"],
                seat_id=seat_id,
            )
        )


def release_seats_for_tickets(db: Session, tickets: list) -> None:
    for t in tickets:
        seat_id = f"r{t.row}s{t.seat}"
        db.query(OccupiedSeat).filter(
            OccupiedSeat.item_id == t.item_id,
            OccupiedSeat.date_label == t.date_label,
            OccupiedSeat.time == t.time,
            OccupiedSeat.hall == t.hall,
            OccupiedSeat.seat_id == seat_id,
        ).delete()
