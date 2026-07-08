// public/js/orders.js — order history page logic

async function loadOrders() {
  const wrap = document.getElementById('orders-content');

  if (!isLoggedIn()) {
    wrap.innerHTML = `
      <div class="empty-state">
        <h3>Please log in to view your orders</h3>
        <a href="/login.html" class="btn btn-primary">Login</a>
      </div>`;
    return;
  }

  try {
    const { orders } = await apiFetch('/orders');

    if (orders.length === 0) {
      wrap.innerHTML = `
        <div class="empty-state">
          <h3>You haven't placed any orders yet</h3>
          <a href="/index.html" class="btn btn-primary">Start Shopping</a>
        </div>`;
      return;
    }

    wrap.innerHTML = orders
      .map((order) => {
        const date = new Date(order.created_at).toLocaleDateString('en-IN', {
          year: 'numeric', month: 'short', day: 'numeric'
        });
        const items = order.items
          .map((i) => `<div class="order-item-row"><span>${escapeHtml(i.product_name)} × ${i.quantity}</span><span>${formatCurrency(i.price * i.quantity)}</span></div>`)
          .join('');

        return `
          <div class="order-card">
            <div class="order-card-head">
              <div>
                <strong>Order #${order.id}</strong>
                <span style="color:var(--muted); font-size:0.85rem;"> · ${date}</span>
              </div>
              <span class="status-badge">${escapeHtml(order.status)}</span>
            </div>
            ${items}
            <div class="order-item-row" style="border-top:1px solid var(--border); margin-top:8px; padding-top:8px; font-weight:700; color:var(--text);">
              <span>Total</span><span>${formatCurrency(order.total_amount)}</span>
            </div>
          </div>`;
      })
      .join('');
  } catch (err) {
    wrap.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
  }
}

loadOrders();
