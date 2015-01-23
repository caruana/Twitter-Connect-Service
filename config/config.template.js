//add twitter keys and rename this file to config.js in working env.
'use strict';
module.exports = {

    db: process.env.MONGOLAB_uri || process.env.MONGODB || 'mongodb://localhost:27017/test',

    twitter: {
        consumer_key:         '...'
        , consumer_secret:      '...'
        , access_token:         '...'
        , access_token_secret:  '...'
    }

}