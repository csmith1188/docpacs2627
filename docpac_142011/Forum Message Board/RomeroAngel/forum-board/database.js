const Database = require('better-sqlite3');
let db;

const createuserTable = `
CREATE TABLE IF NOT EXISTS userTable (
id INTEGER PRIMARY KEY AUTOINCREMENT,
username TEXT NOT NULL UNIQUE,
password_hash VARCHAR(255) NOT NULL, 
created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`
const createthreadsTable = `
CREATE TABLE IF NOT EXISTS threadsTable(
id INTEGER PRIMARY KEY AUTOINCREMENT,
title TEXT NOT NULL,
body TEXT NOT NULL,
created_at TEXT DEFAULT CURRENT_TIMESTAMP,
user_id INTEGER  NOT NULL REFERENCES userTable(id)
);
`

const createrepliesTable = `
CREATE TABLE IF NOT EXISTS repliesTable(
id INTEGER PRIMARY KEY AUTOINCREMENT,
thread_id INTEGER NOT NULL REFERENCES threadsTable(id),
body TEXT NOT NULL,
created_at TEXT DEFAULT CURRENT_TIMESTAMP,
user_id INTEGER  NOT NULL REFERENCES userTable(id)
);
`

try {
  db = new Database('./data/forum.db');
  db.pragma('foreign_keys = ON');
  db.exec(createuserTable);
  db.exec(createthreadsTable);
  db.exec(createrepliesTable);
} catch (error) {
  console.log(error.message)
}

module.exports = db;