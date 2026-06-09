const TICKET_CATEGORY_LABELS: Record<string, string> = {
  concerts: 'Concert',
  theater: 'Theater',
  kids: 'Family',
  standup: 'Stand-Up',
  'stand-up': 'Stand-Up',
  cinema: 'Movie',
};

export function ticketCategoryLabel(category?: string): string {
  if (!category) return 'Event';
  const key = category.toLowerCase();
  return TICKET_CATEGORY_LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
}
