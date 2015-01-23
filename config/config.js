'use strict';
module.exports = {

    db: process.env.MONGOLAB_uri || process.env.MONGODB || 'mongodb://localhost:27017/test',

    twitter: {
        consumer_key:         'QVB8JyPWhLCpm9UADv5NaQ'
        , consumer_secret:      'Y0tsBOFa6HTfsVLio6ZyvI3aDcHppnW83w72qQg'
        , access_token:         '204791572-VdavVsohnHuxRWeEW3R2Tb57ljqlGPnzZlAsg4nI'
        , access_token_secret:  'iZ5HO20sfRX4GmQLJCJ5xC0Hg41V7YBre5QiaIp1Ev0sg'
    }

}