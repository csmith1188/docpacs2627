const express = require('express');
const path = require('path');

const root = express.Router();

root.get('/', (req, res) => {
    res.render('index', { appName: process.env.APP_NAME, currentPage: 'home', someValue: '' });
});

module.exports = root;