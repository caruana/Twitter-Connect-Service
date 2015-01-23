var organization = require('../models/organization'),
    async = require('async');

exports.getTwitterAccounts = function(callback){
    organization.find({'twitter_name': {'$ne': null}, 'twitter_followers': {'$lt': 100000}}, {'_id': 0}).select('twitter.id').exec(function(err, org) {
        callback(err, org);
    });
}