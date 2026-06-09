export interface SavedTicket {
  id: number;
  ticket_number: string;
  item_id: string;
  title: string;
  image_url: string;
  format: string;
  category: string;
  date_label: string;
  time: string;
  hall: string;
  row: number;
  seat: number;
  price: number;
  created_at: string;
}
