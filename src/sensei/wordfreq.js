'use strict';
var Promise = require("bluebird");
const { promises } = require("dns");
const fs = require('fs');
const ApiClient = require('../apiclient');

const columns = ['rank', 'word', 'freq', '#texts', '%caps', 'blog', 'web', 'TVM', 'spok', 'fic', 'mag', 'news', 'acad', 'blogPM', 'webPM', 'TVMPM', 'spokPM', 'ficPM', 'magPM', 'newsPM', 'acadPM'];

class WordFreqSensei {

    constructor(apiClient) {
        this.apiClient = new ApiClient.ApiClient("http://127.0.0.1:9001");
    }

    // set up basic Diary entries (free identifiers) that are used extensively by this sensei
    // just ensure that they exist
    basic() {
        var self = this;
        self.basicPOSInstances = {};
        self.basicFunctionInstances= {};

    }

    // parse through the Wordnet indexes and use the JS Wordnet library API to look up each entry's details
    // add all relevent data to the Diary
    teach() {
        var self = this;

        self.basic();

        self.promises = new Promise(()=>{Promise.resolve()});

        console.log('Starting WordFreq simple teaching program...');
        console.log('Reading wordfreq corpus...');

        // read words straight from the corpus
        // TODO: (use them to perform wordnet lookup)
        const filepath = __dirname + '/../../corpus/words_219k_m2355.txt';
        self.wordsCount = 0;

        const file = fs.readFileSync(filepath, 'utf-8');
        file.split(/\r?\n/).every((line) =>  {
            const split = line.split('\t');
            if (split.length == 0) return;
            const word = split[1];
            const freq = split[2];
            var obj = {word: word, freq: freq}
            self.wordsCount++;
            console.log(">"+word);
            var promise = self.apiClient.createWordFrequency(obj.word,obj.freq);
            promise.then(
                function(value) { 
                    console.log(obj); 
                },
                function(error) { 
                    console.log(err); 
                }
            );
            self.promises = self.promises.then(promise);
            if (self.wordsCount > 100) return false;
            return true;
            
        });
        
        console.log('done');
        
        console.log("Completed reading word frequencies, count: " + self.wordsCount);

        return self.promises;
    }

}
var wfs = new WordFreqSensei();
wfs.teach();


exports.WordFreqSensei = WordFreqSensei;
