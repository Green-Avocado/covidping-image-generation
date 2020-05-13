const functions = require('firebase-functions');
const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
        </head>
        <body>
            Hello World
        </body>
        </html>
    `);
});

exports.app = functions.https.onRequest(app);

