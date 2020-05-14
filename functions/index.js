const functions = require('firebase-functions');
const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

function generateHTML(stateName, tables) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
        <style>
        .body {
        font-family:arial;
        }

        td {
        overflow:hidden;padding:2px 3px;vertical-align:bottom;border:1px solid rgb(204,204,204);
        }

        th {
        overflow:hidden;padding:2px 3px;vertical-align:bottom;border:1px solid rgb(204,204,204);
        }
        </style>

        </head>
        <body>
        <div> <font size="5" style="font-size:small;font-family: Arial;">
        <p>These are ` + stateName + `'s officially reported numbers for the 24-hour period ending at 5:30pm EST today:<p>
        </font> </div>

        ` + tables + `

        <div> <font size="5" style="font-size:small;font-family: Arial;">
        <p><i>Special thanks to The COVID Tracking Project and ` + stateName + ` state health authorities for supplying our data.</i><br>
        </body>
        </html>
    `;
}

app.get('/**', (req, res) => {
    var image;

    (async () => {
    const browser = await puppeteer.launch({args: ['--no-sandbox']})
    const page = await browser.newPage()
    await page.setContent(generateHTML('a','b'))
    image = await page.screenshot()
    await browser.close()
    })().then(function() {
        res.contentType('image/png');
        res.send(image);
    });
});

exports.app = functions.https.onRequest(app);

