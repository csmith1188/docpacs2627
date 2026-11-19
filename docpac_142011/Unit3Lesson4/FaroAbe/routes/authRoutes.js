const express = require('express');
const router = express.Router();
const User = require('../models/userModel');


router.get('/register', (req, res) => {
    res.render('register', {
        pageTitle: 'Register',
        error: null
    });
});


router.get('/login', (req, res) => {
    // If already logged in, redirect to account
    if (req.session.userId) {
        return res.redirect('/account');
    }

    res.render('login', {
        pageTitle: 'Login',
        error: null
    });
});
router.get('/account', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }

    const user = User.findById(req.session.userId);

    if (!user) {
        req.session.destroy();
        return res.redirect('/login');
    }

    res.render('account', {
        pageTitle: 'Account',
        user: user
    });
});
router.post('/register', (req, res) => {
    const { username, email, password, confirmPassword } = req.body;


    if (!username || !email || !password || !confirmPassword) {
        return res.render('register', {
            pageTitle: 'Register',
            error: 'All fields are required'
        });
    }

    if (password !== confirmPassword) {
        return res.render('register', {
            pageTitle: 'Register',
            error: 'Passwords do not match'
        });
    }

    if (username.trim().length < 3) {
        return res.render('register', {
            pageTitle: 'Register',
            error: 'Username must be at least 3 characters'
        });
    }

    // Check for existing accounts
    const existingUsername = User.findByUsername(username);
    if (existingUsername) {
        return res.render('register', {
            pageTitle: 'Register',
            error: 'Username already taken'
        });
    }

    const existingEmail = User.findByEmail(email);
    if (existingEmail) {
        return res.render('register', {
            pageTitle: 'Register',
            error: 'Email already registered'
        });
    }

    const userId = User.createUser(username, email, password);

    req.session.userId = userId;

    res.redirect('/account');
});

router.post('/login', (req, res) => {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
        return res.render('login', {
            pageTitle: 'Login',
            error: 'All fields are required'
        });
    }

    let user = User.findByUsername(identifier);
    if (!user) {
        user = User.findByEmail(identifier);
    }

    if (!user) {
        return res.render('login', {
            pageTitle: 'Login',
            error: 'Invalid credentials'
        });
    }

    if (user.password !== password) {
        return res.render('login', {
            pageTitle: 'Login',
            error: 'Invalid credentials'
        });
    }

    req.session.userId = user.id;
    res.redirect('/account');
});
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/');
    });
});
module.exports = router;