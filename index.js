'use strict';
var config = require('./config/config'),
    twit = require('twit'),
    organization = require('./controllers/organization'),
    async = require('async'),
    mongoose = require('mongoose'),
    Card = require('./controllers/card');

console.log("Kithn Twitter Service: Started");

mongoose.connect(config.db);
mongoose.connection.on('error', function() {
    console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
});

var T = new twit({
    consumer_key: config.twitter.consumer_key,
    consumer_secret: config.twitter.consumer_secret,
    access_token: config.twitter.access_token,
    access_token_secret: config.twitter.access_token_secret
});

//
// get twitter accounts and open twitter filtered stream
//
async.parallel({
        getTwitterNames: function(callback){
            organization.getTwitterAccounts(function(err, orgs){
                if(err) console.log(err);
                var follow_accounts = [];
                async.each(orgs, function(org, eachCallback){
                        if(org.count === 0) eachCallback('There are no twitter account');
                        follow_accounts.push(org.twitter.id);
                        eachCallback();
                    },
                    function(err){
                        callback(err, follow_accounts);
                    });
            })
        }
    },
    function(err, follow_accounts){
        if(err) console.log(err);

        //var boston = [ '-71.191155', '42.227880', '-70.748802', '42.404172' ]

        var twitter_accounts = follow_accounts.getTwitterNames;
        var stream = T.stream('statuses/filter', { follow: twitter_accounts });

        stream.on('tweet', function (tweet) {
            Card.saveOrUpdate(tweet);
        })
    }
);