const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const session = require('express-session');
const escapeStringRegexp = require('escape-string-regexp');
const bodyParser = require('body-parser');
const MongoStore = require('connect-mongo')(session);
const config = require('./config.json');
const example = require('./example.json');


const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

app.use((req, res, next) => {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*'); // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Request headers you wish to allow
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true); // Pass to next layer of middleware
    next();
});

app.get('/search', (req, res, next) => {
    console.log(example);
    if (isEmpty(req.query)) {
        const err = new Error('require stat or cardName');
        err.statusCode = 400;
        return next(err);
        if (!req.query.stat && !req.query.cardName) {
            const err = new Error('require stat or cardName');
            err.statusCode = 400;
            return next(err);
        }
    }

    if (req.query.stat) {
        // send back top 4 result of each category
        const result = [];
        result.push(example);
        result.push(example);
        result.push(example);
        result.push(example);
        res.jsonp(result);
    } else if (req.query.cardName) {
        // send back list of top results
        const result = [];
        result.push(example);
        result.push(example);
        res.jsonp(result);

    }
});


app.post('submit', (req, res, next) => {
    res.send('OK');
});

app.use((err, req, res, next) => {
    if (err.statusCode) {
        res.status(err.statusCode).send(err.message);
    } else if (err.code) {
        res.status(err.code).send(err.message);
    } else {
        res.status(500).send(err.message);
    }
    next();
});

app.listen(config.port, () => {
    console.log(`Listening on port ${config.port}`);
});
