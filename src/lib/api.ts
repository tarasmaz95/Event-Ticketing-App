import type { CheckoutOrder } from '../data/checkout';
import type { SavedTicket } from '../types/ticket';
import {
  getPurchasedTickets,
  savePurchaseToStore,
  sendTicketEmailFromStore,
} from './mockStore';

export type { SavedTicket } from '../types/ticket';

function primaryFormat(formats: string): string {
  return formats.split(/\s+/)[0] || '2D';
}

/** Demo mode — all data is mocked and stored in memory / localStorage. */
export const DEMO_MODE = true;

export async function fetchTickets(): Promise<SavedTicket[]> {
  await delay(120);
  return getPurchasedTickets();
}

export async function savePurchase(order: CheckoutOrder): Promise<SavedTicket[]> {
  await delay(180);
  return savePurchaseToStore(order);
}

export function formatFromSession(formats: string): string {
  return primaryFormat(formats);
}

export async function sendTicketEmail(ticketId: number): Promise<void> {
  await delay(400);
  sendTicketEmailFromStore(ticketId);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
