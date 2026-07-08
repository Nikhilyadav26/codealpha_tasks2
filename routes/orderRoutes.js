// routes/orderRoutes.js
const express = require('express');
const db = require('../config/db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
router.use(authRequired);

// ---------- POST checkout / place order ----------
router.post('/', (req, res) => {
  const { shipping_name, shipping_address, shipping_city, shipping_zip } = req.body;

  if (!shipping_name || !shipping_address || !shipping_city || !shipping_zip) {
    return res.status(400).json({ error: 'Complete shipping details are required.' });
  }

  const cartItems = db
    .prepare(
      `SELECT c.quantity, p.id AS product_id, p.name, p.price, p.stock
       FROM cart_items c JOIN products p ON p.id = c.product_id
       WHERE c.user_id = ?`
    )
    .all(req.user.id);

  if (cartItems.length === 0) {
    return res.status(400).json({ error: 'Your cart is empty.' });
  }

  // Verify stock availability
  for (const item of cartItems) {
    if (item.quantity > item.stock) {
      return res.status(400).json({ error: `Not enough stock for "${item.name}".` });
    }
  }

  const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const placeOrder = db.transaction(() => {
    const orderInfo = db
      .prepare(
        `INSERT INTO orders (user_id, total_amount, status, shipping_name, shipping_address, shipping_city, shipping_zip)
         VALUES (?, ?, 'Processing', ?, ?, ?, ?)`
      )
      .run(req.user.id, total, shipping_name, shipping_address, shipping_city, shipping_zip);

    const orderId = orderInfo.lastInsertRowid;

    const insertItem = db.prepare(
      `INSERT INTO order_items (order_id, product_id, product_name, price, quantity)
       VALUES (?, ?, ?, ?, ?)`
    );
    const updateStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');

    for (const item of cartItems) {
      insertItem.run(orderId, item.product_id, item.name, item.price, item.quantity);
      updateStock.run(item.quantity, item.product_id);
    }

    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);

    return orderId;
  });

  const orderId = placeOrder();
  res.status(201).json({ message: 'Order placed successfully.', order_id: orderId });
});

// ---------- GET order history for logged-in user ----------
router.get('/', (req, res) => {
  const orders = db
    .prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.user.id);

  const itemsStmt = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
  const ordersWithItems = orders.map((order) => ({
    ...order,
    items: itemsStmt.all(order.id)
  }));

  res.json({ orders: ordersWithItems });
});

// ---------- GET single order ----------
router.get('/:id', (req, res) => {
  const order = db
    .prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  res.json({ order: { ...order, items } });
});

module.exports = router;
