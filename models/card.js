'use strict';


var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    moment = require('moment');

var cardSchema = new mongoose.Schema({
    card_owner_name: String,
    card_name_lower:String,
    card_org: {type: Schema.Types.ObjectId, ref: 'Organization'},
    card_logo: String,
    card_source: String,
    type: String,
    message_orginal: String,
    message_rebuilt: String,
    graphic: String,
    link: String,
    name: String,
    caption: String,
    description: String,
    time_since: Number,
    twitter_id: Number,
    twitter_retweet_post: [cardSchema],
    twitter_reply_post: [cardSchema],
    twitter_post:{},
    facebook_post:{},
    created_on: {type: Date, default: moment.utc() },
    updated_on: {type:Date, default:moment.utc()}
});

cardSchema.pre('save', function(next){
    console.log(this);
    next();
});

module.exports = mongoose.model('Card', cardSchema);
