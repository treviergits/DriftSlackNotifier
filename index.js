/*jshint esversion: 8 */
// npm install --save express cookie-parser body-parser morgan cors firebase-functions slack-node
// FIREBASE
const functions = require('firebase-functions');
// SLACK
const Slack = require('slack-node');
const slackWebhookUrl = '<INSERT YOUR SLACK WEBHOOK URL>';
const slack = new Slack();
slack.setWebhook(slackWebhookUrl);
// SERVER
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');

const cors = require('cors');
var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
};

var app = express();
app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));


// const port = 9420;
// app.listen(port);

console.log("DriftSlackNotifier server is running");

// --------------------------------------------------------------------------
// *---------------------------Drift WebHook---------------------------------
// --------------------------------------------------------------------------

app.post('/drift/webhook', function(req, res) {
    console.log("body: " +  JSON.stringify(req.body,null,2));
    console.log("query: " +  JSON.stringify(req.query,null,2));
    console.log("params: " +  JSON.stringify(req.params,null,2));
    console.log("header: " +  JSON.stringify(req.headers,null,2));
    let message;
    if (req.body.type === 'new_conversation') {
        // New conversation
        message = `A New converation has been started`;
    } else if (req.body.type === 'new_message') {
        // New message
        message = `New message:\n\n ${req.body.data.body || 'Unknown message'}\n${new Date().toUTCString()}`;
    } else {
        message = `Unknown message type: ${JSON.stringify(req.body, null, 2)}`;
    }

    slack.webhook({
        text: message
        }, function(err, response) {
        console.log(err, response);
        console.log('/drift/webhook reponse: ' + JSON.stringify(response, null, 2));
    });
});


exports.app = functions.https.onRequest(app);
