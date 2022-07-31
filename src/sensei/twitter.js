'use strict';
var Promise = require("bluebird");

class TwitterSensei {
    constructor(apiClient) {
        this.apiClient = apiClient;
    }


    basic() {
//        var promises = this.apiClient.createModule('twitter-api-v2', 'twitter-api-v2');
        return [];
    }

    teach() {
        var self = this;

        var promises = Q.fcall(() => {
            console.log('Establishing dependencies...')
        });
        promises = promises.then(() => {
            return self.basic()
        });
        promises = promises.then(() => {
            console.log('Creating Tweet functions...')
        });

        // post a tweet
        promises = promises.then(() => {
            var data = {
                name: 'twitterTweet',
                astid: null,
                fn: `
const  {TwitterApi} =  require('twitter-api-v2');
const client = new TwitterApi({
    appKey: 'oLDf5TWtnEfWFuzlaUklW9aUz',
    appSecret: 'cll4R5t5JnwgkH9Xfjfj4EBLwa5Fnmwq5MffCWIILt3V6GQM8i',
    accessToken: '1553263338632744966-CVk4RKEZka18jxVM5bHPaiAUw12Qza',
    accessSecret: 'K1e45cN1pk0RSVQRuGtAC3flQTROpL7gxf5AHzYr4DOZE'
});

const rwClient = client.readWrite

const tweet = async () => {
    try {
        await rwClient.v2.tweet(CTX.args.text);
    } catch (e) {
        console.error(e);
    }
}

tweet();
`,
                fntype: 'undefined',
                fnclass: null,
                argnum: 1,
                argtypes: [["text", "string"]],
                modules: null,
                memoize: false,
                promise: true,
                testargs: ["konnichiwa sekai"]
            };

            return self.apiClient.createStoredFunction(data);
        });

        return promises;

    }

}


exports.TwitterSensei = TwitterSensei;
