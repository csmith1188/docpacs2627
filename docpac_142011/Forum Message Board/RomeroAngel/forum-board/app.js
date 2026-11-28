const express = require("express");
const bcrypt = require('bcrypt');
const db = require('./database');
var session = require('express-session');
const app = express();
// Set EJS as view engine 
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: "shushitsasupersecretsecret",
    resave: false,
    saveUninitialized: false,
    name: "ThisCookieSavesInfo",
    cookie: {
        httpOnly: true,
        sameSite: 'lax'
    }
}));

app.use((req, res, next) => {
    if (req.session.userId && req.session.username) {
        res.locals.username = req.session.username;
        res.locals.userId = req.session.userId;
        res.locals.isLoggedIn = true;
    }

    else {
        res.locals.isLoggedIn = false
    }

    next();
});

app.get('/', (req, res) => {
    res.render("index",
        {
            title: "Forum Page",
            appName: "Hi, this is the Forum Page",
            message: "This is a ejs page alright visit /register to make an account!"
        });
});

// GET Register Route
app.get("/register", (req, res) => {
    if (req.session.userId) {
        res.redirect("/")
    }
    else {
        res.render("register", {
            title: "Dont' Have An Account? Sign up here!",
            message: "We encourage new users to sign up and join the fun!",
            error: null
        });
    }
});

// /POST Register Route
app.post("/register", (req, res) => {
    console.log("POST /register hit!");
    const username = req.body.username;
    const password = req.body.password;
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (trimmedUsername === "" || trimmedPassword === "") {
        res.status(400).render('register', {
            error: "Please Fill All Fields In Order To Make An Account And try Again!"
        });
    }

    else if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
        res.status(400).render('register', {
            title: "Invalid username!",
            message: "The username provided isn't matched up to our requirements",
            error: "The username should be between 3 to 30 characters!"
        });
    }

    else if (trimmedPassword.length < 4 || trimmedPassword.length > 30) {
        res.status(400).render('register', {
            title: "Invalid password!",
            message: "The password provided isn't matched up to our requirements",
            error: "Your password should be between 3 to 30 characters!"
        });
    }

    else {
        const checkUserQuery = db.prepare('SELECT id FROM userTable WHERE username = ?');
        const existingUser = checkUserQuery.get(trimmedUsername);

        if (existingUser) {
            res.status(400).render('register', {
                title: "Can't Use That Username!",
                error: "Sorry! But that username is already in use!",
                message: "No Can Do! That Username Is In Use! Maybe Try Altering Some Things"
            });
        }
        else {
            const hashedPassword = bcrypt.hashSync(trimmedPassword, 10);

            const insertUser = db.prepare('INSERT INTO userTable (username, password_hash) VALUES (?, ?)');
            const result = insertUser.run(trimmedUsername, hashedPassword);

            req.session.userId = result.lastInsertRowid;
            req.session.username = trimmedUsername;

            res.redirect("/login");
        }
    }
});

// GET Login Route
app.get("/login", (req, res) => {
    if (req.session.userId) {
        res.redirect(
            "/account"
        )
    }

    else {
        res.render("login", {
            title: "Welcome Back! Sign in here!",
            message: "We Welcome You back!",
            error: null
        })
    }
});

// POST Login Route
app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (trimmedUsername === "" || trimmedPassword === "") {
        res.status(400).render('error', {
            title: "400 Error!",
            message: "You got a 400 error",
            statusCode: 400,
        });
    }
});

// GET Account Route
app.get("/account", (req, res) => {
    if (!req.session.userId) {
        res.redirect("/login")
    } else {

        res.render('account', {
            title: "Here's Your Account!",
            message: "This Is Your Account! Just Relax And Hang Out Here!"
        });
    }
});

// POST Logout
app.post("/logout", (req, res) => {
    req.session.destroy(error => {
        if (error) {
            return res.status(500).json({ message: "Logout failed!" });
        }
        res.redirect("/login")
    });
});

const PORT = 4087; app.listen(PORT, function (err) {
    if (err) console.log("Error in server setup", err)
    console.log("Server listening on Port", PORT);
});