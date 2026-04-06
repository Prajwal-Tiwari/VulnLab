const Database = require('better-sqlite3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const db = new Database(path.join(__dirname, 'vulnlab.db'));

db.exec(
  "CREATE TABLE IF NOT EXISTS users (" +
  "  id INTEGER PRIMARY KEY AUTOINCREMENT," +
  "  username TEXT NOT NULL UNIQUE," +
  "  password TEXT NOT NULL" +
  ");" +
  "CREATE TABLE IF NOT EXISTS orders (" +
  "  id INTEGER PRIMARY KEY AUTOINCREMENT," +
  "  uuid TEXT NOT NULL UNIQUE," +
  "  user_id INTEGER NOT NULL," +
  "  item_name TEXT NOT NULL," +
  "  price REAL NOT NULL," +
  "  FOREIGN KEY (user_id) REFERENCES users(id)" +
  ");"
);

// Seed data only if empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();

if (userCount.count === 0) {
  const insertUser = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');

  const alice = insertUser.run('alice', 'alice123');
  const bob   = insertUser.run('bob', 'bob123');

  const insertOrder = db.prepare('INSERT INTO orders (uuid, user_id, item_name, price) VALUES (?, ?, ?, ?)');

  // Alice's orders
  insertOrder.run(uuidv4(), alice.lastInsertRowid, 'Laptop', 999.99);
  insertOrder.run(uuidv4(), alice.lastInsertRowid, 'Mouse', 29.99);
  insertOrder.run(uuidv4(), alice.lastInsertRowid, 'Keyboard', 49.99);

  // Bob's orders
  insertOrder.run(uuidv4(), bob.lastInsertRowid, 'Monitor', 299.99);
  insertOrder.run(uuidv4(), bob.lastInsertRowid, 'Headphones', 79.99);
  insertOrder.run(uuidv4(), bob.lastInsertRowid, 'Webcam', 59.99);

  console.log('✅ Database seeded with users and orders');
}

module.exports = db;