// public/js/checkout.js — checkout/order-processing logic

if (!isLoggedIn()) {
  window.location.href = '/login.html?msg=' + encodeURIComponent('Please log in to checkout.');
}

async function loadSummary() {
  const wrap = document.getElementById('order-summary');
  try {
    const { items, total } = await apiFetch('/cart');

    if (items.length === 0) {
      wrap.innerHTML = `<p>Your cart is empty. <a href="/index.html">Go shopping</a></p>`;
      document.getElementById('place-order-btn').disabled = true;
      return;
    }

    const rows = items
      .map(
        (i) => `<div class="row"><span>${escapeHtml(i.name)} × ${i.quantity}</span><span>${formatCurrency(i.price * i.quantity)}</span></div>`
      )
      .join('');

    wrap.innerHTML = `
      <h2 style="margin-top:0;">Order Summary</h2>
      ${rows}
      <div class="row total"><span>Total</span><span>${formatCurrency(total)}</span></div>
    `;
  } catch (err) {
    wrap.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
  }
}

document.getElementById('checkout-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('place-order-btn');
  btn.disabled = true;
  btn.textContent = 'Placing order...';

  const payload = {
    shipping_name: document.getElementById('shipping_name').value.trim(),
    shipping_address: document.getElementById('shipping_address').value.trim(),
    shipping_city: document.getElementById('shipping_city').value.trim(),
    shipping_zip: document.getElementById('shipping_zip').value.trim()
  };

  try {
    const { order_id } = await apiFetch('/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    window.location.href = `/order-success.html?id=${order_id}`;
  } catch (err) {
    document.getElementById('alert-box').innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
    btn.disabled = false;
    btn.textContent = 'Place Order';
  }
});

loadSummary();
