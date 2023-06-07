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
    appKey: '',
    appSecret: '',
    accessToken: '',
    accessSecret: ''
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
