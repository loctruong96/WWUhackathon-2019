const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const session = require('express-session');
const escapeStringRegexp = require('escape-string-regexp');
const bodyParser = require('body-parser');
const MongoStore = require('connect-mongo')(session);
const config = require('./config.json');

mongoose.connect(config.databaseURL, config.mongooseConfig).catch((err) => {
    gracefulShutdown(err);
});

mongoose.connection.on('connected', () => {
    console.log(`connected to: ${config.databaseURL}`);
});

mongoose.connection.on('error', (err) => {
    console.log(`Mongoose connection error: ${err}`);
    gracefulShutdown(err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected, trying to reconnect');
    mongoose.connect(config.databaseURL, config.mongooseConfig).then().catch((err) => {
        console.log('reconnection attempt failed, shutting down');
        gracefulShutdown(err);
    });
});

const app = express();

app.use(helmet());

app.use(session({
    secret: config.sessionSecret,
    store: new MongoStore(mongoStoreOptions),
    saveUninitialized: false,
    resave: true,
    rolling: true,
}));

app.use((req, res, next) => {
// Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*'); // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Request headers you wish to allow
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true); // Pass to next layer of middleware
    next();
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
function gracefulShutdown(msg) {
    mongoose.connection.close(() => {
        console.log(`Database connection closed with message, ${msg}`);
    });
    server.close(() => {
        console.log('Express closed.');
    });
    process.exit(1);
}
process.on('SIGINT', () => {
    server.close(() => {
        console.log('Express closed.');
        // none forcefully try to shutdown mongoose
        mongoose.connection.close(false, () => {
            console.log('MongoDb default connection closed.');
            process.exit(1);
        });
    });
});
process.on('SIGHUP', () => {
    server.close(() => {
        console.log('Express closed.');
        // none forcefully try to shutdown mongoose
        mongoose.connection.close(false, () => {
            console.log('MongoDb default connection closed.');
            process.exit(1);
        });
    });
});
