const express = require('express');
const router = express.Router();

const userModel = require('../models/userModel');

router.get("/register", (req, res) => {
    if (req.session.user) {
        res.redirect("/account")
    }
    else {
        res.render("register", {
            title: "Dont' Have An Account? Sign up here!",
            message: "We encourage new users to sign up and join the fun!",
            error: null
        });
    }
});

function validateEmail(email) {
    const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return pattern.test(email);
}

router.post("/register", (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const PasswordRepeated = req.body.PasswordRepeated;
    const color = req.body.color

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedPasswordRepeated = PasswordRepeated.trim();
    const trimmedcolor = color.trim();

    if (trimmedUsername === "" || trimmedEmail === "" || trimmedPassword === "" || trimmedPasswordRepeated === "" || trimmedcolor === "") {
        res.status(400).render('register', {
            error: "Please Fill All Fields In Order To Make An Account And try Again!"
        });
    }
    else if (trimmedPassword !== trimmedPasswordRepeated) {
        res.status(400).render('register', {
            title: "Invalid Passwords!",
            message: "Welcoming All New Register! Don't Miss Out And Sign Up!",
            error: "Please Make Sure Both Passwords Match!"
        });
    }

    else if (trimmedUsername.length < 4 || trimmedUsername.length > 30) {
        res.status(400).render('register', {
            title: "Invalid username!",
            message: "The username provided isn't matched up to our requirements",
            error: "The username should be between 6 to 30 characters!"
        });
    }
    else if (trimmedEmail.length < 6 || trimmedEmail.length > 50) {
        res.status(400).render('register', {
            title: "Invalid Email Provided!",
            message: "This isn't a valid email we can take! Try again!",
            error: "The email should between 6-50 email"
        });
    }

    else if (!validateEmail(trimmedEmail)) {
        res.status(400).render('register', {
            title: "Invalid Email Provided!",
            message: "This isn't a valid email format we can take! Try again!",
            error: "The email should be a valid format!"
        });
    }

    else {
        const thisUserexists = userModel.findByUsername(trimmedUsername);
        if (thisUserexists) {
            res.status(400).render('register', {
                title: "Can't Use That Username!",
                error: "Sorry! But that username is already in use!",
                message: "No Can Do! That Username Is In Use! Maybe Try Altering Some Things"
            });
        }

        else {
            const thisEmailexists = userModel.findByEmail(trimmedEmail);
            if (thisEmailexists) {
                res.status(400).render('register', {
                    title: "Can't Use That Email!",
                    error: "Sorry! But that email is already in use!",
                    message: "That has been used before!"
                });
            }

            else {
                const result = userModel.createuser(trimmedUsername, trimmedEmail, trimmedPassword, trimmedPasswordRepeated, trimmedcolor);
                const user = userModel.findById(result.lastInsertRowid);
                req.session.user = user;
                res.redirect('/account');
            }
        }
    }
});

router.get("/login", (req, res) => {
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

router.post("/login", (req, res) => {
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
    } else {
        const user = userModel.findByUsername(trimmedUsername);
        if (!user) {
            res.status(404).render('login', {
                title: "This User Is Non-Existant!",
                message: "Please Try Again! We Can't Find This User!",
                error: "User Your Looking For Is Non-Existant, Please Try Again",
                statusCode: 404
            });
            return;
        }

        if (user.password === trimmedPassword) {
            req.session.user = user;
            res.redirect("/account");
        }
        else {
            res.status(400).render('login', {
                title: "Soryy! Wrong Passwords!",
                message: "The Password Is Incorrect!",
                error: "The Passwords Don't Match Up Try Again!",
            });
            return;
        }
    }
});

router.get("/account", (req, res) => {
    if (!req.session.user) {
        res.redirect("/login")
    } else {
        const user = req.session.user;
        if (!user) {
            res.redirect("/login");
            return;
        }

        res.render('account', {
            title: "Here's Your Account!",
            message: "This Is Your Account! Just Relax And Hang Out Here!"
        });
    }
});

router.post("/logout", (req, res) => {
    req.session.destroy(error => {
        if (error) {
            return res.status(500).json({ message: "Logout failed!" });
        }
        res.redirect("/login")
    });
});

module.exports = router;