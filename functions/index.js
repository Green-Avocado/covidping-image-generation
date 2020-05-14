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
    const browser = await puppeteer.launch({args: ['--no-sandbox']})
    const page = await browser.newPage()
    await page.setContent(generateHTML(req.path.split('/')[2],req.body.table))
    image = await page.screenshot()
    await browser.close()
    })().then(function() {
        saveImage(req.path.split('/')[2], image);
        res.contentType('image/png');
        res.status(200).send(image);
    });
});

const runtimeOpts = {
    timeoutSeconds: 300,
    memory: '1GB'
}

exports.app = functions
    .runWith(runtimeOpts)
    .https.onRequest(app);
