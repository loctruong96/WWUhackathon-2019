const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const schemas = require('./utilities/schemas');
const config = require('./config.json');
const query = require('./utilities/query-utilities');

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

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());

app.use((req, res, next) => {
// Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*'); // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Request headers you wish to allow
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true); // Pass to next layer of middleware
    next();
});

app.get('/search', async (req, res, next) => {
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
        const result = [];
        try {
            let temp = await query.queryHighestMadeMyDay(schemas.Cards);
            result.push(temp[0]);
            temp = await query.queryHighestChangeMyLife(schemas.Cards);
            result.push(temp[0]);
            temp = await query.queryHighestFaithInHuman(schemas.Cards);
            result.push(temp[0]);
            temp = await query.queryHighestMeh(schemas.Cards);
            result.push(temp[0]);
            temp = await query.queryHighestNice(schemas.Cards);
            result.push(temp[0]);
            temp = await query.queryHighestLoved(schemas.Cards);
            result.push(temp[0]);
            temp = await query.queryHighestHistory(schemas.Cards);
            result.push(temp[0]);
            res.jsonp(result);
        } catch (err) {
            next(err);
        }
    } else if (req.query.cardName) {
        try {
            if (req.query.oneOnly) {
                let temp = await query.queryCardByCardNameOne(schemas.Cards, req.query.cardName);
                res.jsonp(temp);
            } else {
                let temp = await query.queryCardByCardName(schemas.Cards, req.query.cardName);
                res.jsonp(temp);
            }
        } catch (err) {
            next(err);
        }
    }
});


app.post('/submit/', (req, res, next) => {
    const err = new Error('body cannot be empty request');
    err.statusCode = 400;
    if (!req.body) {
        return next(err);
    }
    if (!req.body.name) {
        const err = new Error('require name');
        err.statusCode = 400;
    }
    if (!req.body.history) {
        const err = new Error('require history object');
        err.statusCode = 400;
    }
    if (req.body.name === 'fail_sentiment') {
        const err = new Error('sentiment failed');
        err.statusCode = 400;
    }

    const example2 = {
        name: "helloworld-2",
        number_of_pass: 2,
        birthplace: "WA",
        num_made_my_day: 1,
        num_changed_my_life: 0,
        num_restored_my_faith_in_humanity: 0,
        num_meh: 0,
        num_what_a_kind_jesture: 0,
        num_made_me_feel_loved: 0,
        last_known_location: "ip-address",
        history : [{
            location : "ip-address",
            sentiment : 5,
            datetime: new Date(),
            story: "this guy bought me a coffee",
        }]
    };

    // schemas.Cards.create(example2).then(() =>{
    //     console.log("inserted okay");
    // }).catch((err) => {
    //     console.log('failed');
    // });
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

const server = app.listen(config.port, () => {
    console.log(`Listening on port ${config.port}`);
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
