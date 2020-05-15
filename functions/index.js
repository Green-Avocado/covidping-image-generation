const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

var serviceAccount = require("./covidpingimages-firebase-adminsdk-21n0z-8de58fc623.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://covidpingimages.firebaseio.com",
    storageBucket: "covidpingimages.appspot.com"
});

const bucket = admin.storage().bucket();

function saveImage(filename, data) {
    const imageBuffer = new Uint8Array(data);
    const file = bucket.file(filename, {
        uploadType: {resumable: false}
    });

    file.save(imageBuffer, (err) => {
        if (err) {
            console.error(`Error uploading: ${filename} with message: ${err.message}`);
            return;
        }

        console.log('Uploaded file');
    });
}

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
        <div style="width:495px;height:267px">

        ` + tables + `

        </div>
        </body>
        </html>
    `;
}

app.get('/image/**', (req, res) => {
    bucket.file(req.path.split('/')[2]).download().then(function(data) {
        console.log(req.path.split('/')[2])
        res.contentType('image/png');
        res.status(200).send(data[0]);
    });
});

app.post('/update/**', (req, res) => {
    var image;
    console.log(req.path.split('/')[2])
    console.log(req.body);

    (async () => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox'],
        defaultViewport: {width: 510, height: 267}
    });
    const page = await browser.newPage()
    await page.setContent(generateHTML(req.path.split('/')[2],req.body.table))
    image = await page.screenshot()
    await browser.close()
    })().then(function() {
        saveImage(req.path.split('/')[2], image);
        res.contentType('image/png');
        res.status(200).send(generateHTML(req.path.split('/')[2],req.body.table));
    });
});

app.get('/**', (req, res) => {
    console.log(req.path.split('/')[1])
    res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">

            <meta name="twitter:card" content="summary_large_image">
            <meta name="twitter:title" content="` + req.path.split('/')[1] + `'s COVID-19 daily report via covidping.com">
            <meta name="twitter:image" content="https://covidpingimages.web.app/image/` + req.path.split('/')[1] + `?` + Math.floor(Math.random() * 1000000000000000) + `">

            <meta http-equiv="refresh" content="0; url=https://www.covidping.com" />
        </head>
        <body>
            <p>Redirecting you to covidping.com</p>
            <p>If you have not been redirected, <a href="https://www.covidping.com">click here.</a></p>
        </body>
        </html>
    `);
});

const runtimeOpts = {
    timeoutSeconds: 300,
    memory: '1GB'
}

exports.app = functions
    .runWith(runtimeOpts)
    .https.onRequest(app);
