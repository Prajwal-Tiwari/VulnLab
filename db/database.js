const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'vulnlab.db')); //creating an open database file inside /db folder. (__dirname means the folder where this file lives)

//now, creating users table 
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    item_name TEXT NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
    ); 
    `);

//now to avoid inserting duplicating data every time servers restart, we will count how many users are already in the database. 
const userCount = db.prepare(`SELECT COUNT(*) as count FROM users`).get();

if (userCount.count === 0){
    const insertUser = db.prepare(`INSERT INTO users (username, password) VALUES (?,?)`);

    const alice = insertUser.run('alice','alice123');
    const bob = insertUser.run('bob', 'bob123');

    const insertOrder = db.prepare('INSERT INTO orders (user_id, item_name, price) VALUES (?,?,?)');

    insertOrder.run(alice.lastInsertRowid, 'Laptop', 999.99);
    insertOrder.run(alice.lastInsertRowid, 'Mouse', 29.99);
    insertOrder.run(alice.lastInsertRowid, 'Keyboard', 49.99);

    insertOrder.run(bob.lastInsertRowid, 'Monitor', 299.99);
    insertOrder.run(bob.lastInsertRowid, 'Headphones', 79.99);
    insertOrder.run(bob.lastInsertRowid, 'Webcam', 59.99);

    console.log('Database seeded with users and orders');
}
module.exports = db;