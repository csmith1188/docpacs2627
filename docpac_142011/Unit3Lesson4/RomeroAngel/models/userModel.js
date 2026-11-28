const Database = require('better-sqlite3');
const db = new Database('./data/session.db');

db.exec(`
    CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT,
    color TEXT,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP
    )
`);

function findByUsername(username) {
    const users = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    return users;
}

function findByEmail(email) {
    const emails = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    return emails;
}

function findById(id) {
    const userID = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    return userID;
}

function createuser(username, email, password, PasswordRepeated, color) {
    const stmt = db.prepare('INSERT INTO users (username, email, password, color) VALUES (?, ?, ?, ?)');
    const result = stmt.run(username, email, password, color);
    return result;
}

module.exports = { findByUsername, findByEmail, findById, createuser };