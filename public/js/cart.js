// public/js/cart.js — cart page logic

async function loadCart() {
  const wrap = document.getElementById('cart-content');

  if (!isLoggedIn()) {
    wrap.innerHTML = `
      <div class="empty-state">
        <h3>Please log in to view your cart</h3>
        <a href="/login.html" class="btn btn-primary">Login</a>
      </div>`;
    return;
  }

  try {
    const { items, total } = await apiFetch('/cart');

    if (items.length === 0) {
      wrap.innerHTML = `
        <div class="empty-state">
          <h3>Your cart is empty</h3>
          <p>Browse our products and add something you like.</p>
          <a href="/index.html" class="btn btn-primary">Shop Now</a>
        </div>`;
      return;
    }

    const rows = items
      .map(
        (item) => `
      <tr data-id="${item.cart_item_id}">
        <td>
          <div class="cart-item-name">
            <img src="${escapeHtml(item.image)}" class="cart-item-thumb" onerror="this.src='https://placehold.co/60'"/>
            <a href="/product.html?id=${item.product_id}">${escapeHtml(item.name)}</a>
          </div>
        </td>
        <td>${formatCurrency(item.price)}</td>
        <td>
          <div class="qty-selector" style="margin:0;">
            <button type="button" onclick="changeQty(${item.cart_item_id}, ${item.quantity - 1})">−</button>
            <input type="number" value="${item.quantity}" min="1" max="${item.stock}"
                   onchange="changeQty(${item.cart_item_id}, this.value)" />
            <button type="button" onclick="changeQty(${item.cart_item_id}, ${item.quantity + 1})">+</button>
          </div>
        </td>
        <td>${formatCurrency(item.price * item.quantity)}</td>
        <td><button class="btn btn-danger" onclick="removeItem(${item.cart_item_id})">Remove</button></td>
      </tr>`
      )
      .join('');

    wrap.innerHTML = `
      <table class="cart-table">
        <thead>
          <tr><th>Product</th><th>Price</th><th>Quantity</th><th>Subtotal</th><th></th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <div class="cart-summary">
        <div class="row"><span>Items</span><span>${items.reduce((s, i) => s + i.quantity, 0)}</span></div>
        <div class="row total"><span>Total</span><span>${formatCurrency(total)}</span></div>
        <button class="btn btn-accent btn-block" style="margin-top:14px;" onclick="window.location.href='/checkout.html'">
          Proceed to Checkout
        </button>
      </div>
    `;
  } catch (err) {
    wrap.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
  }
}

async function changeQty(cartItemId, newQty) {
  newQty = Number(newQty);
  if (newQty < 1) return removeItem(cartItemId);
  try {
    await apiFetch(`/cart/${cartItemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity: newQty })
    });
    loadCart();
    refreshCartCount();
  } catch (err) {
    alert(err.message);
  }
}

async function removeItem(cartItemId) {
  try {
    await apiFetch(`/cart/${cartItemId}`, { method: 'DELETE' });
    loadCart();
    refreshCartCount();
  } catch (err) {
    alert(err.message);
  }
}

loadCart();
