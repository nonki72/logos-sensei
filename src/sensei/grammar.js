'use strict';
var Q = require("q");
const async = require('async');

class GrammarSensei {

    constructor(apiClient) {
        this.apiClient = apiClient;
    }

    basic() {
        return [];
    }

    teach() {
        const self = this;

        self.basic();

        var promises = Q.fcall(() => {
            console.log('Establishing modules...')
        });
        promises = promises.then(this.apiClient.createModule('Grammar', './grammar'));

        promises = promises.then(() => {
            console.log('Establishing classes...')
        })
        promises = promises.then(this.apiClient.createClass('Noun', 'Grammar'));
        promises = promises.then(this.apiClient.createClass('Verb', 'Grammar'));
        promises = promises.then(this.apiClient.createClass('Adjective', 'Grammar'));
        promises = promises.then(this.apiClient.createClass('Adverb', 'Grammar'));
        promises = promises.then(this.apiClient.createClass('AdjectiveSatellite', 'Grammar'));

        promises = promises.then(() => {
            console.log('Establishing functions...')
        })
        promises = promises.then(() => {
            self.apiClient.createStoredFunction({
                name: 'GrammarGenerateSentence',
                astid: null,
                fn: `
var defer = Q.defer();
defer.promise.then(
    Q.nfcall(Grammar.generateSentence)
     .done((tree) => {
        const sentence = Grammar.treeToString(tree);
        if (sentence == null) return defer.reject("no sentence generated");
        else defer.resolve(sentence);    
    })
);
defer.promise`,
                fntype: 'string',
                fnclass: null,
                argnum: 0,
                argtypes: null,
                modules: ['Grammar'],
                memoize: false,
                promise: true,
                testargs: null
            });

            return promises;
        });
    }
}

exports.GrammarSensei = GrammarSensei;
