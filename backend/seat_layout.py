"""Default cinema hall layout — mirrors src/data/seats.ts."""
from __future__ import annotations

GOOD_PRICE = 19
LUX_PRICE = 30

SEED_SOLD_IDS = ["r3s5", "r5s8", "r8s12", "r9s3"]


def _good(row: int, num: int) -> dict:
    return {
        "id": f"r{row}s{num}",
        "row": row,
        "number": num,
        "category": "good",
        "price": GOOD_PRICE,
    }


def _lux(row: int, num: int) -> dict:
    return {
        "id": f"r{row}s{num}",
        "row": row,
        "number": num,
        "category": "superlux",
        "price": LUX_PRICE,
    }


def build_layout_template() -> dict:
    rows: list[dict] = []

    for row in range(1, 7):
        seats = [_good(row, i) for i in range(1, 13)]
        rows.append({"row": row, "seats": seats})

    for row in range(7, 11):
        seats = [_good(row, i) for i in range(1, 19)]
        rows.append({"row": row, "seats": seats})

    row11: list[dict | None] = []
    num = 1
    for pair in range(6):
        row11.append(_lux(11, num))
        num += 1
        row11.append(_lux(11, num))
        num += 1
        if pair < 5:
            row11.append(None)
    rows.append({"row": 11, "seats": row11})

    return {"rows": rows, "seedSoldIds": SEED_SOLD_IDS}
