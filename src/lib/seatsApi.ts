import { API_BASE } from './config';

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

export interface SeatZone {
  category: SeatCategory;
  name: string;
  price: number;
  color?: string;
}

export interface SeatLayoutResponse {
  rows: SeatRow[];
  colors: Record<string, string>;
  zones: SeatZone[];
}

export async function fetchSeatLayout(params: {
  itemId: string;
  dateLabel: string;
  time: string;
  hall: string;
}): Promise<SeatLayoutResponse> {
  const q = new URLSearchParams({
    item_id: params.itemId,
    date_label: params.dateLabel,
    time: params.time,
    hall: params.hall,
  });
  const res = await fetch(`${API_BASE}/seats/layout?${q}`);
  if (!res.ok) throw new Error('Failed to load seat layout');
  return res.json();
}
