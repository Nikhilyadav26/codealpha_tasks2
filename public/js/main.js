// public/js/main.js — home page logic

let currentCategory = '';
let currentSearch = '';

async function loadCategories() {
  try {
    const { categories } = await apiFetch('/products/categories');
    const wrap = document.getElementById('category-filters');
    categories.forEach((cat) => {
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.dataset.category = cat;
      chip.textContent = cat;
      chip.addEventListener('click', () => {
        currentCategory = cat;
        document.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        loadProducts();
      });
      wrap.appendChild(chip);
    });

    document.querySelector('.chip[data-category=""]').addEventListener('click', (e) => {
      currentCategory = '';
      document.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
      e.target.classList.add('active');
      loadProducts();
    });
  } catch (err) {
    console.error(err);
  }
}

async function loadProducts() {
  const grid = document.getElementById('product-grid');
  grid.innerHTML = '<p>Loading products...</p>';

  const params = new URLSearchParams();
  if (currentCategory) params.set('category', currentCategory);
  if (currentSearch) params.set('search', currentSearch);

  try {
    const { products } = await apiFetch(`/products?${params.toString()}`);

    if (products.length === 0) {
      grid.innerHTML = `<div class="empty-state"><h3>No products found</h3><p>Try a different search or category.</p></div>`;
      return;
    }

    grid.innerHTML = products
      .map(
        (p) => `
      <div class="product-card">
        <a href="/product.html?id=${p.id}">
          <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" onerror="this.src='https://placehold.co/400x300?text=No+Image'"/>
        </a>
        <div class="product-card-body">
          <span class="product-cat">${escapeHtml(p.category)}</span>
          <h3><a href="/product.html?id=${p.id}">${escapeHtml(p.name)}</a></h3>
          <span class="price">${formatCurrency(p.price)}</span>
          <button class="btn btn-primary btn-block" style="margin-top:8px;" onclick="quickAddToCart(${p.id}, this)">
            Add to Cart
          </button>
        </div>
      </div>`
      )
      .join('');
  } catch (err) {
    grid.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
  }
}

async function quickAddToCart(productId, btn) {
  if (!requireLogin('Please log in to add items to your cart.')) return;
  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Adding...';
  try {
    await apiFetch('/cart', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity: 1 })
    });
    btn.textContent = 'Added ✓';
    refreshCartCount();
    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
    }, 1200);
  } catch (err) {
    alert(err.message);
    btn.textContent = original;
    btn.disabled = false;
  }
}

document.getElementById('search-form').addEventListener('submit', (e) => {
  e.preventDefault();
  currentSearch = document.getElementById('search-input').value.trim();
  loadProducts();
});

loadCategories();
loadProducts();
