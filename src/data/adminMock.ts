/**
 * Demo admin data — hardcoded + derived from the same mock catalog and
 * in-app purchase store. No real backend required.
 */
import { movies } from './movies';
import { events } from './events';
import { getPurchasedTickets } from '../lib/mockStore';

export interface AdminEventRow {
  id: string;
  title: string;
  type: 'movie' | 'event';
  category: string;
  venue: string;
  nextSession: string;
  priceFrom: number;
  soldTickets: number;
  revenue: number;
}

export interface AdminTicketRow {
  id: number;
  ticketNumber: string;
  eventTitle: string;
  dateLabel: string;
  time: string;
  hall: string;
  row: number;
  seat: number;
  price: number;
  purchasedAt: string;
}

export interface AdminDashboardStats {
  totalEvents: number;
  totalMovies: number;
  totalSoldTickets: number;
  totalRevenue: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  concerts: 'Concert',
  theater: 'Theater',
  kids: 'Family',
  standup: 'Stand-Up',
  cinema: 'Cinema',
  home: 'Featured',
};

function soldForItem(itemId: string) {
  const tickets = getPurchasedTickets().filter((t) => t.item_id === itemId);
  const revenue = tickets.reduce((sum, t) => sum + t.price, 0);
  return { count: tickets.length, revenue };
}

export function getAdminEvents(): AdminEventRow[] {
  const movieRows: AdminEventRow[] = movies.map((m) => {
    const sold = soldForItem(m.id);
    return {
      id: m.id,
      title: m.title,
      type: 'movie',
      category: 'Cinema',
      venue: 'Hudson Point Cinema',
      nextSession: m.nextSessionDate,
      priceFrom: 19,
      soldTickets: sold.count,
      revenue: sold.revenue,
    };
  });

  const eventRows: AdminEventRow[] = events.map((e) => {
    const sold = soldForItem(e.id);
    return {
      id: e.id,
      title: e.title,
      type: 'event',
      category: CATEGORY_LABELS[e.category] ?? 'Event',
      venue: e.venue ?? 'Main Hall',
      nextSession: `${e.date} · ${e.time}`,
      priceFrom: e.priceFrom ?? 29,
      soldTickets: sold.count,
      revenue: sold.revenue,
    };
  });

  return [...movieRows, ...eventRows];
}

export function getAdminTickets(): AdminTicketRow[] {
  return getPurchasedTickets().map((t) => ({
    id: t.id,
    ticketNumber: t.ticket_number,
    eventTitle: t.title,
    dateLabel: t.date_label,
    time: t.time,
    hall: t.hall,
    row: t.row,
    seat: t.seat,
    price: t.price,
    purchasedAt: t.created_at,
  }));
}

export function getAdminDashboardStats(): AdminDashboardStats {
  const tickets = getPurchasedTickets();
  return {
    totalEvents: events.length,
    totalMovies: movies.length,
    totalSoldTickets: tickets.length,
    totalRevenue: tickets.reduce((sum, t) => sum + t.price, 0),
  };
}
