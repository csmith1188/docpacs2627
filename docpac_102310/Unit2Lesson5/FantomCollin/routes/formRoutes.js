const express = require('express');
const path = require('path');

const form = express.Router();

form.get('/form', (req, res) => {
    res.render('form.ejs', {appName: process.env.APP_NAME});
});

form.post('/form', (req, res) => {
    const submission = req.body.input;

    if (!submission || submission.trim === '') {
        res.status(400).sendFile(path.join(__dirname, '../public/badReqError.html'));
    } else {
        console.log('Submission recieved!');
        res.render('formResponse.ejs', { appName: process.env.APP_NAME, userInput: submission });

    };

});


module.exports = form;