const express = require('express');
const querystring = require('querystring');
const path = require('path')
const accessUDb = require('../models/userModel.js')
const router = express.Router({ caseSensitive: true, strict: true });

function valid(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
}

router.get('/register', (req, res) => {
    if (req.session.userId){
        res.redirect("/account")
    } else {
        res.locals.title = "Register Account"
        res.locals.error = false
        res.status(200).render(path.join(__dirname, '../views/register.ejs'));
    }
})

router.post('/register', (req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        const query = querystring.parse(body);

        res.locals.title = "Register Account"
        if (query.name.trim() && query.mail.trim() && query.passW.trim() && query.passW2.trim()){
            if(query.passW.trim() == query.passW2.trim()){
                if(query.name.length > 4){
                    if(query.mail.length > 9){
                        if(valid(query.mail.trim()) ? true : false){
                            if (accessUDb.getByUsername(query.name.trim())){
                                res.locals.error = "Username Already Exists"
                                res.status(200).render(path.join(__dirname, '../views/register.ejs'));
                            } else {
                                if (accessUDb.getByEmail(query.mail.trim())){
                                    res.locals.error = "Email Already Taken"
                                    res.status(200).render(path.join(__dirname, '../views/register.ejs'));
                                } else {
                                    accessUDb.createNewUser(query.name.trim(), query.mail.trim(), query.passW.trim())
                                    let account = accessUDb.getByUsername(query.name.trim())
                                    req.session.userId = account.id
                                    res.redirect("/account")
                                }

                            }
        
                        } else {
                            res.locals.error = "Not A Proper Email Address"
                            res.status(200).render(path.join(__dirname, '../views/register.ejs'));
                        }

                    } else {
                        res.locals.error = "Improper Email Length"
                        res.status(200).render(path.join(__dirname, '../views/register.ejs'));
                    }   

                } else {
                    res.locals.error = "Improper Username Length"
                    res.status(200).render(path.join(__dirname, '../views/register.ejs'));
                }

            } else {
                res.locals.error = "Passwords Don't Match, Please Resubmit"
                res.status(200).render(path.join(__dirname, '../views/register.ejs'));
            }

        } else {
            res.locals.error = "Missing Data, Make Sure A Boxes Are Filled"
            res.status(200).render(path.join(__dirname, '../views/register.ejs'));
        }
    })
})

router.get('/login', (req, res) => {
    res.locals.title = "Log In"
    if (req.session.userId){
        res.redirect("/account")
    } else {
        res.locals.error = ''
        res.status(200).render(path.join(__dirname, '../views/login.ejs'));
    }
})

router.post('/login', (req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const query = querystring.parse(body);

        res.locals.title = "Log In"
        if(query.name.trim() && query.passW.trim()){
            if(accessUDb.getByUsername(query.name.trim())){
                if (accessUDb.getByUsername(query.name.trim()).password == query.passW.trim()){
                    let account = accessUDb.getByUsername(query.name.trim())
                    req.session.userId = account.id
                    res.redirect("/account")
                } else {
                    res.locals.error = 'Incorrect Password'
                    res.status(200).render(path.join(__dirname, '../views/login.ejs'));
                }
            } else {
                res.locals.error = 'No Account With Username Exists'
                res.status(200).render(path.join(__dirname, '../views/login.ejs'));
            }
        } else {
            res.locals.error = 'Must Fill All Boxes'
            res.status(200).render(path.join(__dirname, '../views/login.ejs'));
        }
    })
})

router.post('/logout', (req, res) => {
    req.session.userId = 0
    req.session.save()
})

router.get('/account', (req, res) => {
    if(req.session.userId){
        if(accessUDb.getByID(req.session.userId)){
            let account = accessUDb.getByID(req.session.userId)

            res.locals.uname = account.username
            res.locals.email = account.email
            res.locals.date = account.creationDate

            res.locals.title = "Account"
            res.status(200).render(path.join(__dirname, '../views/account.ejs'));
        } else {
            fetch("/logout", {
                method: "POST",
            })
            res.redirect("/login")
        }
    } else {
        res.redirect("/login")
    }
})

module.exports = router;