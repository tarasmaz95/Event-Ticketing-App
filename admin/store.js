const EVENTS_KEY = 'cinema-admin-events';
const ORDERS_KEY = 'cinema-admin-orders';
const PURCHASES_KEY = 'cinema-app-demo-tickets';
const RETURNS_KEY = 'cinema-admin-returns';

const RETURN_REASONS = [
  'Customer request',
  'Event cancelled',
  'Duplicate purchase',
  'Unable to attend',
  'Other',
];

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/* ───────────────────────── Events ───────────────────────── */

function loadEvents() {
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    if (!raw) return seedEvents();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : seedEvents();
  } catch {
    return seedEvents();
  }
}

function saveEvents(events) {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

function seedEvents() {
  const seeded = [
    {
      id: 'evt-demo-1',
      title: 'Neon Pulse World Tour',
      description:
        'An electrifying arena show with immersive visuals, live band, and surprise guest appearances. Doors open 90 minutes before showtime.',
      venue: 'Madison Square Garden',
      date: '2026-06-13',
      time: '20:00',
      category: 'CONCERTS',
      hallMapImage: null,
      sections: [
        { id: 'sec-a', name: 'Section A', price: 199 },
        { id: 'sec-b', name: 'Section B', price: 129 },
        { id: 'sec-c', name: 'Section C', price: 79 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  saveEvents(seeded);
  return seeded;
}

function getEvents() {
  return loadEvents();
}

function getEventById(id) {
  return loadEvents().find((e) => e.id === id) ?? null;
}

function createEvent(payload) {
  const events = loadEvents();
  const event = {
    id: uid(),
    title: payload.title.trim(),
    description: payload.description.trim(),
    venue: payload.venue.trim(),
    date: payload.date,
    time: payload.time,
    category: payload.category,
    hallMapImage: payload.hallMapImage ?? null,
    sections: payload.sections ?? [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  events.unshift(event);
  saveEvents(events);
  return event;
}

function updateEvent(id, payload) {
  const events = loadEvents();
  const idx = events.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  events[idx] = {
    ...events[idx],
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  saveEvents(events);
  return events[idx];
}

function deleteEvent(id) {
  const events = loadEvents().filter((e) => e.id !== id);
  saveEvents(events);
}

/* ───────────────────────── Orders ───────────────────────── */

function saveSeededOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function ensureDemoReturnOrder(orders) {
  if (orders.some((o) => o.id === 'ord-1005')) return orders;
  const now = Date.now();
  const hour = 3600 * 1000;
  orders.push({
    id: 'ord-1005',
    orderNumber: 'ORD-100249',
    customer: { name: 'Emma Richardson', email: 'emma.r@icloud.com', phone: '(917) 555-0134' },
    eventTitle: 'Neon Pulse World Tour',
    session: { dateLabel: 'Jun 13', time: '20:00', hall: '1' },
    paymentStatus: 'paid',
    paymentMethod: 'Card · Stripe',
    tickets: [
      { ticket_number: '8842101', section: 'Section B', row: 5, seat: 11, price: 129 },
      { ticket_number: '8842102', section: 'Section B', row: 5, seat: 12, price: 129 },
    ],
    createdAt: new Date(now - 18 * hour).toISOString(),
  });
  saveSeededOrders(orders);
  return orders;
}

function loadSeededOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) return seedOrders();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return seedOrders();
    return ensureDemoReturnOrder(parsed);
  } catch {
    return seedOrders();
  }
}

function seedOrders() {
  const now = Date.now();
  const hour = 3600 * 1000;
  const seeded = [
    {
      id: 'ord-1001',
      orderNumber: 'ORD-100245',
      customer: { name: 'Olivia Carter', email: 'olivia.carter@gmail.com', phone: '(212) 555-0143' },
      eventTitle: 'Neon Pulse World Tour',
      session: { dateLabel: 'Jun 13', time: '20:00', hall: '1' },
      paymentStatus: 'paid',
      paymentMethod: 'Card · Stripe',
      tickets: [
        { ticket_number: '4821903', section: 'Section A', row: 3, seat: 7, price: 199 },
        { ticket_number: '4821904', section: 'Section A', row: 3, seat: 8, price: 199 },
      ],
      createdAt: new Date(now - 2 * hour).toISOString(),
    },
    {
      id: 'ord-1002',
      orderNumber: 'ORD-100246',
      customer: { name: 'James Wilson', email: 'jwilson@outlook.com', phone: '(347) 555-0198' },
      eventTitle: 'Neon Pulse World Tour',
      session: { dateLabel: 'Jun 13', time: '20:00', hall: '1' },
      paymentStatus: 'paid',
      paymentMethod: 'Card · Stripe',
      tickets: [
        { ticket_number: '5530021', section: 'Section B', row: 9, seat: 14, price: 129 },
      ],
      createdAt: new Date(now - 6 * hour).toISOString(),
    },
    {
      id: 'ord-1003',
      orderNumber: 'ORD-100247',
      customer: { name: 'Sofia Nguyen', email: 'sofia.nguyen@gmail.com', phone: '(718) 555-0177' },
      eventTitle: 'Neon Pulse World Tour',
      session: { dateLabel: 'Jun 13', time: '20:00', hall: '1' },
      paymentStatus: 'pending',
      paymentMethod: 'Card · Stripe',
      tickets: [
        { ticket_number: '6120488', section: 'Section C', row: 21, seat: 2, price: 79 },
        { ticket_number: '6120489', section: 'Section C', row: 21, seat: 3, price: 79 },
        { ticket_number: '6120490', section: 'Section C', row: 21, seat: 4, price: 79 },
      ],
      createdAt: new Date(now - 26 * hour).toISOString(),
    },
    {
      id: 'ord-1004',
      orderNumber: 'ORD-100248',
      customer: { name: 'Daniel Brooks', email: 'd.brooks@yahoo.com', phone: '(212) 555-0102' },
      eventTitle: 'Neon Pulse World Tour',
      session: { dateLabel: 'Jun 13', time: '20:00', hall: '1' },
      paymentStatus: 'failed',
      paymentMethod: 'Card · Stripe',
      tickets: [
        { ticket_number: '7001245', section: 'Section A', row: 1, seat: 12, price: 199 },
      ],
      createdAt: new Date(now - 50 * hour).toISOString(),
    },
    {
      id: 'ord-1005',
      orderNumber: 'ORD-100249',
      customer: { name: 'Emma Richardson', email: 'emma.r@icloud.com', phone: '(917) 555-0134' },
      eventTitle: 'Neon Pulse World Tour',
      session: { dateLabel: 'Jun 13', time: '20:00', hall: '1' },
      paymentStatus: 'paid',
      paymentMethod: 'Card · Stripe',
      tickets: [
        { ticket_number: '8842101', section: 'Section B', row: 5, seat: 11, price: 129 },
        { ticket_number: '8842102', section: 'Section B', row: 5, seat: 12, price: 129 },
      ],
      createdAt: new Date(now - 18 * hour).toISOString(),
    },
  ];
  saveSeededOrders(seeded);
  return seeded;
}

/** Real purchases coming from the mobile app demo store (same origin only). */
function loadRealPurchases() {
  try {
    const raw = localStorage.getItem(PURCHASES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.tickets) ? parsed.tickets : [];
  } catch {
    return [];
  }
}

/** Group flat app tickets into orders (one order per checkout = same created_at). */
function purchasesToOrders() {
  const tickets = loadRealPurchases();
  if (!tickets.length) return [];

  const groups = new Map();
  for (const t of tickets) {
    const key = `${t.created_at}|${t.item_id}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(t);
  }

  let n = 0;
  return [...groups.values()].map((group) => {
    n += 1;
    const first = group[0];
    return {
      id: `app-${first.created_at}-${first.item_id}`,
      orderNumber: `APP-${String(first.id).padStart(5, '0')}`,
      customer: { name: 'App customer', email: '—', phone: '—' },
      eventTitle: first.title,
      session: { dateLabel: first.date_label, time: first.time, hall: first.hall },
      paymentStatus: 'paid',
      paymentMethod: 'Card · Stripe',
      fromApp: true,
      tickets: group.map((t) => ({
        ticket_number: t.ticket_number,
        section: t.format ? `${t.format}` : 'General',
        row: t.row,
        seat: t.seat,
        price: t.price,
      })),
      createdAt: first.created_at,
    };
  });
}

/* ───────────────────────── Returns ───────────────────────── */

function seedReturns() {
  const now = Date.now();
  const hour = 3600 * 1000;
  const seeded = [
    {
      id: 'ret-demo-1',
      orderId: 'ord-1001',
      orderNumber: 'ORD-100245',
      ticketNumber: '4821903',
      eventTitle: 'Neon Pulse World Tour',
      customer: { name: 'Olivia Carter', email: 'olivia.carter@gmail.com', phone: '(212) 555-0143' },
      price: 199,
      reason: 'Customer request',
      returnedAt: new Date(now - 45 * 60 * 1000).toISOString(),
    },
    {
      id: 'ret-demo-2',
      orderId: 'ord-1002',
      orderNumber: 'ORD-100246',
      ticketNumber: '5530021',
      eventTitle: 'Neon Pulse World Tour',
      customer: { name: 'James Wilson', email: 'jwilson@outlook.com', phone: '(347) 555-0198' },
      price: 129,
      reason: 'Unable to attend',
      returnedAt: new Date(now - 4 * hour).toISOString(),
    },
    {
      id: 'ret-demo-3',
      orderId: 'ord-1005',
      orderNumber: 'ORD-100249',
      ticketNumber: '8842101',
      eventTitle: 'Neon Pulse World Tour',
      customer: { name: 'Emma Richardson', email: 'emma.r@icloud.com', phone: '(917) 555-0134' },
      price: 129,
      reason: 'Event cancelled',
      returnedAt: new Date(now - 14 * hour).toISOString(),
    },
    {
      id: 'ret-demo-4',
      orderId: 'ord-1005',
      orderNumber: 'ORD-100249',
      ticketNumber: '8842102',
      eventTitle: 'Neon Pulse World Tour',
      customer: { name: 'Emma Richardson', email: 'emma.r@icloud.com', phone: '(917) 555-0134' },
      price: 129,
      reason: 'Event cancelled',
      returnedAt: new Date(now - 14 * hour).toISOString(),
    },
  ];
  localStorage.setItem(RETURNS_KEY, JSON.stringify(seeded));
  return seeded;
}

function loadReturns() {
  try {
    const raw = localStorage.getItem(RETURNS_KEY);
    if (!raw) return seedReturns();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return seedReturns();
    if (!parsed.length) return seedReturns();
    return parsed;
  } catch {
    return seedReturns();
  }
}

function saveReturns(returns) {
  localStorage.setItem(RETURNS_KEY, JSON.stringify(returns));
}

function ticketKey(ticketNumber) {
  return String(ticketNumber);
}

function enrichOrderWithReturns(order) {
  const returns = loadReturns().filter((r) => r.orderId === order.id);
  const returnedMap = new Map(returns.map((r) => [ticketKey(r.ticketNumber), r]));

  const tickets = order.tickets.map((t) => {
    const info = returnedMap.get(ticketKey(t.ticket_number));
    return {
      ...t,
      status: info ? 'returned' : 'active',
      returnInfo: info ?? null,
    };
  });

  const activeTickets = tickets.filter((t) => t.status === 'active');
  const returnedTickets = tickets.filter((t) => t.status === 'returned');
  let refundStatus = 'none';
  if (returnedTickets.length && activeTickets.length) refundStatus = 'partial';
  if (returnedTickets.length && !activeTickets.length) refundStatus = 'full';

  return {
    ...order,
    tickets,
    refundStatus,
    activeTicketCount: activeTickets.length,
    returnedTicketCount: returnedTickets.length,
    refundedAmount: returnedTickets.reduce((sum, t) => sum + (t.price || 0), 0),
  };
}

function canReturnTicket(order, ticketNumber) {
  if (order.paymentStatus !== 'paid') return false;
  const ticket = order.tickets.find((t) => ticketKey(t.ticket_number) === ticketKey(ticketNumber));
  return Boolean(ticket && ticket.status === 'active');
}

function returnTicket(orderId, ticketNumber, reason = 'Customer request') {
  const order = getOrderById(orderId);
  if (!order) return { ok: false, error: 'Order not found.' };
  if (!canReturnTicket(order, ticketNumber)) {
    return { ok: false, error: 'This ticket cannot be returned.' };
  }

  const ticket = order.tickets.find((t) => ticketKey(t.ticket_number) === ticketKey(ticketNumber));
  const returns = loadReturns();
  if (returns.some((r) => r.orderId === orderId && ticketKey(r.ticketNumber) === ticketKey(ticketNumber))) {
    return { ok: false, error: 'Ticket already returned.' };
  }

  returns.unshift({
    id: uid(),
    orderId,
    orderNumber: order.orderNumber,
    ticketNumber: ticketKey(ticketNumber),
    eventTitle: order.eventTitle,
    customer: order.customer,
    price: ticket.price || 0,
    reason: RETURN_REASONS.includes(reason) ? reason : 'Other',
    returnedAt: new Date().toISOString(),
  });
  saveReturns(returns);

  return { ok: true, refundAmount: ticket.price || 0, ticketNumber: ticketKey(ticketNumber) };
}

function returnAllTickets(orderId, reason = 'Customer request') {
  const order = getOrderById(orderId);
  if (!order) return { ok: false, error: 'Order not found.' };
  if (order.paymentStatus !== 'paid') return { ok: false, error: 'Only paid orders can be refunded.' };

  const active = order.tickets.filter((t) => t.status === 'active');
  if (!active.length) return { ok: false, error: 'No active tickets to return.' };

  let total = 0;
  for (const t of active) {
    const result = returnTicket(orderId, t.ticket_number, reason);
    if (result.ok) total += result.refundAmount;
  }
  return { ok: true, count: active.length, refundAmount: total };
}

function getReturns() {
  return loadReturns().sort((a, b) => new Date(b.returnedAt) - new Date(a.returnedAt));
}

function orderTotal(order) {
  const tickets = order.tickets ?? [];
  return tickets
    .filter((t) => (t.status ?? 'active') === 'active')
    .reduce((sum, t) => sum + (t.price || 0), 0);
}

function getOrders() {
  const combined = [...purchasesToOrders(), ...loadSeededOrders()].map(enrichOrderWithReturns);
  return combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getOrderById(id) {
  const raw = [...purchasesToOrders(), ...loadSeededOrders()].find((o) => o.id === id);
  return raw ? enrichOrderWithReturns(raw) : null;
}

/* ───────────────────────── Tickets (flat) ───────────────────────── */

function getAllTickets() {
  const rows = [];
  for (const order of getOrders()) {
    for (const t of order.tickets) {
      rows.push({
        ...t,
        status: t.status ?? 'active',
        orderId: order.id,
        orderNumber: order.orderNumber,
        eventTitle: order.eventTitle,
        customer: order.customer,
        paymentStatus: order.paymentStatus,
        refundStatus: order.refundStatus,
        createdAt: order.createdAt,
        hall: order.session.hall,
      });
    }
  }
  return rows;
}

/* ───────────────────────── Analytics ───────────────────────── */

function getStats() {
  const events = loadEvents();
  const orders = getOrders();
  const paid = orders.filter((o) => o.paymentStatus === 'paid');
  const pending = orders.filter((o) => o.paymentStatus === 'pending');
  const refundedOrders = orders.filter((o) => o.refundStatus === 'full' || o.refundStatus === 'partial');
  const ticketsSold = paid.reduce((sum, o) => sum + (o.activeTicketCount ?? o.tickets.length), 0);
  const revenue = paid.reduce((sum, o) => sum + orderTotal(o), 0);
  const refundedAmount = loadReturns().reduce((sum, r) => sum + (r.price || 0), 0);
  const returnedTickets = loadReturns().length;
  return {
    totalEvents: events.length,
    totalOrders: orders.length,
    paidOrders: paid.length,
    pendingOrders: pending.length,
    refundedOrders: refundedOrders.length,
    ticketsSold,
    returnedTickets,
    revenue,
    refundedAmount,
  };
}

function getSalesByEvent() {
  const map = new Map();
  for (const order of getOrders()) {
    if (order.paymentStatus !== 'paid') continue;
    const activeCount = order.activeTicketCount ?? order.tickets.length;
    if (!activeCount) continue;
    const key = order.eventTitle;
    if (!map.has(key)) map.set(key, { title: key, tickets: 0, revenue: 0, orders: 0 });
    const row = map.get(key);
    row.orders += 1;
    row.tickets += activeCount;
    row.revenue += orderTotal(order);
  }
  return [...map.values()].sort((a, b) => b.revenue - a.revenue);
}

function getSalesBySection() {
  const map = new Map();
  for (const order of getOrders()) {
    if (order.paymentStatus !== 'paid') continue;
    for (const t of order.tickets) {
      if ((t.status ?? 'active') !== 'active') continue;
      const key = `${order.eventTitle} · ${t.section}`;
      if (!map.has(key)) {
        map.set(key, { event: order.eventTitle, section: t.section, tickets: 0, revenue: 0 });
      }
      const row = map.get(key);
      row.tickets += 1;
      row.revenue += t.price || 0;
    }
  }
  return [...map.values()].sort((a, b) => b.revenue - a.revenue);
}

/* ───────────────────────── Helpers ───────────────────────── */

function formatMoney(n) {
  return `$${Number(n || 0).toLocaleString('en-US')}`;
}

function formatDate(dateStr, timeStr) {
  if (!dateStr) return '—';
  const d = new Date(`${dateStr}T${timeStr || '00:00'}`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

function lowestPrice(sections) {
  if (!sections?.length) return 0;
  return Math.min(...sections.map((s) => s.price));
}

export const AdminStore = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getOrders,
  getOrderById,
  getAllTickets,
  getReturns,
  returnTicket,
  returnAllTickets,
  canReturnTicket,
  getStats,
  getSalesByEvent,
  getSalesBySection,
  orderTotal,
  formatMoney,
  formatDate,
  formatDateTime,
  lowestPrice,
  uid,
  RETURN_REASONS,
};
