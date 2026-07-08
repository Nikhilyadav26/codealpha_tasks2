// public/js/product.js — product detail page logic

const params = new URLSearchParams(window.location.search);
const productId = params.get('id');
let currentProduct = null;

async function loadProduct() {
  const wrap = document.getElementById('product-detail');
  if (!productId) {
    wrap.innerHTML = '<p>No product specified.</p>';
    return;
  }

  try {
    const { product } = await apiFetch(`/products/${productId}`);
    currentProduct = product;
    document.title = `${product.name} — ShopEase`;

    const inStock = product.stock > 0;
    const lowStock = product.stock > 0 && product.stock <= 5;

    wrap.innerHTML = `
      <div>
        <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" onerror="this.src='https://placehold.co/500x400?text=No+Image'"/>
      </div>
      <div>
        <span class="product-cat">${escapeHtml(product.category)}</span>
        <h1>${escapeHtml(product.name)}</h1>
        <p class="price">${formatCurrency(product.price)}</p>
        <p>${escapeHtml(product.description || '')}</p>
        <p class="stock-note ${lowStock ? 'low' : ''}">
          ${inStock ? (lowStock ? `Only ${product.stock} left in stock!` : `In stock (${product.stock} available)`) : 'Out of stock'}
        </p>

        <div class="qty-selector">
          <button type="button" id="qty-minus">−</button>
          <input type="number" id="qty-input" value="1" min="1" max="${product.stock}" />
          <button type="button" id="qty-plus">+</button>
        </div>

        <div>
          <button class="btn btn-primary" id="add-cart-btn" ${!inStock ? 'disabled' : ''}>
            ${inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
          <a href="/cart.html" class="btn btn-outline">View Cart</a>
        </div>
      </div>
    `;

    document.getElementById('qty-minus').addEventListener('click', () => {
      const input = document.getElementById('qty-input');
      input.value = Math.max(1, Number(input.value) - 1);
    });
    document.getElementById('qty-plus').addEventListener('click', () => {
      const input = document.getElementById('qty-input');
      input.value = Math.min(product.stock, Number(input.value) + 1);
    });

    document.getElementById('add-cart-btn').addEventListener('click', addToCart);
  } catch (err) {
    wrap.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
  }
}

async function addToCart() {
  if (!requireLogin('Please log in to add items to your cart.')) return;

  const qty = Number(document.getElementById('qty-input').value) || 1;
  const btn = document.getElementById('add-cart-btn');
  btn.disabled = true;
  const original = btn.textContent;
  btn.textContent = 'Adding...';

  try {
    await apiFetch('/cart', {
      method: 'POST',
      body: JSON.stringify({ product_id: currentProduct.id, quantity: qty })
    });
    document.getElementById('alert-box').innerHTML = `<div class="alert alert-success">Added ${qty} × ${escapeHtml(currentProduct.name)} to your cart.</div>`;
    refreshCartCount();
  } catch (err) {
    document.getElementById('alert-box').innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
  } finally {
    btn.disabled = false;
    btn.textContent = original;
  }
}

loadProduct();
