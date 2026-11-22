const db = require('./database');


const findByUsername = (username) => {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    return stmt.get(username);
};

const findByEmail = (email) => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
};


const findById = (id) => {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
};


const createUser = (username, email, password) => {
    const stmt = db.prepare(`
        INSERT INTO users (username, email, password)
        VALUES (?, ?, ?)
    `);
    const result = stmt.run(username, email, password);
    return result.lastInsertRowid;
};

module.exports = {
    findByUsername,
    findByEmail,
    findById,
    createUser
};