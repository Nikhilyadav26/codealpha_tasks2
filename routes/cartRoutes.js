// routes/cartRoutes.js
const express = require('express');
const db = require('../config/db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
router.use(authRequired); // every cart route requires login

// ---------- GET cart (joined with product info) ----------
router.get('/', (req, res) => {
  const items = db
    .prepare(
      `SELECT c.id AS cart_item_id, c.quantity, p.id AS product_id, p.name, p.price, p.image, p.stock
       FROM cart_items c
       JOIN products p ON p.id = c.product_id
       WHERE c.user_id = ?
       ORDER BY c.id DESC`
    )
    .all(req.user.id);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  res.json({ items, total });
});

// ---------- POST add item to cart ----------
router.post('/', (req, res) => {
  const { product_id, quantity } = req.body;
  const qty = Number(quantity) > 0 ? Number(quantity) : 1;

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
  if (!product) return res.status(404).json({ error: 'Product not found.' });

  const existing = db
    .prepare('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?')
    .get(req.user.id, product_id);

  if (existing) {
    db.prepare('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?').run(qty, existing.id);
  } else {
    db.prepare('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)').run(
      req.user.id,
      product_id,
      qty
    );
  }

  res.status(201).json({ message: 'Item added to cart.' });
});

// ---------- PUT update quantity ----------
router.put('/:cartItemId', (req, res) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: 'Quantity must be at least 1.' });
  }

  const item = db
    .prepare('SELECT * FROM cart_items WHERE id = ? AND user_id = ?')
    .get(req.params.cartItemId, req.user.id);
  if (!item) return res.status(404).json({ error: 'Cart item not found.' });

  db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(quantity, item.id);
  res.json({ message: 'Cart updated.' });
});

// ---------- DELETE remove item ----------
router.delete('/:cartItemId', (req, res) => {
  const result = db
    .prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?')
    .run(req.params.cartItemId, req.user.id);

  if (result.changes === 0) return res.status(404).json({ error: 'Cart item not found.' });
  res.json({ message: 'Item removed from cart.' });
});

// ---------- DELETE clear cart ----------
router.delete('/', (req, res) => {
  db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
  res.json({ message: 'Cart cleared.' });
});

module.exports = router;
