const Database = require('better-sqlite3');
const db = new Database('session.db');

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

function createuser(username, email, password) {
    const stmt = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)');
    const result = stmt.run(username, email, password);
    return result;
}

module.exports = { findByUsername, findByEmail, findById, createuser };