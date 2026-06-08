import { AdminStore } from './store.js';

const CATEGORIES = ['CONCERTS', 'THEATER', 'KIDS', 'STAND-UP', 'CINEMA'];
const SECTION_COLORS = ['#e30613', '#2563eb', '#059669', '#d97706', '#7c3aed', '#db2777'];

let route = 'dashboard';
let editingId = null;
let viewingOrderId = null;
let formSections = [];
let formHallMap = null;
let pendingReturn = null;

const root = document.getElementById('app');
const toastEl = document.getElementById('toast');

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 2400);
}

function openEdit(id) {
  const event = AdminStore.getEventById(id);
  if (!event) {
    showToast('Event not found.');
    navigate('events');
    return;
  }
  route = 'edit';
  editingId = id;
  formSections = (event.sections ?? []).map((s) => ({ ...s }));
  if (!formSections.length) {
    formSections = [{ id: AdminStore.uid(), name: 'Section A', price: 99 }];
  }
  formHallMap = event.hallMapImage ?? null;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function navigate(next, id = null) {
  route = next;
  editingId = id;
  if (next === 'create') {
    formSections = [
      { id: AdminStore.uid(), name: 'Section A', price: 99 },
      { id: AdminStore.uid(), name: 'Section B', price: 69 },
    ];
    formHallMap = null;
  }
  if (next === 'edit' && id) {
    openEdit(id);
    return;
  }
  render();
  if (next !== 'events' && next !== 'dashboard') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function bindNav() {
  document.querySelectorAll('[data-route]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const r = btn.getAttribute('data-route');
      if (r === 'create') navigate('create');
      else navigate(r);
    });
  });
}

function statusBadge(status) {
  const map = {
    paid: { label: 'Paid', cls: 'badge-paid' },
    pending: { label: 'Pending', cls: 'badge-pending' },
    failed: { label: 'Failed', cls: 'badge-failed' },
    refunded: { label: 'Refunded', cls: 'badge-refunded' },
    partial: { label: 'Partial refund', cls: 'badge-partial' },
  };
  const s = map[status] ?? map.paid;
  return `<span class="status-badge ${s.cls}">${s.label}</span>`;
}

function ticketStatusBadge(status) {
  if (status === 'returned') return `<span class="status-badge badge-returned">Returned</span>`;
  return `<span class="status-badge badge-active">Active</span>`;
}

function orderStatusDisplay(order) {
  if (order.refundStatus === 'full') return statusBadge('refunded');
  if (order.refundStatus === 'partial') return statusBadge('partial');
  return statusBadge(order.paymentStatus);
}

function renderDashboard() {
  const stats = AdminStore.getStats();
  const orders = AdminStore.getOrders().slice(0, 6);
  const topEvents = AdminStore.getSalesByEvent().slice(0, 4);

  return `
    <div class="page-header">
      <div>
        <h2>Dashboard</h2>
        <p>Overview of revenue, orders, and ticket sales.</p>
      </div>
      <button class="btn btn-primary" data-route="create">+ Create event</button>
    </div>

    <div class="stats">
      <div class="stat-card"><label>Revenue</label><strong>${AdminStore.formatMoney(stats.revenue)}</strong></div>
      <div class="stat-card"><label>Orders</label><strong>${stats.totalOrders}</strong></div>
      <div class="stat-card"><label>Tickets sold</label><strong>${stats.ticketsSold}</strong></div>
      <div class="stat-card"><label>Events</label><strong>${stats.totalEvents}</strong></div>
    </div>

    <div class="stats">
      <div class="stat-card stat-mini"><label>Paid orders</label><strong style="color:#059669">${stats.paidOrders}</strong></div>
      <div class="stat-card stat-mini"><label>Pending</label><strong style="color:#d97706">${stats.pendingOrders}</strong></div>
      <div class="stat-card stat-mini"><label>Returned tickets</label><strong style="color:#9a3412">${stats.returnedTickets}</strong></div>
      <div class="stat-card stat-mini"><label>Refunded</label><strong style="color:#4b5563">${AdminStore.formatMoney(stats.refundedAmount)}</strong></div>
    </div>

    <div class="grid-2">
      <div class="panel">
        <div class="panel-head">Recent orders</div>
        ${orders.length ? `
          <table class="table">
            <thead><tr><th>Customer</th><th>Event</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              ${orders.map((o) => `
                <tr class="clickable-row" data-order="${o.id}">
                  <td>
                    <strong>${escapeHtml(o.customer.name)}</strong>
                    <div style="color:var(--muted);font-size:12px">${escapeHtml(o.customer.email)}</div>
                  </td>
                  <td>${escapeHtml(o.eventTitle)}</td>
                  <td>${AdminStore.formatMoney(AdminStore.orderTotal(o))}</td>
                  <td>${orderStatusDisplay(o)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<div class="empty">No orders yet.</div>'}
      </div>

      <div class="panel">
        <div class="panel-head">Top events by revenue</div>
        ${topEvents.length ? `
          <table class="table">
            <thead><tr><th>Event</th><th>Tickets</th><th>Revenue</th></tr></thead>
            <tbody>
              ${topEvents.map((e) => `
                <tr>
                  <td><strong>${escapeHtml(e.title)}</strong></td>
                  <td>${e.tickets}</td>
                  <td>${AdminStore.formatMoney(e.revenue)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<div class="empty">No sales yet.</div>'}
      </div>
    </div>
  `;
}

function renderOrders() {
  const orders = AdminStore.getOrders();
  return `
    <div class="page-header">
      <div>
        <h2>Orders</h2>
        <p>Customer purchases — contact details and payment status.</p>
      </div>
    </div>

    <div class="filter-bar">
      <input type="text" id="order-search" class="search-input" placeholder="Search by name or email…" />
      <div class="chip-group" id="status-filter">
        <button class="chip active" data-status="all">All</button>
        <button class="chip" data-status="paid">Paid</button>
        <button class="chip" data-status="pending">Pending</button>
        <button class="chip" data-status="failed">Failed</button>
        <button class="chip" data-status="refunded">Refunded</button>
      </div>
    </div>

    <div class="panel">
      ${orders.length ? `
        <table class="table" id="orders-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Contact</th>
              <th>Event</th>
              <th>Tickets</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map((o) => orderRowHtml(o)).join('')}
          </tbody>
        </table>
      ` : '<div class="empty">No orders yet.</div>'}
    </div>
  `;
}

function orderRowHtml(o) {
  const filterStatus = o.refundStatus === 'full' ? 'refunded' : o.refundStatus === 'partial' ? 'refunded' : o.paymentStatus;
  return `
    <tr class="clickable-row order-row" data-order="${o.id}"
        data-name="${escapeAttr(o.customer.name.toLowerCase())}"
        data-email="${escapeAttr(o.customer.email.toLowerCase())}"
        data-status="${filterStatus}">
      <td><strong>${escapeHtml(o.orderNumber)}</strong></td>
      <td>${escapeHtml(o.customer.name)}</td>
      <td>
        <div style="font-size:13px">${escapeHtml(o.customer.email)}</div>
        <div style="color:var(--muted);font-size:12px">${escapeHtml(o.customer.phone)}</div>
      </td>
      <td>${escapeHtml(o.eventTitle)}</td>
      <td>${o.activeTicketCount ?? o.tickets.length}${o.returnedTicketCount ? ` <span style="color:var(--muted);font-size:12px">(${o.returnedTicketCount} returned)</span>` : ''}</td>
      <td>${AdminStore.formatMoney(AdminStore.orderTotal(o))}</td>
      <td>${orderStatusDisplay(o)}</td>
      <td style="color:var(--muted);font-size:13px">${AdminStore.formatDateTime(o.createdAt)}</td>
    </tr>
  `;
}

function renderOrderDetail() {
  const order = AdminStore.getOrderById(viewingOrderId);
  if (!order) {
    return `<div class="empty">Order not found. <button class="btn btn-ghost" data-route="orders">Back</button></div>`;
  }

  const canReturnAny = order.paymentStatus === 'paid' && (order.activeTicketCount ?? 0) > 0;
  const returnedRows = order.tickets.filter((t) => t.status === 'returned');

  return `
    <div class="page-header">
      <div>
        <h2>${escapeHtml(order.orderNumber)}</h2>
        <p>${AdminStore.formatDateTime(order.createdAt)} · ${order.paymentMethod}</p>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        ${canReturnAny ? `<button class="btn btn-danger" data-return-all="${order.id}">Return all tickets</button>` : ''}
        <button class="btn btn-secondary" data-route="orders">← Back to orders</button>
      </div>
    </div>

    <div class="grid-2">
      <div class="panel">
        <div class="panel-head">Customer</div>
        <div class="panel-body detail-list">
          <div><span>Name</span><strong>${escapeHtml(order.customer.name)}</strong></div>
          <div><span>Email</span><strong>${escapeHtml(order.customer.email)}</strong></div>
          <div><span>Phone</span><strong>${escapeHtml(order.customer.phone)}</strong></div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-head">Payment</div>
        <div class="panel-body detail-list">
          <div><span>Status</span>${orderStatusDisplay(order)}</div>
          <div><span>Method</span><strong>${escapeHtml(order.paymentMethod)}</strong></div>
          <div><span>Active total</span><strong style="color:var(--red);font-size:18px">${AdminStore.formatMoney(AdminStore.orderTotal(order))}</strong></div>
          ${order.refundedAmount ? `<div><span>Refunded</span><strong style="color:#9a3412">${AdminStore.formatMoney(order.refundedAmount)}</strong></div>` : ''}
        </div>
      </div>
    </div>

    <div class="panel" style="margin-top:20px">
      <div class="panel-head">${escapeHtml(order.eventTitle)} · ${order.session.dateLabel} ${order.session.time}</div>
      <table class="table">
        <thead><tr><th>Ticket №</th><th>Section</th><th>Row</th><th>Seat</th><th>Price</th><th>Status</th><th></th></tr></thead>
        <tbody>
          ${order.tickets.map((t) => `
            <tr class="${t.status === 'returned' ? 'row-returned' : ''}">
              <td><strong>${escapeHtml(t.ticket_number)}</strong></td>
              <td>${escapeHtml(t.section)}</td>
              <td>${t.row}</td>
              <td>${t.seat}</td>
              <td>${AdminStore.formatMoney(t.price)}</td>
              <td>${ticketStatusBadge(t.status)}</td>
              <td>
                ${AdminStore.canReturnTicket(order, t.ticket_number)
                  ? `<button class="btn btn-ghost btn-sm" data-return-ticket data-order-id="${order.id}" data-ticket="${escapeAttr(t.ticket_number)}">Return</button>`
                  : t.returnInfo
                    ? `<span style="color:var(--muted);font-size:12px">${escapeHtml(t.returnInfo.reason)}</span>`
                    : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    ${returnedRows.length ? `
      <div class="panel" style="margin-top:20px">
        <div class="panel-head">Return history</div>
        <table class="table">
          <thead><tr><th>Ticket №</th><th>Amount</th><th>Reason</th><th>Returned at</th></tr></thead>
          <tbody>
            ${returnedRows.map((t) => `
              <tr>
                <td><strong>${escapeHtml(t.ticket_number)}</strong></td>
                <td>${AdminStore.formatMoney(t.price)}</td>
                <td>${escapeHtml(t.returnInfo?.reason ?? '—')}</td>
                <td style="color:var(--muted);font-size:13px">${AdminStore.formatDateTime(t.returnInfo?.returnedAt)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    ` : ''}
  `;
}

function renderTickets() {
  const tickets = AdminStore.getAllTickets();
  return `
    <div class="page-header">
      <div>
        <h2>Tickets</h2>
        <p>Every issued ticket across all orders.</p>
      </div>
    </div>

    <div class="panel">
      ${tickets.length ? `
        <table class="table">
          <thead>
            <tr>
              <th>Ticket №</th>
              <th>Event</th>
              <th>Section</th>
              <th>Seat</th>
              <th>Customer</th>
              <th>Price</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${tickets.map((t) => `
              <tr class="clickable-row ${t.status === 'returned' ? 'row-returned' : ''}" data-order="${t.orderId}">
                <td><strong>${escapeHtml(t.ticket_number)}</strong></td>
                <td>${escapeHtml(t.eventTitle)}</td>
                <td>${escapeHtml(t.section)}</td>
                <td>Row ${t.row} · Seat ${t.seat}</td>
                <td>${escapeHtml(t.customer.name)}</td>
                <td>${AdminStore.formatMoney(t.price)}</td>
                <td>${ticketStatusBadge(t.status)}</td>
                <td>
                  ${t.status === 'active' && t.paymentStatus === 'paid'
                    ? `<button class="btn btn-ghost btn-sm" data-return-ticket data-order-id="${t.orderId}" data-ticket="${escapeAttr(t.ticket_number)}">Return</button>`
                    : ''}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<div class="empty">No tickets issued yet.</div>'}
    </div>
  `;
}

function renderReturns() {
  const returns = AdminStore.getReturns();
  const total = returns.reduce((sum, r) => sum + (r.price || 0), 0);

  return `
    <div class="page-header">
      <div>
        <h2>Returns</h2>
        <p>Processed ticket returns and refunds — ${returns.length} total · ${AdminStore.formatMoney(total)} refunded.</p>
      </div>
    </div>

    <div class="panel">
      ${returns.length ? `
        <table class="table">
          <thead>
            <tr>
              <th>Ticket №</th>
              <th>Order</th>
              <th>Customer</th>
              <th>Event</th>
              <th>Amount</th>
              <th>Reason</th>
              <th>Returned at</th>
            </tr>
          </thead>
          <tbody>
            ${returns.map((r) => `
              <tr class="clickable-row" data-order="${r.orderId}">
                <td><strong>${escapeHtml(r.ticketNumber)}</strong></td>
                <td>${escapeHtml(r.orderNumber)}</td>
                <td>
                  <div>${escapeHtml(r.customer?.name ?? '—')}</div>
                  <div style="color:var(--muted);font-size:12px">${escapeHtml(r.customer?.email ?? '')}</div>
                </td>
                <td>${escapeHtml(r.eventTitle)}</td>
                <td>${AdminStore.formatMoney(r.price)}</td>
                <td>${escapeHtml(r.reason)}</td>
                <td style="color:var(--muted);font-size:13px">${AdminStore.formatDateTime(r.returnedAt)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<div class="empty">No returns processed yet. Open an order and use Return on a paid ticket.</div>'}
    </div>
  `;
}

function renderSales() {
  const byEvent = AdminStore.getSalesByEvent();
  const bySection = AdminStore.getSalesBySection();
  const stats = AdminStore.getStats();

  return `
    <div class="page-header">
      <div>
        <h2>Sales & Analytics</h2>
        <p>Revenue breakdown by event and ticket section.</p>
      </div>
    </div>

    <div class="stats">
      <div class="stat-card"><label>Net revenue</label><strong>${AdminStore.formatMoney(stats.revenue)}</strong></div>
      <div class="stat-card"><label>Refunded</label><strong style="color:#9a3412">${AdminStore.formatMoney(stats.refundedAmount)}</strong></div>
      <div class="stat-card"><label>Active tickets</label><strong>${stats.ticketsSold}</strong></div>
      <div class="stat-card"><label>Returned tickets</label><strong>${stats.returnedTickets}</strong></div>
    </div>

    <div class="panel" style="margin-bottom:20px">
      <div class="panel-head">Revenue by event</div>
      ${byEvent.length ? `
        <table class="table">
          <thead><tr><th>Event</th><th>Orders</th><th>Tickets</th><th>Revenue</th></tr></thead>
          <tbody>
            ${byEvent.map((e) => `
              <tr>
                <td><strong>${escapeHtml(e.title)}</strong></td>
                <td>${e.orders}</td>
                <td>${e.tickets}</td>
                <td>${AdminStore.formatMoney(e.revenue)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<div class="empty">No paid sales yet.</div>'}
    </div>

    <div class="panel">
      <div class="panel-head">Revenue by section / zone</div>
      ${bySection.length ? `
        <table class="table">
          <thead><tr><th>Event</th><th>Section</th><th>Tickets sold</th><th>Revenue</th></tr></thead>
          <tbody>
            ${bySection.map((s) => `
              <tr>
                <td>${escapeHtml(s.event)}</td>
                <td><span class="badge">${escapeHtml(s.section)}</span></td>
                <td>${s.tickets}</td>
                <td>${AdminStore.formatMoney(s.revenue)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<div class="empty">No paid sales yet.</div>'}
    </div>
  `;
}

function renderEventsList() {
  const events = AdminStore.getEvents();
  return `
    <div class="page-header">
      <div>
        <h2>Events</h2>
        <p>Create and manage concerts with hall maps and ticket zones.</p>
      </div>
      <button class="btn btn-primary" data-route="create">+ Create event</button>
    </div>

    <div class="panel">
      ${events.length ? `
        <table class="table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Category</th>
              <th>Venue</th>
              <th>Date</th>
              <th>Zones</th>
              <th>Price range</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${events.map((e) => {
              const prices = (e.sections ?? []).map((s) => s.price);
              const min = prices.length ? Math.min(...prices) : 0;
              const max = prices.length ? Math.max(...prices) : 0;
              const range = prices.length ? `${AdminStore.formatMoney(min)} – ${AdminStore.formatMoney(max)}` : '—';
              return `
                <tr class="event-row" data-event-id="${e.id}">
                  <td>
                    <button type="button" class="event-title-btn" data-edit="${e.id}">
                      <strong>${escapeHtml(e.title)}</strong>
                    </button>
                    <div style="color:var(--muted);font-size:13px;margin-top:4px">${escapeHtml(e.description).slice(0, 80)}${e.description.length > 80 ? '…' : ''}</div>
                  </td>
                  <td><span class="badge">${escapeHtml(formatCategoryLabel(e.category))}</span></td>
                  <td>${escapeHtml(e.venue)}</td>
                  <td>${AdminStore.formatDate(e.date, e.time)}</td>
                  <td>${(e.sections ?? []).length}</td>
                  <td>${range}</td>
                  <td>
                    <div class="actions-cell">
                      <button type="button" class="action-btn action-btn-edit" data-edit="${e.id}">✎ Edit</button>
                      <button type="button" class="action-btn action-btn-delete" data-delete="${e.id}">Delete</button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      ` : '<div class="empty">No events yet. Click <strong>Create event</strong> to get started.</div>'}
    </div>
  `;
}

function renderEventForm(isEdit) {
  const event = isEdit ? AdminStore.getEventById(editingId) : null;
  const title = isEdit ? 'Edit event' : 'Create event';
  const subtitle = isEdit
    ? 'Update concert details, hall map, and ticket zones.'
    : 'Add a new concert with description, venue map, and priced sections.';

  return `
    <div class="page-header">
      <div>
        <h2>${title}</h2>
        <p>${subtitle}</p>
      </div>
      <button class="btn btn-secondary" data-route="events">← Back to events</button>
    </div>

    <form id="event-form" class="panel panel-body">
      <h3 style="margin-bottom:16px;font-size:18px">Event details</h3>
      <div class="form-grid">
        <div class="field full">
          <label for="title">Event title *</label>
          <input id="title" name="title" required placeholder="e.g. Neon Pulse World Tour" value="${event ? escapeAttr(event.title) : ''}" />
        </div>
        <div class="field full">
          <label for="description">Description *</label>
          <textarea id="description" name="description" required placeholder="Tell attendees what to expect…">${event ? escapeHtml(event.description) : ''}</textarea>
        </div>
        <div class="field full">
          <label for="category">Category</label>
          ${categorySelectHtml(normalizeCategory(event?.category))}
        </div>
        <div class="field">
          <label for="venue">Venue *</label>
          <input id="venue" name="venue" required placeholder="Madison Square Garden" value="${event ? escapeAttr(event.venue) : ''}" />
        </div>
        <div class="field">
          <label for="date">Date *</label>
          <input id="date" name="date" type="date" required value="${event?.date ?? ''}" />
        </div>
        <div class="field">
          <label for="time">Time *</label>
          <input id="time" name="time" type="time" required value="${event?.time ?? '20:00'}" />
        </div>
      </div>

      <h3 style="margin:28px 0 16px;font-size:18px">Hall map</h3>
      <div class="field full">
        <label>Upload venue / stadium map</label>
        <div class="upload-zone" id="upload-zone">
          <div style="font-size:28px">🗺️</div>
          <strong>Click or drag image here</strong>
          <p>PNG or JPG, up to 3 MB. Used for seat zone reference.</p>
          <input type="file" id="hall-map-input" accept="image/*" hidden />
        </div>
        <div class="map-preview" id="map-preview" style="${formHallMap ? '' : 'display:none'}">
          ${formHallMap ? `<img src="${formHallMap}" alt="Hall map preview" />` : ''}
        </div>
        ${formHallMap ? '<button type="button" class="btn btn-ghost" id="remove-map" style="margin-top:10px">Remove map</button>' : ''}
      </div>

      <h3 style="margin:28px 0 16px;font-size:18px">Ticket zones & pricing</h3>
      <p style="color:var(--muted);font-size:14px;margin-bottom:14px">
        Create sections like Section A, B, C — each with its own price.
      </p>
      <div class="sections-list" id="sections-list">
        ${formSections.map((s, i) => sectionRowHtml(s, i)).join('')}
      </div>
      <button type="button" class="btn btn-secondary" id="add-section" style="margin-top:12px">+ Add section</button>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" data-route="events">Cancel</button>
        <button type="submit" class="btn btn-primary">${isEdit ? 'Save changes' : 'Create event'}</button>
      </div>
    </form>
  `;
}

function formatCategoryLabel(value) {
  const normalized = normalizeCategory(value);
  if (normalized === 'STAND-UP') return 'Stand-Up';
  return normalized.charAt(0) + normalized.slice(1).toLowerCase();
}

function normalizeCategory(value) {
  const map = {
    Concert: 'CONCERTS',
    Concerts: 'CONCERTS',
    Theater: 'THEATER',
    Family: 'KIDS',
    Kids: 'KIDS',
    'Stand-Up': 'STAND-UP',
    Standup: 'STAND-UP',
    Cinema: 'CINEMA',
    Festival: 'CONCERTS',
  };
  if (!value) return 'CONCERTS';
  return map[value] ?? (CATEGORIES.includes(value) ? value : 'CONCERTS');
}

function categorySelectHtml(selected) {
  const active = normalizeCategory(selected);
  return `
    <select id="category" name="category" class="category-select" aria-label="Event category">
      ${CATEGORIES.map((cat) => `
        <option value="${cat}"${cat === active ? ' selected' : ''}>${escapeHtml(formatCategoryLabel(cat))}</option>
      `).join('')}
    </select>
  `;
}

function sectionRowHtml(section, index) {
  const color = SECTION_COLORS[index % SECTION_COLORS.length];
  return `
    <div class="section-row" data-section-id="${section.id}">
      <div class="field" style="margin:0">
        <input type="text" class="section-name" value="${escapeAttr(section.name)}" placeholder="Section name" style="border-left:4px solid ${color}" />
      </div>
      <div class="field section-price-wrap" style="margin:0">
        <span>$</span>
        <input type="number" class="section-price" min="0" step="1" value="${section.price}" placeholder="0" />
      </div>
      <button type="button" class="icon-btn remove-section" title="Remove section">✕</button>
    </div>
  `;
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  return escapeHtml(str).replace(/'/g, '&#39;');
}

function readSectionsFromDom() {
  return [...document.querySelectorAll('.section-row')].map((row) => ({
    id: row.getAttribute('data-section-id'),
    name: row.querySelector('.section-name').value.trim() || 'Section',
    price: Number(row.querySelector('.section-price').value) || 0,
  }));
}

function bindFormHandlers() {
  const form = document.getElementById('event-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const payload = {
      title: form.title.value,
      description: form.description.value,
      category: form.category.value,
      venue: form.venue.value,
      date: form.date.value,
      time: form.time.value,
      hallMapImage: formHallMap,
      sections: readSectionsFromDom().filter((s) => s.name),
    };

    if (!payload.sections.length) {
      showToast('Add at least one ticket section.');
      return;
    }

    if (editingId) {
      AdminStore.updateEvent(editingId, payload);
      showToast('Event updated successfully.');
    } else {
      AdminStore.createEvent(payload);
      showToast('Event created successfully.');
    }
    navigate('events');
  });

  document.getElementById('add-section')?.addEventListener('click', () => {
    formSections = readSectionsFromDom();
    const letter = String.fromCharCode(65 + formSections.length);
    formSections.push({ id: AdminStore.uid(), name: `Section ${letter}`, price: 49 });
    document.getElementById('sections-list').insertAdjacentHTML(
      'beforeend',
      sectionRowHtml(formSections[formSections.length - 1], formSections.length - 1)
    );
    bindSectionRemove();
  });

  bindUpload();
  bindSectionRemove();

  document.getElementById('remove-map')?.addEventListener('click', () => {
    formHallMap = null;
    const preview = document.getElementById('map-preview');
    preview.style.display = 'none';
    preview.innerHTML = '';
    document.getElementById('remove-map')?.remove();
  });
}

function bindSectionRemove() {
  document.querySelectorAll('.remove-section').forEach((btn) => {
    btn.onclick = () => {
      const rows = [...document.querySelectorAll('.section-row')];
      if (rows.length <= 1) {
        showToast('Keep at least one section.');
        return;
      }
      btn.closest('.section-row')?.remove();
    };
  });
}

function bindUpload() {
  const zone = document.getElementById('upload-zone');
  const input = document.getElementById('hall-map-input');
  if (!zone || !input) return;

  zone.addEventListener('click', () => input.click());

  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('dragover');
  });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('dragover');
    const file = e.dataTransfer.files?.[0];
    if (file) handleMapFile(file);
  });

  input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (file) handleMapFile(file);
  });
}

function handleMapFile(file) {
  if (!file.type.startsWith('image/')) {
    showToast('Please upload an image file.');
    return;
  }
  if (file.size > 3 * 1024 * 1024) {
    showToast('Image must be under 3 MB.');
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    formHallMap = reader.result;
    const preview = document.getElementById('map-preview');
    preview.style.display = 'block';
    preview.innerHTML = `<img src="${formHallMap}" alt="Hall map preview" />`;
    if (!document.getElementById('remove-map')) {
      preview.insertAdjacentHTML('afterend', '<button type="button" class="btn btn-ghost" id="remove-map" style="margin-top:10px">Remove map</button>');
      document.getElementById('remove-map').addEventListener('click', () => {
        formHallMap = null;
        preview.style.display = 'none';
        preview.innerHTML = '';
        document.getElementById('remove-map')?.remove();
      });
    }
    showToast('Hall map uploaded.');
  };
  reader.readAsDataURL(file);
}

let mainActionsBound = false;

function bindMainActions() {
  const main = document.getElementById('main');
  if (!main || mainActionsBound) return;
  mainActionsBound = true;

  main.addEventListener('click', (e) => {
    const returnTicketBtn = e.target.closest('[data-return-ticket]');
    if (returnTicketBtn) {
      e.preventDefault();
      e.stopPropagation();
      openReturnModal({
        orderId: returnTicketBtn.getAttribute('data-order-id'),
        ticketNumber: returnTicketBtn.getAttribute('data-ticket'),
        all: false,
      });
      return;
    }

    const returnAllBtn = e.target.closest('[data-return-all]');
    if (returnAllBtn) {
      e.preventDefault();
      e.stopPropagation();
      openReturnModal({
        orderId: returnAllBtn.getAttribute('data-return-all'),
        ticketNumber: null,
        all: true,
      });
      return;
    }

    const editTarget = e.target.closest('[data-edit]');
    if (editTarget) {
      e.preventDefault();
      openEdit(editTarget.getAttribute('data-edit'));
      return;
    }

    const orderTarget = e.target.closest('[data-order]');
    if (orderTarget) {
      e.preventDefault();
      viewingOrderId = orderTarget.getAttribute('data-order');
      route = 'order-detail';
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const deleteTarget = e.target.closest('[data-delete]');
    if (deleteTarget) {
      e.preventDefault();
      const id = deleteTarget.getAttribute('data-delete');
      const event = AdminStore.getEventById(id);
      if (!event) return;
      if (confirm(`Delete "${event.title}"? This cannot be undone.`)) {
        AdminStore.deleteEvent(id);
        showToast('Event deleted.');
        if (route === 'edit' && editingId === id) navigate('events');
        else render();
      }
    }
  });
}

function renderMain() {
  if (route === 'dashboard') return renderDashboard();
  if (route === 'events') return renderEventsList();
  if (route === 'create') return renderEventForm(false);
  if (route === 'edit') return renderEventForm(true);
  if (route === 'orders') return renderOrders();
  if (route === 'order-detail') return renderOrderDetail();
  if (route === 'tickets') return renderTickets();
  if (route === 'returns') return renderReturns();
  if (route === 'sales') return renderSales();
  return renderDashboard();
}

function activeNavRoute() {
  if (route === 'create' || route === 'edit') return 'events';
  if (route === 'order-detail') return 'orders';
  return route;
}

function render() {
  const navTarget = activeNavRoute();
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-route') === navTarget);
  });

  document.getElementById('main').innerHTML = renderMain();
  bindNav();
  bindFormHandlers();
  bindOrderFilters();
}

function bindOrderFilters() {
  const search = document.getElementById('order-search');
  const chips = document.querySelectorAll('#status-filter .chip');
  if (!search && !chips.length) return;

  let activeStatus = 'all';

  const apply = () => {
    const q = (search?.value ?? '').trim().toLowerCase();
    document.querySelectorAll('.order-row').forEach((row) => {
      const name = row.getAttribute('data-name') ?? '';
      const email = row.getAttribute('data-email') ?? '';
      const status = row.getAttribute('data-status') ?? '';
      const matchesText = !q || name.includes(q) || email.includes(q);
      const matchesStatus = activeStatus === 'all' || status === activeStatus;
      row.style.display = matchesText && matchesStatus ? '' : 'none';
    });
  };

  search?.addEventListener('input', apply);
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      activeStatus = chip.getAttribute('data-status') ?? 'all';
      apply();
    });
  });
}

function openReturnModal({ orderId, ticketNumber, all }) {
  const order = AdminStore.getOrderById(orderId);
  if (!order) {
    showToast('Order not found.');
    return;
  }

  pendingReturn = { orderId, ticketNumber, all };
  const modal = document.getElementById('return-modal');
  const title = document.getElementById('return-modal-title');
  const desc = document.getElementById('return-modal-desc');
  const select = document.getElementById('return-reason');

  select.innerHTML = AdminStore.RETURN_REASONS.map(
    (r) => `<option value="${escapeAttr(r)}">${escapeHtml(r)}</option>`,
  ).join('');

  if (all) {
    const count = order.activeTicketCount ?? 0;
    const amount = order.tickets
      .filter((t) => t.status === 'active')
      .reduce((sum, t) => sum + (t.price || 0), 0);
    title.textContent = 'Return all tickets';
    desc.textContent = `Refund ${count} ticket(s) for ${AdminStore.formatMoney(amount)}. The customer will receive a full refund for this order.`;
  } else {
    const ticket = order.tickets.find((t) => String(t.ticket_number) === String(ticketNumber));
    title.textContent = `Return ticket #${ticketNumber}`;
    desc.textContent = ticket
      ? `Refund ${AdminStore.formatMoney(ticket.price)} for ${order.customer.name}. The seat will be released.`
      : 'Process a ticket return and issue a refund.';
  }

  modal.hidden = false;
}

function closeReturnModal() {
  pendingReturn = null;
  document.getElementById('return-modal').hidden = true;
}

function confirmReturn() {
  if (!pendingReturn) return;
  const reason = document.getElementById('return-reason').value;
  let result;

  if (pendingReturn.all) {
    result = AdminStore.returnAllTickets(pendingReturn.orderId, reason);
    if (result.ok) {
      showToast(`Returned ${result.count} ticket(s) · ${AdminStore.formatMoney(result.refundAmount)} refunded.`);
    }
  } else {
    result = AdminStore.returnTicket(pendingReturn.orderId, pendingReturn.ticketNumber, reason);
    if (result.ok) {
      showToast(`Ticket #${result.ticketNumber} returned · ${AdminStore.formatMoney(result.refundAmount)} refunded.`);
    }
  }

  closeReturnModal();
  if (!result.ok) {
    showToast(result.error ?? 'Could not process return.');
    return;
  }
  render();
}

function bindReturnModal() {
  document.getElementById('return-modal-close')?.addEventListener('click', closeReturnModal);
  document.getElementById('return-modal-cancel')?.addEventListener('click', closeReturnModal);
  document.getElementById('return-modal-confirm')?.addEventListener('click', confirmReturn);
  document.getElementById('return-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'return-modal') closeReturnModal();
  });
}

bindMainActions();
bindReturnModal();
render();
