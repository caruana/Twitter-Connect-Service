/**
 * Created by caruana on 15-01-10.
 */
'use strict';
var mongoose = require('mongoose');

var merchantSchema = new mongoose.Schema({
    name: String,
    name_lower: String,
    lat: Number,
    long: Number,
    profileImg: String,
    twitter_name: String,
    twitter_name_lower: String,
    twitter_followers: Number,
    facebook_name: String,
    facebook_name_lower: String,
    facebook_likes: Number,
    facebook_checkins: Number,
    twitter: {},
    facebook: {},
    foursquare: {},
    created_on: Date,
    source: String
})

module.exports = mongoose.model('Organization', merchantSchema);