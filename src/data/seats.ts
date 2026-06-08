export type SeatCategory = 'good' | 'superlux';

export interface CinemaSeat {
  id: string;
  row: number;
  number: number;
  category: SeatCategory;
  price: number;
  sold: boolean;
}

export interface SeatRow {
  row: number;
  seats: (CinemaSeat | null)[];
}

const GOOD_PRICE = 19;
const LUX_PRICE = 30;

function goodSeat(row: number, num: number, sold = false): CinemaSeat {
  return {
    id: `r${row}s${num}`,
    row,
    number: num,
    category: 'good',
    price: GOOD_PRICE,
    sold,
  };
}

function luxSeat(row: number, num: number, sold = false): CinemaSeat {
  return {
    id: `r${row}s${num}`,
    row,
    number: num,
    category: 'superlux',
    price: LUX_PRICE,
    sold,
  };
}

/** Схема залу як на референсі: ряди 1–6 (12 місць), 7–10 (18), 11 (Super Lux парами) */
export function buildHallLayout(): SeatRow[] {
  const rows: SeatRow[] = [];

  const soldGood = new Set(['r3s5', 'r5s8', 'r8s12', 'r9s3']);

  for (let row = 1; row <= 6; row++) {
    const seats: (CinemaSeat | null)[] = [];
    for (let i = 1; i <= 12; i++) {
      const s = goodSeat(row, i, soldGood.has(`r${row}s${i}`));
      seats.push(s);
    }
    rows.push({ row, seats });
  }

  for (let row = 7; row <= 10; row++) {
    const seats: (CinemaSeat | null)[] = [];
    for (let i = 1; i <= 18; i++) {
      seats.push(goodSeat(row, i, soldGood.has(`r${row}s${i}`)));
    }
    rows.push({ row, seats });
  }

  // Ряд 11 — Super Lux парами з проходами
  const row11: (CinemaSeat | null)[] = [];
  let num = 1;
  for (let pair = 0; pair < 6; pair++) {
    row11.push(luxSeat(11, num++, pair === 2));
    row11.push(luxSeat(11, num++));
    if (pair < 5) row11.push(null);
  }
  rows.push({ row: 11, seats: row11 });

  return rows;
}

export function getSeatById(id: string): CinemaSeat | undefined {
  for (const row of buildHallLayout()) {
    for (const seat of row.seats) {
      if (seat?.id === id) return seat;
    }
  }
  return undefined;
}

export const SEAT_COLORS = {
  good: '#8ECAE6',
  goodSelected: '#4A9EC7',
  superlux: '#2EC4B6',
  superluxSelected: '#1A9E92',
  sold: '#C8C8C8',
} as const;
