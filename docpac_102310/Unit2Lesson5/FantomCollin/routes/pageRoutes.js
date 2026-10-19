const express = require('express');
const path = require('path');

const root = express.Router()

root.get('/', (req, res) => {
    res.render(__dirname, '');
});

module.exports = root;