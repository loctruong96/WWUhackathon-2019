exports.queryCardByCardName = (cardModel, cardName) => {
    // support partial matching and ignore cases
    const query = {
        name: { $regex: cardName, $options: 'i' }
    };
    return cardModel.find(query).lean().exec();
};

exports.queryCardByCardNameOne = (cardModel, cardName) => {
    // support partial matching and ignore cases
    const query = {
        name: cardName
    };
    return cardModel.findOne(query).lean().exec();
};

exports.queryHighestMadeMyDay = (cardModel) => {
    return cardModel.find().sort({num_made_my_day:-1}).limit(1).exec()
};

exports.queryHighestChangeMyLife = (cardModel) => {
    return cardModel.find().sort({num_changed_my_life:-1}).limit(1).exec()
};

exports.queryHighestFaithInHuman = (cardModel) => {
    return cardModel.find().sort({num_restored_my_faith_in_humanity:-1}).limit(1).exec()
};

exports.queryHighestMeh = (cardModel) => {
    return cardModel.find().sort({num_meh:-1}).limit(1).exec()
};

exports.queryHighestNice = (cardModel) => {
    return cardModel.find().sort({num_what_a_kind_jesture:-1}).limit(1).exec()
};

exports.queryHighestLoved = (cardModel) => {
    return cardModel.find().sort({num_made_me_feel_loved:-1}).limit(1).exec()
};

exports.queryHighestHistory = (cardModel) => {
    return cardModel.find().sort({number_of_pass:-1}).limit(1).exec()
};
