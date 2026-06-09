export type {
  Showtime,
  CinemaHall,
  DateOption,
} from '../lib/showtimesApi';

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
