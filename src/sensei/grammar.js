'use strict';
var Promise = require("bluebird");
const async = require('async');
const wndb = require('wndb-with-exceptions');
const WordNet = require('node-wordnet');
const Grammar = require('../../../logos/src/grammar');

class GrammarSensei {

    constructor(apiClient) {
        this.apiClient = apiClient;
    }

    basic() {
        return [];
    }

    teach() {
        const self = this;

        var promises = Q.fcall(() => {
            console.log('Establishing modules...')
        });
        promises = promises.then(this.apiClient.createModule('Grammar', './grammar'));
        promises = promises.then(this.apiClient.createClass('Noun', 'Grammar'));
        promises = promises.then(this.apiClient.createClass('Verb', 'Grammar'));
        promises = promises.then(this.apiClient.createClass('Adjective', 'Grammar'));
        promises = promises.then(this.apiClient.createClass('Adverb', 'Grammar'));
        promises = promises.then(this.apiClient.createClass('AdjectiveSatellite', 'Grammar'));

        promises = promises.then(() => {
            return self.basic()
        });
        promises = promises.then(() => {
            self.apiClient.createStoredFunction({
                name: 'GrammarGenerateSentence',
                astid: null,
                fn: `
var defer = Q.defer();
const phrase = Grammar.treeToString(Grammar.generatePhrase());
if (phrase == null) {
    return defer.reject('no phrase generated');
} else {
    defer.resolve(phrase);
}
defer.promise
`,
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
    }s
}

exports.GrammarSensei = GrammarSensei;
