from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db import get_db, init_db
from routers import admin, catalog, locations, returns, seats, showtimes, tickets
from seed import seed_if_empty

app = FastAPI(title="Event Ticketing API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin.router)
app.include_router(catalog.router)
app.include_router(locations.router)
app.include_router(showtimes.router)
app.include_router(seats.router)
app.include_router(tickets.router)
app.include_router(returns.router)


@app.on_event("startup")
def on_startup() -> None:
    init_db()
    with get_db() as db:
        seed_if_empty(db)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
