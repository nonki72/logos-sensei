'use strict';
var Promise = require("bluebird");
const fs = require('fs');

const columns = ['rank', 'word', 'freq', '#texts', '%caps', 'blog', 'web', 'TVM', 'spok', 'fic', 'mag', 'news', 'acad', 'blogPM', 'webPM', 'TVMPM', 'spokPM', 'ficPM', 'magPM', 'newsPM', 'acadPM'];

class WordFreqSensei {

    constructor(apiClient) {
        this.apiClient = apiClient;
    }

    // set up basic Diary entries (free identifiers) that are used extensively by this sensei
    // just ensure that they exist
    basic() {
        var self = this;
        self.basicPOSInstances = {};
        self.basicFunctionInstances= {};

        // basic functions
        var basicPromises = [];
        return Promise.all(basicPromises);

    }

    // parse through the Wordnet indexes and use the JS Wordnet library API to look up each entry's details
    // add all relevent data to the Diary
    teach() {
        var self = this;

        var promises = new Promise((resolve) => {console.log('Establishing basic definitions...'); resolve()})
        promises = promises.then(() => {return this.basic()});


        //  // test mongodb
        //  promises = promises
        //  .then(() => {
        //      console.log('testing mongodb...');
             
        //      // teach routine for a word frequency
        //      // store words with frequency
        //      return Promise.all(self.wordz.map((word) => {
        //          console.log(word.word+'...');

        //          return self.apiClient.createWordFrequency(word.word, word.freq);
        //      }));

        //  });




        promises = promises.then(() => {console.log('Reading wordfreq corpus...')});

        // read words straight from the indexes
        // (use them to perform lookup)
        var getWordsPromise = () => {
            const filepath = __dirname + '/../../corpus/words_219k_m2355.txt';
            const words = [];

            const file = fs.readFileSync(filepath, 'utf-8');
            file.split(/\r?\n/).forEach(line =>  {
                const split = line.split('\t');
                if (split.length == 0) return;
                const word = split[1];
                const freq = split[2];
                var obj = {word: word, freq: freq}
                words.push(obj);
                process.stdout.write('.');
            });
            
            console.log('done');
            return words;

        };

        promises = promises.then(getWordsPromise).then((words) => {
            console.log("Completed reading word frequencies, count: " + words.length);
            return Promise.resolve(words);
        });

         // begin teaching
         promises = promises
         .then((words) => {console.log('Starting WordFreq simple teaching program...'); return Promise.resolve(words)})
         .then((words) => {

             // teach routine for a word frequency
             // store words with frequency
             for (const index in words) {
                const word = words[index];
                console.log(word.word+'...');
                self.apiClient.createWordFrequency(word.word, word.freq);
             }
         });

        return promises;
    }

}


exports.WordFreqSensei = WordFreqSensei;
