// public/js/api.js
// Shared helpers: API calls, auth token handling, navbar rendering.

const API_BASE = '/api';

// ---------- Token helpers ----------
function getToken() {
  return localStorage.getItem('token');
}
function getUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}
function setSession(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}
function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}
function isLoggedIn() {
  return !!getToken();
}

// ---------- Generic fetch wrapper ----------
async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong. Please try again.');
  }
  return data;
}

// ---------- Cart count badge ----------
async function refreshCartCount() {
  const el = document.getElementById('cart-count');
  if (!el) return;
  if (!isLoggedIn()) {
    el.textContent = '0';
    return;
  }
  try {
    const { items } = await apiFetch('/cart');
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    el.textContent = count;
  } catch {
    el.textContent = '0';
  }
}

// ---------- Navbar rendering (auth-aware) ----------
function renderAuthNav() {
  const slot = document.getElementById('nav-auth-slot');
  if (!slot) return;
  const user = getUser();

  if (user) {
    slot.innerHTML = `
      <a href="/orders.html">My Orders</a>
      <span style="color: var(--muted); font-size: 0.9rem;">Hi, ${escapeHtml(user.name.split(' ')[0])}</span>
      <a href="#" id="logout-link">Logout</a>
    `;
    document.getElementById('logout-link').addEventListener('click', (e) => {
      e.preventDefault();
      clearSession();
      window.location.href = '/index.html';
    });
  } else {
    slot.innerHTML = `
      <a href="/login.html">Login</a>
      <a href="/register.html">Register</a>
    `;
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatCurrency(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

function requireLogin(redirectMsg) {
  if (!isLoggedIn()) {
    sessionStorage.setItem('postLoginRedirect', window.location.pathname + window.location.search);
    window.location.href = `/login.html${redirectMsg ? `?msg=${encodeURIComponent(redirectMsg)}` : ''}`;
    return false;
  }
  return true;
}

document.addEventListener('DOMContentLoaded', () => {
  renderAuthNav();
  refreshCartCount();
});
