const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
const db = require('./database');

const app = express();

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

app.use(session({
    secret: 'forum-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'strict' }
}));

app.use((req, res, next) => {
    if (req.session.userId) {
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);
        res.locals.currentUser = user;
    } else {
        res.locals.currentUser = null;
    }
    res.locals.pageTitle = 'Forum';
    next();
});

function isAuthenticated(req, res, next) {
    if (!req.session.userId) return res.redirect('/login');
    next();
}


app.get('/', (req, res) => {
    const threads = db.prepare(`
        SELECT threads.*, users.username 
        FROM threads 
        JOIN users ON threads.user_id = users.id 
        ORDER BY threads.created_at ASC
    `).all();

    res.render('index', { pageTitle: 'Forum Home', threads });
});

app.get('/register', (req, res) => {
    if (req.session.userId) return res.redirect('/');
    res.render('register', { pageTitle: 'Register', error: null });
});

app.get('/login', (req, res) => {
    if (req.session.userId) return res.redirect('/');
    res.render('login', { pageTitle: 'Login', error: null });
});

app.get('/threads/new', isAuthenticated, (req, res) => {
    res.render('newThread', { pageTitle: 'New Thread', error: null });
});

app.get('/threads/:id', (req, res) => {
    const thread = db.prepare(`
        SELECT threads.*, users.username, users.id as user_id
        FROM threads 
        JOIN users ON threads.user_id = users.id 
        WHERE threads.id = ?
    `).get(req.params.id);

    if (!thread) {
        return res.status(404).render('error', {
            pageTitle: 'Error',
            message: 'Thread not found'
        });
    }

    const replies = db.prepare(`
        SELECT replies.*, users.username, users.id as user_id
        FROM replies 
        JOIN users ON replies.user_id = users.id 
        WHERE replies.thread_id = ? 
        ORDER BY replies.created_at ASC
    `).all(req.params.id);

    res.render('thread', { pageTitle: thread.title, thread, replies });
});

app.get('/users/:id', (req, res) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);

    if (!user) {
        return res.status(404).render('error', {
            pageTitle: 'Error',
            message: 'User not found'
        });
    }

    const threads = db.prepare('SELECT * FROM threads WHERE user_id = ?').all(req.params.id);
    const replies = db.prepare(`
        SELECT replies.*, threads.id as thread_id, threads.title as thread_title 
        FROM replies 
        JOIN threads ON replies.thread_id = threads.id 
        WHERE replies.user_id = ?
    `).all(req.params.id);

    // Combine and sort by date
    const posts = [
        ...threads.map(t => ({ type: 'thread', ...t })),
        ...replies.map(r => ({ type: 'reply', ...r }))
    ].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    res.render('profile', { pageTitle: user.username, user, posts });
});


// POST /register - Process registration
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.render('register', {
            pageTitle: 'Register',
            error: 'All fields required'
        });
    }

    if (username.trim().length < 3) {
        return res.render('register', {
            pageTitle: 'Register',
            error: 'Username must be at least 3 characters'
        });
    }

    const existing = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (existing) {
        return res.render('register', {
            pageTitle: 'Register',
            error: 'Username taken'
        });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)')
        .run(username, hash);

    req.session.userId = result.lastInsertRowid;
    res.redirect('/');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.render('login', {
            pageTitle: 'Login',
            error: 'All fields required'
        });
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) {
        return res.render('login', {
            pageTitle: 'Login',
            error: 'Invalid credentials'
        });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
        return res.render('login', {
            pageTitle: 'Login',
            error: 'Invalid credentials'
        });
    }

    req.session.userId = user.id;
    res.redirect('/');
});

app.post('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/'));
});

app.post('/threads', isAuthenticated, (req, res) => {
    const { title, body } = req.body;

    if (!title?.trim() || !body?.trim()) {
        return res.render('newThread', {
            pageTitle: 'New Thread',
            error: 'Title and body required'
        });
    }

    const result = db.prepare('INSERT INTO threads (user_id, title, body) VALUES (?, ?, ?)')
        .run(req.session.userId, title.trim(), body.trim());

    res.redirect(`/threads/${result.lastInsertRowid}`);
});

app.post('/threads/:id/replies', isAuthenticated, (req, res) => {
    const { body } = req.body;

    if (!body?.trim()) {
        return res.redirect(`/threads/${req.params.id}`);
    }

    const thread = db.prepare('SELECT id FROM threads WHERE id = ?').get(req.params.id);
    if (!thread) {
        return res.status(404).render('error', {
            pageTitle: 'Error',
            message: 'Thread not found'
        });
    }

    db.prepare('INSERT INTO replies (thread_id, user_id, body) VALUES (?, ?, ?)')
        .run(req.params.id, req.session.userId, body.trim());

    res.redirect(`/threads/${req.params.id}`);
});

app.listen(3000, () => {
    console.log('Forum running at http://localhost:3000');
});