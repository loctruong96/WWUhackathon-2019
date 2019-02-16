const mongoose = require('mongoose');

const Cards = () => (
    new mongoose.Schema({
        name: String,
        number_of_pass: Number,
        birthplace: String,
        num_made_my_day: Number,
        num_changed_my_life: Number,
        num_restored_my_faith_in_humanity: Number,
        num_meh: Number,
        num_what_a_kind_jesture: Number,
        num_made_me_feel_loved: Number,
        last_known_location: String,
        history : [{
            location : String,
            sentiment : Number,
            datetime: Date,
            story: String,
        }]
    }, {
        collection: 'cards',
    })
);

exports.Cards = mongoose.model('Cards', Cards());
