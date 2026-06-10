import { getApiBase } from './config';
import { fetchWithTimeout } from './fetchWithTimeout';

export interface Showtime {
  time: string;
  formats: string;
  endTime?: string;
  room?: string;
}

export interface CinemaHall {
  id: string;
  name: string;
  fullName: string;
  address: string;
  imageUrl: string;
  highlighted?: boolean;
  showtimes: Showtime[];
}

export interface DateOption {
  id: string;
  day: string;
  date: string;
  label: string;
}

export interface ShowtimesResponse {
  halls: CinemaHall[];
  dates: DateOption[];
  activeDate: DateOption;
  isConcert: boolean;
  formatFilters: string[];
}

export async function fetchShowtimes(itemId: string, dateId: string): Promise<ShowtimesResponse> {
  const res = await fetchWithTimeout(
    `${getApiBase()}/showtimes/halls/${encodeURIComponent(itemId)}?date_id=${encodeURIComponent(dateId)}`,
  );
  if (!res.ok) throw new Error('Failed to load showtimes');
  return res.json();
}

export async function fetchShowtimeDates(): Promise<DateOption[]> {
  const res = await fetchWithTimeout(`${getApiBase()}/showtimes/dates`);
  if (!res.ok) throw new Error('Failed to load dates');
  return res.json();
}
