# ShopEase — Simple E-commerce Store

A lightweight full-stack e-commerce web application built for an internship submission.

**Stack:** Node.js + Express.js (backend) · HTML/CSS/vanilla JavaScript (frontend) · SQLite (database, via `better-sqlite3`)

No heavy frameworks, no ORM, no external database server required — everything runs from a single `npm install` + `npm start`.

---

## ✅ Features (matches task requirements)

- **Product listings** — home page grid with search and category filters
- **Product details page** — image, description, price, stock, quantity selector
- **Shopping cart** — add / update quantity / remove items, persists per logged-in user
- **Order processing** — checkout with shipping details, stock is validated & decremented, cart is cleared, order confirmation page
- **User registration / login** — passwords hashed with bcrypt, JWT-based authentication
- **Order history** — logged-in users can view all past orders and items
- **Database** — SQLite file (`data/store.db`) storing `users`, `products`, `cart_items`, `orders`, `order_items`

---

## 📁 Project Structure

```
ecommerce-app/
├── server.js              # Express app entry point
├── seed.js                 # Seeds sample products into the DB
├── config/
│   └── db.js                # SQLite connection + schema (auto-created on first run)
├── middleware/
│   └── auth.js               # JWT verification middleware
├── routes/
│   ├── authRoutes.js         # /api/auth  (register, login, me)
│   ├── productRoutes.js      # /api/products (list, detail, categories)
│   ├── cartRoutes.js         # /api/cart   (view, add, update, remove)
│   └── orderRoutes.js        # /api/orders (checkout, history, detail)
├── public/                  # Static frontend (served directly by Express)
│   ├── index.html            # Product listing / home page
│   ├── product.html          # Product detail page
│   ├── cart.html             # Shopping cart
│   ├── checkout.html         # Shipping form / place order
│   ├── order-success.html    # Order confirmation
│   ├── orders.html           # Order history
│   ├── login.html / register.html
│   ├── css/style.css
│   └── js/ (api.js, main.js, product.js, cart.js, checkout.js, auth.js, orders.js)
└── data/                    # SQLite database file lives here (auto-created)
```

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Copy the example env file and (optionally) change the JWT secret:
```bash
cp .env.example .env
```

### 3. Seed sample products
```bash
npm run seed
```
This adds 8 sample products to the database (only runs if the table is empty).

### 4. Start the server
```bash
npm start
```
Visit **http://localhost:3000** in your browser.

---

## 🔑 How authentication works

- On register/login, the server returns a **JWT** which the frontend stores in `localStorage`.
- Every cart/order request sends `Authorization: Bearer <token>`.
- Protected routes (`/api/cart/*`, `/api/orders/*`) are guarded by `middleware/auth.js`.

## 🗄️ Database

Uses `better-sqlite3` — a fast, synchronous, file-based SQL database. No separate database server needs to be installed or configured, which keeps the backend intentionally lightweight while still being "real" relational SQL (foreign keys, transactions for order placement, etc.). The schema is created automatically the first time `server.js` runs.

Tables: `users`, `products`, `cart_items`, `orders`, `order_items`.




