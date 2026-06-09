import type { CheckoutOrder } from '../data/checkout';
import type { SavedTicket } from '../types/ticket';
import { API_BASE } from './config';

export type { SavedTicket } from '../types/ticket';

export const DEMO_MODE = false;

function primaryFormat(formats: string): string {
  return formats.split(/\s+/)[0] || '2D';
}

export async function fetchTickets(): Promise<SavedTicket[]> {
  const res = await fetch(`${API_BASE}/tickets`);
  if (!res.ok) throw new Error('Failed to load tickets');
  return res.json();
}

export async function savePurchase(
  order: CheckoutOrder,
  customer?: { name: string; email: string },
): Promise<SavedTicket[]> {
  const res = await fetch(`${API_BASE}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      item_id: order.itemId,
      title: order.itemTitle,
      image_url: order.itemImageUrl,
      format: order.format,
      date_label: order.session.dateLabel,
      time: order.session.time,
      hall: order.session.room,
      customer_name: customer?.name,
      customer_email: customer?.email,
      seats: order.seats.map((s) => ({
        row: s.row,
        seat: s.number,
        price: s.price,
      })),
    }),
  });
  if (!res.ok) throw new Error('Failed to save purchase');
  return res.json();
}

export function formatFromSession(formats: string): string {
  return primaryFormat(formats);
}

export async function sendTicketEmail(ticketId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/tickets/${ticketId}/email`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to send ticket email');
}

export async function returnOrder(
  orderKey: string,
  reason: string,
): Promise<{ ok: boolean; error?: string; count?: number; refundAmount?: number }> {
  const res = await fetch(`${API_BASE}/returns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderKey, reason }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || data.error || 'Failed to return tickets');
  }
  return data;
}
