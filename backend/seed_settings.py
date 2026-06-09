from __future__ import annotations

import json

from sqlalchemy import text
from sqlalchemy.orm import Session

from db import AppSetting
from seat_layout import build_layout_template

Q = "?w=800&h=450&fit=crop&auto=format&q=80"


def img(photo_id: str) -> str:
    return f"https://images.unsplash.com/{photo_id}{Q}"


def has_settings(db: Session) -> bool:
    return db.execute(text("SELECT 1 FROM app_settings LIMIT 1")).first() is not None


def seed_settings(db: Session) -> None:
    locations = {
        "cities": [
            {
                "id": "nyc",
                "name": "NEW YORK",
                "venues": [
                    {
                        "id": "hudson-point",
                        "name": "HUDSON POINT",
                        "address": "415 West 42nd St, Manhattan",
                    }
                ],
            }
        ],
        "defaultLocation": {"cityId": "nyc", "venueId": "hudson-point"},
    }

    cinema_halls = [
        {
            "id": "hudson-point",
            "name": "Hudson Point",
            "fullName": "Hudson Point Cinema",
            "address": "415 West 42nd St, Manhattan",
            "imageUrl": img("photo-1501386761578-eac5c94b800a"),
            "highlighted": True,
            "showtimes": [
                {"time": "10:00", "endTime": "11:25", "room": "Hall 2", "formats": "2D SDH"},
                {"time": "11:00", "endTime": "12:25", "room": "Hall 1", "formats": "2D SDH"},
                {"time": "19:00", "endTime": "20:25", "room": "Hall 3", "formats": "3D SDH"},
                {"time": "20:30", "endTime": "21:55", "room": "Hall 2", "formats": "2D SDH"},
            ],
        }
    ]

    concert_halls = [
        {
            "id": "msg",
            "name": "Madison Square Garden",
            "fullName": "Madison Square Garden",
            "address": "4 Pennsylvania Plaza, New York",
            "imageUrl": img("photo-1501386761578-eac5c94b800a"),
            "highlighted": True,
            "showtimes": [
                {
                    "time": "20:00",
                    "endTime": "22:30",
                    "room": "Main Arena",
                    "formats": "General Admission",
                }
            ],
        }
    ]

    concert_time_pool = [
        {"time": "10:00", "endTime": "12:30", "room": "Main Arena", "formats": "General Admission"},
        {"time": "11:30", "endTime": "13:45", "room": "Main Arena", "formats": "General Admission"},
        {"time": "14:00", "endTime": "16:15", "room": "Main Arena", "formats": "General Admission"},
        {"time": "18:00", "endTime": "20:15", "room": "Main Arena", "formats": "General Admission"},
        {"time": "19:30", "endTime": "21:45", "room": "Main Arena", "formats": "General Admission"},
        {"time": "20:00", "endTime": "22:30", "room": "Main Arena", "formats": "General Admission"},
        {"time": "21:00", "endTime": "23:15", "room": "Main Arena", "formats": "General Admission"},
    ]

    settings = {
        "locations": locations,
        "seat_layout": build_layout_template(),
        "cinema_halls": cinema_halls,
        "concert_halls": concert_halls,
        "concert_time_pool": concert_time_pool,
        "format_filters": ["ALL", "2D", "3D", "SDH"],
        "seat_colors": {
            "good": "#8ECAE6",
            "goodSelected": "#4A9EC7",
            "superlux": "#2EC4B6",
            "superluxSelected": "#1A9E92",
            "sold": "#C8C8C8",
        },
    }

    for key, value in settings.items():
        db.merge(AppSetting(key=key, value=json.dumps(value)))
