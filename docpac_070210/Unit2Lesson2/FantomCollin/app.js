require('dotenv').config();
const express = require('express');
const port = process.env.PORT;
const appName = process.env.APP_NAME;
const app = express();
const path = require('path');

app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

app.get('/form', (req, res) => {
    res.sendFile(path.join(__dirname, './public/form.html'));
});

app.post('/form', (req, res) => {
    const submission = req.body.input

    if (!submission || submission.trim === '') {
        res.status(400).send('400 Error: Please enter a valid request >:(')
    } else {
        console.log('Submission recieved!');
        res.send(`You answered: ${submission}! :D`);
    };

});

app.get('/query', (req, res) => {
    const message = req.query.message

    if (typeof message !== 'string' || message.trim === '') {
        return res.status(400).send('400 Error: Please send a message using the correct format: /query?message=[YOUR%20MESSAGE]')
    } else {
        res.send(`Your message: ${message}`)
    }
})

app.listen(port, () => {
    console.log(`${appName} is running at port ${port}`);
    console.log(`URL: http://localhost:${port}`);
});