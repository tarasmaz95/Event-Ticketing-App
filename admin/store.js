const API_BASE =
  window.location.hostname === 'localhost'
    ? 'http://localhost:8001/api/admin'
    : '/api/admin';

const RETURN_REASONS = [
  'Customer request',
  'Event cancelled',
  'Duplicate purchase',
  'Unable to attend',
  'Other',
];

let cache = {
  events: [],
  orders: [],
  returns: [],
  stats: null,
  salesByEvent: [],
  salesBySection: [],
};

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed (${res.status})`);
  }
  if (res.status === 204) return null;
  return res.json();
}

async function refreshBootstrap() {
  const data = await api('/bootstrap');
  cache = {
    events: data.events ?? [],
    orders: data.orders ?? [],
    returns: data.returns ?? [],
    stats: data.stats ?? null,
    salesByEvent: data.salesByEvent ?? [],
    salesBySection: data.salesBySection ?? [],
  };
  return cache;
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getEvents() {
  return cache.events;
}

function getEventById(id) {
  return cache.events.find((e) => e.id === id) ?? null;
}

async function createEvent(payload) {
  const event = await api('/events', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  await refreshBootstrap();
  return event;
}

async function updateEvent(id, payload) {
  const event = await api(`/events/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  await refreshBootstrap();
  return event;
}

async function deleteEvent(id) {
  await api(`/events/${encodeURIComponent(id)}`, { method: 'DELETE' });
  await refreshBootstrap();
}

function getOrders() {
  return cache.orders;
}

function getOrderById(id) {
  return cache.orders.find((o) => o.id === id) ?? null;
}

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

function getReturns() {
  return cache.returns;
}

function canReturnTicket(order, ticketNumber) {
  if (order.paymentStatus !== 'paid') return false;
  const ticket = order.tickets.find((t) => String(t.ticket_number) === String(ticketNumber));
  return Boolean(ticket && ticket.status === 'active');
}

async function returnTicket(orderId, ticketNumber, reason = 'Customer request') {
  const result = await api(`/orders/${encodeURIComponent(orderId)}/returns`, {
    method: 'POST',
    body: JSON.stringify({ reason, all: false, ticketNumber: String(ticketNumber) }),
  });
  if (result.ok) await refreshBootstrap();
  return result;
}

async function returnAllTickets(orderId, reason = 'Customer request') {
  const result = await api(`/orders/${encodeURIComponent(orderId)}/returns`, {
    method: 'POST',
    body: JSON.stringify({ reason, all: true }),
  });
  if (result.ok) await refreshBootstrap();
  return result;
}

function getStats() {
  return cache.stats ?? {
    totalEvents: 0,
    totalOrders: 0,
    paidOrders: 0,
    pendingOrders: 0,
    refundedOrders: 0,
    ticketsSold: 0,
    returnedTickets: 0,
    revenue: 0,
    refundedAmount: 0,
  };
}

function getSalesByEvent() {
  return cache.salesByEvent;
}

function getSalesBySection() {
  return cache.salesBySection;
}

function orderTotal(order) {
  return (order.tickets ?? [])
    .filter((t) => (t.status ?? 'active') === 'active')
    .reduce((sum, t) => sum + (t.price || 0), 0);
}

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

async function init() {
  await refreshBootstrap();
}

export const AdminStore = {
  init,
  refreshBootstrap,
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
