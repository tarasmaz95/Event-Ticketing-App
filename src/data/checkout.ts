import type { SeatCategory } from './seats';
import type { SelectedSession } from './showtimes';
import type { SeatZone } from '../lib/seatsApi';

export interface OrderSeat {
  id: string;
  row: number;
  number: number;
  price: number;
  category: SeatCategory;
}

export interface CheckoutOrder {
  itemId: string;
  itemTitle: string;
  itemImageUrl: string;
  format: string;
  session: SelectedSession;
  seats: OrderSeat[];
  zones?: SeatZone[];
  seatCount: number;
  total: number;
}
