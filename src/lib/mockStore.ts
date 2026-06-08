import type { CheckoutOrder } from '../data/checkout';
import type { SavedTicket } from '../types/ticket';

const STORAGE_KEY = 'cinema-app-demo-tickets';

interface StoreState {
  tickets: SavedTicket[];
  nextId: number;
}

let state: StoreState = { tickets: [], nextId: 1 };

function hallLabel(room: string): string {
  const match = room.match(/\d+/);
  return match ? match[0] : room;
}

function loadState(): StoreState {
  if (typeof globalThis === 'undefined') return state;
  try {
    const storage = (globalThis as { localStorage?: Storage }).localStorage;
    if (!storage) return state;
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return state;
    const parsed = JSON.parse(raw) as StoreState;
    if (!Array.isArray(parsed.tickets) || typeof parsed.nextId !== 'number') return state;
    return parsed;
  } catch {
    return state;
  }
}

function persistState(): void {
  if (typeof globalThis === 'undefined') return;
  try {
    const storage = (globalThis as { localStorage?: Storage }).localStorage;
    storage?.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Demo store — ignore persistence errors.
  }
}

function randomTicketNumber(): string {
  return String(Math.floor(1_000_000 + Math.random() * 9_000_000));
}

state = loadState();

export function getPurchasedTickets(): SavedTicket[] {
  return [...state.tickets].sort((a, b) => b.id - a.id);
}

export function savePurchaseToStore(order: CheckoutOrder): SavedTicket[] {
  const createdAt = new Date().toISOString();
  const created: SavedTicket[] = [];

  for (const seat of order.seats) {
    const ticket: SavedTicket = {
      id: state.nextId++,
      ticket_number: randomTicketNumber(),
      item_id: order.itemId,
      title: order.itemTitle,
      image_url: order.itemImageUrl,
      format: order.format,
      date_label: order.session.dateLabel,
      time: order.session.time,
      hall: hallLabel(order.session.room),
      row: seat.row,
      seat: seat.number,
      price: seat.price,
      created_at: createdAt,
    };
    state.tickets.push(ticket);
    created.push(ticket);
  }

  persistState();
  return created;
}

export function sendTicketEmailFromStore(ticketId: number): void {
  const ticket = state.tickets.find((t) => t.id === ticketId);
  if (!ticket) throw new Error('Ticket not found');
}

export function clearPurchasedTickets(): void {
  state = { tickets: [], nextId: 1 };
  persistState();
}

export function returnTicketsByOrderKey(orderKey: string): number {
  const [createdAt, itemId] = orderKey.split('|');
  if (!createdAt || !itemId) return 0;
  const before = state.tickets.length;
  state.tickets = state.tickets.filter(
    (t) => !(t.created_at === createdAt && t.item_id === itemId),
  );
  const removed = before - state.tickets.length;
  if (removed > 0) persistState();
  return removed;
}
