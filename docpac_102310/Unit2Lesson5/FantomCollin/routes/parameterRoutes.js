const express = require('express');
const path = require('path');

const parama = express.Router();

parama.get('/query', (req, res) => {
    const message = req.query.message;
    if (typeof message !== 'string' || message.trim() === '') {
        res.status(400).sendFile(path.join(__dirname, '../public/badReqError'));
    } else {
        res.render('queryResponse', { appName: process.env.APP_NAME, query: message});
    };

});

parama.get('/urlparams/:paramname', (req, res) => {
    const param = req.params.paramname;
    if (!param || param.trim() === '') {
        res.status(400).sendFile(path.join(__dirname, '../public/badReqError'));
    } else {
        res.render('parameterResponse', { appName: process.env.APP_NAME, parame: param });
    };

});

module.exports = parama;