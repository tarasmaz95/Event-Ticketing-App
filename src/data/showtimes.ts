export interface Showtime {
  time: string;
  formats: string;
  endTime?: string;
  room?: string;
}

import { IMAGES } from './images';
import { getEventById } from './events';

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

export interface SelectedSession {
  hallId: string;
  hallName: string;
  hallFullName: string;
  time: string;
  endTime: string;
  room: string;
  formats: string;
  dateLabel: string;
}

export const dateOptions: DateOption[] = [
  { id: 'd1', day: 'FRI', date: '26', label: 'June 26' },
  { id: 'd2', day: 'SAT', date: '27', label: 'June 27' },
  { id: 'd3', day: 'SUN', date: '28', label: 'June 28' },
  { id: 'd4', day: 'MON', date: '29', label: 'June 29' },
  { id: 'd5', day: 'TUE', date: '30', label: 'June 30' },
  { id: 'd6', day: 'WED', date: '1', label: 'July 1' },
  { id: 'd7', day: 'THU', date: '2', label: 'July 2' },
];

export const formatFilters = ['ALL', '2D', '3D', 'SDH'] as const;
export type FormatFilter = (typeof formatFilters)[number];

const CONCERT_TIME_POOL: Showtime[] = [
  { time: '10:00', endTime: '12:30', room: 'Main Arena', formats: 'General Admission' },
  { time: '11:30', endTime: '13:45', room: 'Main Arena', formats: 'General Admission' },
  { time: '14:00', endTime: '16:15', room: 'Main Arena', formats: 'General Admission' },
  { time: '18:00', endTime: '20:15', room: 'Main Arena', formats: 'General Admission' },
  { time: '19:30', endTime: '21:45', room: 'Main Arena', formats: 'General Admission' },
  { time: '20:00', endTime: '22:30', room: 'Main Arena', formats: 'General Admission' },
  { time: '21:00', endTime: '23:15', room: 'Main Arena', formats: 'General Admission' },
];

export function getShowtimeForDate(dateId: string): Showtime {
  let hash = 0;
  for (let i = 0; i < dateId.length; i += 1) {
    hash = (hash * 31 + dateId.charCodeAt(i)) | 0;
  }
  return CONCERT_TIME_POOL[Math.abs(hash) % CONCERT_TIME_POOL.length];
}

export function isConcertItem(itemId: string): boolean {
  return getEventById(itemId)?.category === 'concerts';
}

/** Concerts: single venue, single showtime (varies by selected date). */
export const concertHalls: CinemaHall[] = [
  {
    id: 'msg',
    name: 'Madison Square Garden',
    fullName: 'Madison Square Garden',
    address: '4 Pennsylvania Plaza, New York',
    imageUrl: IMAGES.venueMall,
    highlighted: true,
    showtimes: [
      { time: '20:00', endTime: '22:30', room: 'Main Arena', formats: 'General Admission' },
    ],
  },
];

export const cinemaHalls: CinemaHall[] = [
  {
    id: 'hudson-point',
    name: 'Hudson Point',
    fullName: 'Hudson Point Cinema',
    address: '415 West 42nd St, Manhattan',
    imageUrl: IMAGES.venueMall,
    highlighted: true,
    showtimes: [
      { time: '10:00', endTime: '11:25', room: 'Hall 2', formats: '2D SDH' },
      { time: '11:00', endTime: '12:25', room: 'Hall 1', formats: '2D SDH' },
      { time: '19:00', endTime: '20:25', room: 'Hall 3', formats: '3D SDH' },
      { time: '20:30', endTime: '21:55', room: 'Hall 2', formats: '2D SDH' },
    ],
  },
];

export function getHallsForItem(itemId: string): CinemaHall[] {
  const event = getEventById(itemId);
  if (event?.category === 'concerts') return concertHalls;
  return cinemaHalls;
}

export function filterShowtimes(showtimes: Showtime[], filter: FormatFilter): Showtime[] {
  if (filter === 'ALL') return showtimes;
  return showtimes.filter((s) => s.formats.includes(filter));
}
