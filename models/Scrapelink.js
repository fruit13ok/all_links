const mongoose = require('mongoose');

// create schema set how the data looks
const LinkSchema = mongoose.Schema({
    url: String,
    status: String
});
const ScrapelinkSchema = mongoose.Schema({
    givenlink: { type: String },
    resultlinks: { type: [LinkSchema] }
});

// export model
const Scrapelink = mongoose.model('Scrapelink', ScrapelinkSchema);
module.exports = Scrapelink;