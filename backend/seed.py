from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from db import Event, Order, OrderTicket, Return, utcnow

Q = "?w=800&h=450&fit=crop&auto=format&q=80"


def img(photo_id: str) -> str:
    return f"https://images.unsplash.com/{photo_id}{Q}"


CHIBUZOR_1 = "https://tickets.tm1.website/assets/assets/concert-chibuzor-1.f0bf3b5a77902a4f78e336fac689b651.png"
CHIBUZOR_2 = "https://tickets.tm1.website/assets/assets/concert-chibuzor-2.3f2604e10c1a9845c4a443e315b45eb2.png"
CHIBUZOR_3 = "https://tickets.tm1.website/assets/assets/concert-chibuzor-3.c198a9fa2c255afdc276ec8335093dab.png"


def sections(price_from: float, price_to: float) -> str:
    return json.dumps(
        [
            {"id": "sec-a", "name": "General", "price": price_from},
            {"id": "sec-b", "name": "Premium", "price": price_to},
        ]
    )


def movie_meta(**kwargs) -> str:
    return json.dumps(kwargs)


CATALOG_EVENTS = [
    ("c1", "Chibuzor Okoye: Lead & Inspire", "concerts", "CONCERTS", "Grand Arena", "2026-06-13", "20:00", "Jun 13, Sat", "8:00 PM", 59, 199, CHIBUZOR_1, True,
     "An inspiring live experience with Chibuzor Okoye — leadership, motivation, and impact on stage."),
    ("c2", "Chibuzor Okoye: Live Keynote", "concerts", "CONCERTS", "City Hall Auditorium", "2026-06-15", "19:30", "Jun 15, Mon", "7:30 PM", 45, 120, CHIBUZOR_2, False,
     "A powerful keynote performance blending storytelling, vision, and audience engagement."),
    ("c3", "Chibuzor Okoye: Impact Night", "concerts", "CONCERTS", "Brooklyn Steel", "2026-06-20", "21:00", "Jun 20, Sat", "9:00 PM", 75, 250, CHIBUZOR_3, False,
     "An evening dedicated to impact — music, message, and momentum with Chibuzor Okoye."),
    ("c4", "Jazz Under the Stars", "concerts", "CONCERTS", "Hollywood Bowl", "2026-06-22", "18:30", "Jun 22, Mon", "6:30 PM", 35, 95, img("photo-1511671782779-c97d3d27a1d4"), False, ""),
    ("c5", "Indie Night: The Wanderers", "concerts", "CONCERTS", "The Fillmore", "2026-06-28", "20:30", "Jun 28, Sat", "8:30 PM", 28, 65, img("photo-1501281668745-f7f57925c3b4"), False, ""),
    ("t1", "Hamlet", "theater", "THEATER", "Royal National Theatre", "2026-06-14", "19:00", "Jun 14, Sun", "7:00 PM", 40, 110, img("photo-1585699324551-f6c309eedeca"), True, ""),
    ("t2", "The Phantom of the Opera", "theater", "THEATER", "Her Majesty's Theatre", "2026-06-16", "19:30", "Jun 16, Tue", "7:30 PM", 55, 180, img("photo-1514306191717-452ec28c7814"), False, ""),
    ("t3", "A Midsummer Night's Dream", "theater", "THEATER", "Shakespeare's Globe", "2026-06-19", "18:00", "Jun 19, Fri", "6:00 PM", 25, 75, img("photo-1503676260728-1c00da094a0b"), False, ""),
    ("t4", "Death of a Salesman", "theater", "THEATER", "Broadway Theatre", "2026-06-21", "20:00", "Jun 21, Sun", "8:00 PM", 50, 150, img("photo-1516280440614-37939bbacd81"), False, ""),
    ("k1", "The Magic Puppet Show", "kids", "KIDS", "Children's Theatre Company", "2026-06-14", "11:00", "Jun 14, Sun", "11:00 AM", 15, 30, img("photo-1516627145497-ae6968895b74"), True, ""),
    ("k2", "Panda's Big Adventure", "kids", "KIDS", "Family Stage", "2026-06-15", "12:00", "Jun 15, Mon", "12:00 PM", 18, 35, img("photo-1530103862676-de8c9debad1d"), False, ""),
    ("k3", "Ice Circus Spectacular", "kids", "KIDS", "City Arena", "2026-06-18", "16:00", "Jun 18, Thu", "4:00 PM", 30, 80, img("photo-1516450360452-9312f5e86fc7"), False, ""),
    ("k4", "Shrek: The Musical", "kids", "KIDS", "Grand Opera House", "2026-06-22", "13:00", "Jun 22, Sun", "1:00 PM", 35, 90, img("photo-1511795409834-ef04bbd61622"), False, ""),
    ("s1", "Open Mic Comedy Night", "standup", "STAND-UP", "The Comedy Cellar", "2026-06-13", "20:00", "Jun 13, Sat", "8:00 PM", 20, 45, img("photo-1492684223066-81342ee5ff30"), True, ""),
    ("s2", "Dave Reynolds: Live", "standup", "STAND-UP", "Laugh Factory", "2026-06-17", "19:30", "Jun 17, Wed", "7:30 PM", 45, 85, img("photo-1587825140708-dfaf72ae4b04"), False, ""),
    ("s3", "Friday Night Stand-Up", "standup", "STAND-UP", "Caroline's on Broadway", "2026-06-20", "21:00", "Jun 20, Sat", "9:00 PM", 30, 60, img("photo-1540039155733-5bb30b53aa14"), False, ""),
    ("s4", "Roast Battle Championship", "standup", "STAND-UP", "The Improv", "2026-06-25", "20:30", "Jun 25, Thu", "8:30 PM", 25, 50, img("photo-1529156069898-49953e39b3ac"), False, ""),
]

MOVIES = [
    ("1", "Minions & Monsters", img("photo-1558618666-fcd25c85cd64"), "PG", "2D | 3D | SDH", 8.2, "JUN 26", "1h 25m", "Adventure, Animation, Comedy, Family", "June 26, 2026",
     "The Minions return in a brand-new adventure! This time they meet extraordinary little monsters who change their lives forever."),
    ("2", "The Neighbors Upstairs", img("photo-1489599849927-2ee91cede3ba"), "R", "2D | SDH", 7.4, "JUN 18", "1h 48m", "Comedy, Drama", "June 18, 2026",
     "A quiet family of three suddenly discovers that a loud crew has moved in upstairs with no boundaries."),
    ("3", "Dune: Part Two", img("photo-1536440136628-849c177e76a1"), "PG-13", "2D | IMAX", 8.8, "JUN 20", "2h 46m", "Sci-Fi, Adventure, Drama", "June 20, 2026",
     "Paul Atreides unites with Chani and the Fremen to avenge the destruction of his family."),
    ("4", "Midnight in Paris", img("photo-1440404653325-ab127d49abc1"), "PG-13", "2D | SDH", 8.0, "JUN 24", "1h 34m", "Romance, Fantasy, Comedy", "June 24, 2026",
     "A nostalgic screenwriter finds himself mysteriously transported to 1920s Paris every night at midnight."),
]

COMING_SOON = [
    ("cs1", "movie", "Avatar: Fire and Ash", img("photo-1536440136628-849c177e76a1"), "PG-13", "2D | 3D | IMAX", 9.1, "JUL 18", "3h 12m", "Sci-Fi, Adventure, Action", "July 18, 2026", None),
    ("cs2", "movie", "Wicked: For Good", img("photo-1514306191717-452ec28c7814"), "PG", "2D | SDH", 8.7, "AUG 8", "2h 18m", "Musical, Fantasy, Drama", "August 8, 2026", None),
    ("cs3", "event", "Taylor Swift | The Eras Tour", img("photo-1514525253161-7a46d19cd819"), "All Ages", "Concert", 9.5, "SEP 5", "3h", "Concert", "September 5, 2026", "MetLife Stadium"),
    ("cs4", "movie", "Mission: Impossible 9", img("photo-1440404653325-ab127d49abc1"), "PG-13", "2D | IMAX", 8.4, "OCT 3", "2h 38m", "Action, Thriller", "October 3, 2026", None),
    ("cs5", "event", "Disney on Ice: Magic Kingdom", img("photo-1516450360452-9312f5e86fc7"), "All Ages", "Family", 8.9, "NOV 12", "2h", "Family", "November 12, 2026", "Barclays Center"),
    ("cs6", "movie", "Gladiator II", img("photo-1585699324551-f6c309eedeca"), "R", "2D | SDH", 8.3, "DEC 20", "2h 28m", "Action, Drama, History", "December 20, 2026", None),
]


def seed_catalog(db: Session) -> None:
    now = utcnow()
    for row in CATALOG_EVENTS:
        (eid, title, cat, admin_cat, venue, iso_date, iso_time, disp_date, disp_time, p_from, p_to, image, top, desc) = row
        db.add(
            Event(
                id=eid,
                title=title,
                description=desc or f"Live event at {venue}.",
                venue=venue,
                date=iso_date,
                time=iso_time,
                category=admin_cat,
                image_url=image,
                price_from=p_from,
                price_to=p_to,
                top=top,
                kind="event",
                hall_map_image=None,
                sections=sections(p_from, p_to),
                movie_meta=json.dumps({"displayDate": disp_date, "displayTime": disp_time, "catalogCategory": cat}),
                is_coming_soon=False,
                created_at=now,
                updated_at=now,
            )
        )

    for mid, title, image, age, formats, rating, next_sess, duration, genres, release, desc in MOVIES:
        db.add(
            Event(
                id=mid,
                title=title,
                description=desc,
                venue="Hudson Point Cinema",
                date="2026-06-26",
                time="19:00",
                category="CINEMA",
                image_url=image,
                price_from=12,
                price_to=30,
                top=mid == "1",
                kind="movie",
                hall_map_image=None,
                sections=sections(12, 30),
                movie_meta=movie_meta(
                    originalTitle=title,
                    ageRating=age,
                    formats=formats,
                    rating=rating,
                    nextSessionDate=next_sess,
                    duration=duration,
                    genres=genres,
                    releaseDate=release,
                    catalogCategory="cinema",
                ),
                is_coming_soon=False,
                created_at=now,
                updated_at=now,
            )
        )

    for csid, kind, title, image, age, formats, rating, next_sess, duration, genres, release, venue in COMING_SOON:
        db.add(
            Event(
                id=csid,
                title=title,
                description=f"Coming soon — {title}.",
                venue=venue or "TBA",
                date="2026-07-01",
                time="19:00",
                category="CINEMA" if kind == "movie" else "CONCERTS",
                image_url=image,
                price_from=25,
                price_to=150,
                top=False,
                kind=kind,
                hall_map_image=None,
                sections=sections(25, 150),
                movie_meta=movie_meta(
                    originalTitle=title,
                    ageRating=age,
                    formats=formats,
                    rating=rating,
                    nextSessionDate=next_sess,
                    duration=duration,
                    genres=genres,
                    releaseDate=release,
                    catalogCategory=kind,
                    venue=venue,
                ),
                is_coming_soon=True,
                created_at=now,
                updated_at=now,
            )
        )


def seed_orders_and_returns(db: Session) -> None:
    now = datetime.now(timezone.utc)

    orders_data = [
        ("ord-1001", "ORD-100245", "Olivia Carter", "olivia.carter@gmail.com", "(212) 555-0143",
         "Chibuzor Okoye: Lead & Inspire", "Jun 13", "20:00", "1", "paid", 2,
         [("4821903", "Section A", 3, 7, 199), ("4821904", "Section A", 3, 8, 199)], 2),
        ("ord-1002", "ORD-100246", "James Wilson", "jwilson@outlook.com", "(347) 555-0198",
         "Chibuzor Okoye: Lead & Inspire", "Jun 13", "20:00", "1", "paid", 6,
         [("5530021", "Section B", 9, 14, 129)], 1),
        ("ord-1003", "ORD-100247", "Sofia Nguyen", "sofia.nguyen@gmail.com", "(718) 555-0177",
         "Chibuzor Okoye: Lead & Inspire", "Jun 13", "20:00", "1", "pending", 26,
         [("6120488", "Section C", 21, 2, 79), ("6120489", "Section C", 21, 3, 79), ("6120490", "Section C", 21, 4, 79)], 3),
        ("ord-1004", "ORD-100248", "Daniel Brooks", "d.brooks@yahoo.com", "(212) 555-0102",
         "Chibuzor Okoye: Lead & Inspire", "Jun 13", "20:00", "1", "failed", 50,
         [("7001245", "Section A", 1, 12, 199)], 1),
        ("ord-1005", "ORD-100249", "Emma Richardson", "emma.r@icloud.com", "(917) 555-0134",
         "Chibuzor Okoye: Lead & Inspire", "Jun 13", "20:00", "1", "paid", 18,
         [("8842101", "Section B", 5, 11, 129), ("8842102", "Section B", 5, 12, 129)], 2),
    ]

    for oid, onum, name, email, phone, etitle, dlabel, t, hall, status, hours_ago, tickets, _ in orders_data:
        created = now - timedelta(hours=hours_ago)
        db.add(
            Order(
                id=oid,
                order_number=onum,
                customer_name=name,
                customer_email=email,
                customer_phone=phone,
                event_title=etitle,
                session_date_label=dlabel,
                session_time=t,
                session_hall=hall,
                payment_status=status,
                payment_method="Card · Stripe",
                from_app=False,
                created_at=created,
            )
        )
        for tnum, section, row, seat, price in tickets:
            db.add(
                OrderTicket(
                    order_id=oid,
                    ticket_number=tnum,
                    section=section,
                    row=row,
                    seat=seat,
                    price=price,
                    status="active",
                )
            )

    returns_data = [
        ("ret-demo-1", "ord-1001", "ORD-100245", "4821903", "Chibuzor Okoye: Lead & Inspire",
         "Olivia Carter", "olivia.carter@gmail.com", "(212) 555-0143", 199, "Customer request", 45),
        ("ret-demo-2", "ord-1002", "ORD-100246", "5530021", "Chibuzor Okoye: Lead & Inspire",
         "James Wilson", "jwilson@outlook.com", "(347) 555-0198", 129, "Unable to attend", 4 * 60),
        ("ret-demo-3", "ord-1005", "ORD-100249", "8842101", "Chibuzor Okoye: Lead & Inspire",
         "Emma Richardson", "emma.r@icloud.com", "(917) 555-0134", 129, "Event cancelled", 14 * 60),
        ("ret-demo-4", "ord-1005", "ORD-100249", "8842102", "Chibuzor Okoye: Lead & Inspire",
         "Emma Richardson", "emma.r@icloud.com", "(917) 555-0134", 129, "Event cancelled", 14 * 60),
    ]

    for rid, oid, onum, tnum, etitle, name, email, phone, price, reason, mins_ago in returns_data:
        db.add(
            Return(
                id=rid,
                order_id=oid,
                order_number=onum,
                ticket_number=tnum,
                event_title=etitle,
                customer_name=name,
                customer_email=email,
                customer_phone=phone,
                price=price,
                reason=reason,
                returned_at=now - timedelta(minutes=mins_ago),
            )
        )
        ticket = (
            db.query(OrderTicket)
            .filter(OrderTicket.order_id == oid, OrderTicket.ticket_number == tnum)
            .first()
        )
        if ticket:
            ticket.status = "returned"


def seed_if_empty(db: Session) -> None:
    from db import is_seeded
    from seed_settings import has_settings, seed_settings

    if not is_seeded(db):
        seed_catalog(db)
        seed_orders_and_returns(db)
    if not has_settings(db):
        seed_settings(db)
    db.commit()
