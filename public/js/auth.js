// public/js/auth.js — login & register form handling

// Show a message passed via ?msg= (e.g. redirected from a protected page)
(function showRedirectMessage() {
  const msg = new URLSearchParams(window.location.search).get('msg');
  const box = document.getElementById('alert-box');
  if (msg && box) {
    box.innerHTML = `<div class="alert alert-error">${escapeHtml(msg)}</div>`;
  }
})();

function afterLoginRedirect() {
  const redirect = sessionStorage.getItem('postLoginRedirect');
  sessionStorage.removeItem('postLoginRedirect');
  window.location.href = redirect || '/index.html';
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('login-btn');
    btn.disabled = true;
    btn.textContent = 'Logging in...';

    try {
      const { token, user } = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: document.getElementById('email').value.trim(),
          password: document.getElementById('password').value
        })
      });
      setSession(token, user);
      afterLoginRedirect();
    } catch (err) {
      document.getElementById('alert-box').innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
      btn.disabled = false;
      btn.textContent = 'Login';
    }
  });
}

const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('register-btn');
    btn.disabled = true;
    btn.textContent = 'Creating account...';

    try {
      const { token, user } = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: document.getElementById('name').value.trim(),
          email: document.getElementById('email').value.trim(),
          password: document.getElementById('password').value
        })
      });
      setSession(token, user);
      afterLoginRedirect();
    } catch (err) {
      document.getElementById('alert-box').innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
      btn.disabled = false;
      btn.textContent = 'Register';
    }
  });
}
