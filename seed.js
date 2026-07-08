// seed.js
// Run with: npm run seed
// Populates the products table with sample data (only if empty).

const db = require('./config/db');

const products = [
  {
    name: 'Wireless Headphones',
    description: 'Over-ear Bluetooth headphones with active noise cancellation and 30-hour battery life.',
    price: 2499,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    category: 'Electronics',
    stock: 50
  },
  {
    name: 'Smart Watch',
    description: 'Fitness tracking smartwatch with heart-rate monitor, GPS, and 7-day battery life.',
    price: 3999,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
    category: 'Electronics',
    stock: 40
  },
  {
    name: 'Mechanical Keyboard',
    description: 'RGB backlit mechanical keyboard with hot-swappable switches.',
    price: 3299,
    image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500',
    category: 'Electronics',
    stock: 35
  },
  {
    name: 'Running Shoes',
    description: 'Lightweight breathable running shoes with cushioned sole.',
    price: 1899,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    category: 'Footwear',
    stock: 60
  },
  {
    name: 'Backpack',
    description: 'Water-resistant 25L backpack with padded laptop compartment.',
    price: 1299,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
    category: 'Accessories',
    stock: 45
  },
  {
    name: 'Coffee Maker',
    description: 'Programmable drip coffee maker with 12-cup glass carafe.',
    price: 2199,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500',
    category: 'Home',
    stock: 25
  },
  {
    name: 'Desk Lamp',
    description: 'LED desk lamp with adjustable brightness and USB charging port.',
    price: 899,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500',
    category: 'Home',
    stock: 70
  },
  {
    name: 'Sunglasses',
    description: 'Polarized UV-protection sunglasses with lightweight frame.',
    price: 799,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
    category: 'Accessories',
    stock: 55
  }
];

const count = db.prepare('SELECT COUNT(*) AS c FROM products').get().c;

if (count === 0) {
  const insert = db.prepare(`
    INSERT INTO products (name, description, price, image, category, stock)
    VALUES (@name, @description, @price, @image, @category, @stock)
  `);
  const insertMany = db.transaction((items) => {
    for (const item of items) insert.run(item);
  });
  insertMany(products);
  console.log(`Seeded ${products.length} products.`);
} else {
  console.log(`Products table already has ${count} rows — skipping seed.`);
}
