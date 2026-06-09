from __future__ import annotations

import json

from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session

from db import AppSetting, get_db

router = APIRouter(prefix="/api/locations", tags=["locations"])


@router.get("")
def list_locations() -> dict:
    with get_db() as db:
        row = db.query(AppSetting).filter(AppSetting.key == "locations").first()
        if not row:
            raise HTTPException(500, "Locations not configured")
        return json.loads(row.value)
