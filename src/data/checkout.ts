import type { SeatCategory } from './seats';
import type { SelectedSession } from './showtimes';

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
  seatCount: number;
  total: number;
}
