const db = require('../models/database.js')

class accessDb {
    constructor() {
        this.a = db.prepare('SELECT * FROM users WHERE username = ?');
        this.b = db.prepare('SELECT * FROM users WHERE email = ?');
        this.c = db.prepare('SELECT * FROM users WHERE id = ?');
        this.d = db.prepare('INSERT INTO users (username, email, password, creationDate, logged_in) VALUES (?, ?, ?, ?, ?)');
    }
    getByUsername(uname){
        return this.a.get(uname)
    } 
    
    getByEmail(email){
        return this.b.get(email)
    }

    getByID(id){
       return this.c.get(id)
    }

    createNewUser(uname, email, password){
        if (uname){} else {uname = null;}
        if (email){} else {email = null;}
        if (password){} else {password = null;}
        this.d.run(uname, email, password, JSON.stringify(new Date()), "true")
    }
}

module.exports = new accessDb;