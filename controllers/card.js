var Card = require('../models/card'),
    organization = require('../models/organization'),
    twttr = require('twitter-text'),
    moment = require('moment');

//TODO: how to manage the user location of tweets ... don't want to save tweets from users outside of specified area ...
exports.saveOrUpdate = function(tweet){
    var card = new Card({});
    card.card_owner_name = tweet.user.name;
    card.card_name_lower = tweet.user.name.toLowerCase();
    card.card_logo = tweet.user.profile_image_url;
    card.card_source = "twitter";
    card.type = "";
    card.message_orginal = tweet.text;
    card.graphic ="";
    card.created_on = tweet.created_at;
    card.twitter_post = tweet;
    if(card.twitter_post.retweeted_status){
        //tweet is a retweet
        card.message_orginal = card.twitter_post.retweeted_status.text;
        card.message_rebuilt = rebuildMessage(card.message_orginal);
        var retweeted_user = card.twitter_post.user.screen_name.toLowerCase();
        //determine who retweeted - user or organization
        organization.findOne({'$or': [{twitter_name_lower: retweeted_user}, {facebook_name_lower: retweeted_user}]}, function(err, foundOrg){
            if(foundOrg){
                //retweet by organization
                card.card_org = foundOrg;
                card.type = 'retweet,org';
                card.save();
            } else {
                //retweeted_status should always exist, but can't find documentation that says it will
                if(card.twitter_post.retweeted_status.user){
                    //retweeted by user
                    var retweeted_user = card.twitter_post.retweeted_status.user.screen_name.toLowerCase();
                    organization.findOne({'$or': [{twitter_name_lower: retweeted_user}, {facebook_name_lower: retweeted_user}]}, function(err, rewteetfoundOrg){
                        if(rewteetfoundOrg){
                            card.card_org = rewteetfoundOrg;
                        }
                        var retweet_id = card.twitter_post.retweeted_status.id;
                        card.type = 'retweet,user';
                        Card.findOne({'twitter_post.id': retweet_id}, function(err, foundCard){
                            if(foundCard){
                                //attach this tweet to prev orginal tweet
                                foundCard.twitter_retweet_post.push(card);
                                foundCard.updated_on = moment.utc();
                                foundCard.save();
                            } else {
                                //retweet not in history so save this tweet as first instance
                                card.save();
                            }
                        });
                    });
                } else {
                    card.save();
                }
            }
        });
    } else if (card.twitter_post.in_reply_to_screen_name) {
        //tweet is a reply ... could be tweet at user with no originating tweet or could be a reply to another tweet.
        card.message_rebuilt = rebuildMessage(card.message_orginal);
        var replyToStatus = card.twitter_post.in_reply_to_status_id;  //could be null ... make sure to check value before using
        var reply_user = card.twitter_post.user.screen_name.toLowerCase();
        if (replyToStatus){
            //tweet is a reply to a previous tweet
            organization.findOne({'$or': [{twitter_name_lower: reply_user}, {facebook_name_lower: reply_user}]}, function(err, foundOrg){
                if (foundOrg){
                    //org replied to user
                    card.card_org = foundOrg;
                    card.type = 'reply,org';
                    Card.findOne({'twitter_post.id': replyToStatus}, function(err, foundCard){
                        if(foundCard){
                            //found orginal tweet in db ... save reply to original
                            foundCard.twitter_reply_post.push(card);
                            foundCard.updated_on = moment.utc();
                            foundCard.save();
                        } else {
                            card.save();
                        }
                    });
                } else {
                    reply_user = card.twitter_post.in_reply_to_screen_name.toLowerCase();
                    organization.findOne({'$or': [{twitter_name_lower: reply_user}, {facebook_name_lower: reply_user}]}, function(err, replyfoundOrg) {
                        //user replied to org
                        if(replyfoundOrg){
                            card.type='reply,user';
                            card.card_org = replyfoundOrg;
                        }
                        Card.findOne({'twitter_post.id': replyToStatus}, function(err, foundCard){
                            if(foundCard){
                                //found orginal tweet in db ... save reply to original
                                foundCard.twitter_reply_post.push(card);
                                foundCard.updated_on = moment.utc();
                                foundCard.save();
                            } else {
                                card.save();
                            }
                        });
                    });
                }
            });
        } else {
            //this section is a bit odd. it seems that sometimes twitter will call the tweet a reply when really it is a tweet at ... i
            // don't know if that's becase the tweet starts with @<username> and therefore twitter considers it a reply tweet (not enough data yet).
            //however there are cases where the tweet contains @<username> but the in_reply_to_screen_name property is null. so the next two 'elses'
            //deal with these cases.
            card.message_rebuilt = rebuildMessage(card.message_orginal);
            organization.findOne({'$or': [{twitter_name_lower: reply_user}, {facebook_name_lower: reply_user}]}, function(err, foundOrg){
                if (foundOrg){
                    //org has 'replied' to a user with no originating tweet.
                    card.card_org = foundOrg;
                    card.type = 'tweet@,org';
                    card.save();
                } else {
                    //user has replied to org with no originating tweet.
                    reply_user = card.twitter_post.in_reply_to_screen_name.toLowerCase();
                    organization.findOne({'$or': [{twitter_name_lower: reply_user}, {facebook_name_lower: reply_user}]}, function(err, replyfoundOrg) {
                        if(replyfoundOrg){
                            card.card_org = replyfoundOrg;
                        }
                        card.type='tweet@,user';
                        card.save();
                    });
                }
            });
        }
    } else {
        //tweet is posted by org, no retweet or reply
        var tweet_user = card.twitter_post.screen_name;
        card.message_rebuilt = rebuildMessage(card.message_orginal);
        organization.findOne({'$or': [{twitter_name_lower: tweet_user}, {facebook_name_lower: tweet_user}]}, function(err, foundOrg){
            if (foundOrg){
                card.card_org = foundOrg;
                card.type = 'tweet,org';
                card.save();
            } else {
                reply_user = card.twitter_post.in_reply_to_screen_name.toLowerCase();
                organization.findOne({'$or': [{twitter_name_lower: reply_user}, {facebook_name_lower: reply_user}]}, function(err, replyfoundOrg) {
                    //tweet is posted by user, no retweet or reply
                    if(replyfoundOrg){
                        card.card_org = replyfoundOrg;
                    }
                    card.type='tweet,user';
                    card.save();
                });
            }
        });
        card.save();
    }
};

function datestring () {
    var d = new Date(Date.now() - 5*60*60*1000);  //est timezone
    return d.getUTCFullYear()   + '-'
        +  (d.getUTCMonth() + 1) + '-'
        +   d.getDate();
}

function rebuildMessage(txt){
    return twttr.autoLink(txt, {});
}