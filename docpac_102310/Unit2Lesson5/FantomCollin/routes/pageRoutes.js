const express = require('express');
const path = require('path');

const root = express.Router()

root.get('/', (req, res) => {
    res.render('index.ejs', { appName: process.env.APP_NAME });
});

module.exports = root;