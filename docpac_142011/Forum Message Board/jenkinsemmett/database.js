const Database = require('better-sqlite3');

const db = new Database('data/forum.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    uID INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at date DEFAULT CURRENT_TIMESTAMP
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS threads (
    tID INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at DEFAULT CURRENT_TIMESTAMP
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS replies (
    rID INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    body TEXT NOT NULL,
    created_at DEFAULT CURRENT_TIMESTAMP
  );
`);

class accessDb {
    constructor() {
        this.u1 = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
        this.u2 = db.prepare('SELECT * FROM users WHERE username = ?');
        this.u3 = db.prepare('SELECT * FROM users WHERE uID = ?');

        this.t1 = db.prepare('INSERT INTO threads (user_id, title, body) VALUES (?, ?, ?)');
        this.t2 = db.prepare('SELECT * FROM threads WHERE tID = ?');
        this.t3 = db.prepare('SELECT * FROM threads WHERE user_id = ?');

        this.r1 = db.prepare('INSERT INTO replies (user_id, thread_id, body) VALUES (?, ?, ?)');
        this.r2 = db.prepare('SELECT * FROM replies WHERE user_id = ?');

        this.tAll = db.prepare(`SELECT threads.title, threads.created_at, threads.tID, users.uID, users.username
                                FROM threads
                                LEFT JOIN users
                                ON threads.user_id = users.uID;`)
        this.tAll2 = db.prepare(`SELECT threads.title, threads.body, threads.created_at, threads.tID, users.uID, users.username
                                FROM threads
                                LEFT JOIN users
                                ON threads.user_id = users.uID;`)

        this.rAll = db.prepare(`SELECT replies.thread_id, replies.user_id, replies.created_at, replies.body, users.uID, users.username
                                FROM replies
                                LEFT JOIN users
                                ON replies.user_id = users.uID;`)
        
    }
    uAdd(name, password){
        if (name){} else {name = null;}
        if (password){} else {password = null;}
        return this.u1.run(name, password);
    }
    uGetUname(name){
      return this.u2.get(name)
    }
    uGetId(id){
      return this.u3.get(id)
    }

    tAdd(userId, title, body){
      if (userId){} else {userId = null;}
      if (title){} else {title = null;}
      if (body){} else {body = null;}
      return this.t1.run(userId, title, body);
    }
    tGetId(id){
      return this.t2.get(id)
    }
    tgetuser(id){
      return this.t3.all(id)
    }

    rAdd(userId, threadId, body){
      if (userId){} else {userId = null;}
      if (threadId){} else {threadId = null;}
      if (body){} else {body = null;}
      return this.r1.run(userId, threadId, body);
    }
    rgetuser(id){
      return this.r2.all(id)
    }

    getAllThreads(){
      return this.tAll.all()
    }
    displayThread(id){
      let threads = this.tAll2.all()
      
      for (let i = 0; i < threads.length; i++){
        
        if (threads[i].tID == id){
          
          return threads[i]
        }
      }
      return false
    }

    displayReplies(id){
      let replies = this.rAll.all()
      
      let relevant = []
      for (let i = 0; i < replies.length; i++){
        
        if (replies[i].thread_id == id){
          
          relevant.push(replies[i])
        }
      }
      return relevant
    }
}

console.log('database connected');

module.exports = new accessDb();