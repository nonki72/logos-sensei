'use strict';
const fs = require('fs');
const Q = require('q');
var http = require('http');

const columns = ['rank', 'lemma', 'POS', 'freq', 'perMil',]; // etc...
const maxFreq = 50033612;

class WordFreqCorpSensei60k {

    constructor() {
        this.wordsCount = 0;
        this.wordObjs = [];
        this.readWordsCount = 0;
        this.writeWordsCount = 0;
        this.promises = Q.defer();
        this.subPromise = Q.defer();
    }

    createWordFrequency(name, freq) {
        var self = this;
        const nameEscaped = encodeURI(name);
                    
        var options = {
            hostname: '127.0.0.1',
            port: 9001,
            path: "/api/frequency/" + nameEscaped,
            method: 'post',
            headers: {
                    "content-type": "application/json",
                }
                
        };
        var req = http.request(options, function(res) {
//            console.log('Status: ' + res.statusCode);
//            console.log('Headers: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            res.on('data', function (body) {
                //console.log('Body: ' + body); 
                self.writeWordsCount++;
            });
        });
        req.on('error', function(e) {
            console.log('problem with request: ' + e.message);
        });
        req.write('{ "freq" : '+freq+' }');
        req.end();
    }

    waitSub() {
        await this.teachSub(() => {
            this.waitSub();
        });
        if (this.writeWordsCount >= this.readWordsCount) {
            this.promises.resolve();
        }
    }

    async teachSub(callback) {
        for(var i = 0; i < 100; i++) {
            var obj = this.wordObjs[this.readWordsCount++];
            console.log((this.writeWordsCount+i)+">"+obj.word);
            await this.createWordFrequency(obj.word,obj.freq);
        };
        callback();
    }

    setup() {
        var self = this;
        console.log('Starting WordFreq simple teaching program...');
  
        console.log('Reading wordfreq corpus...');

        // read words straight from the corpus
        // TODO: (use them to perform wordnet lookup)
        const filepath = __dirname + '/../../corpus/lemmas_60k_m2355.txt';

        const file = fs.readFileSync(filepath, 'utf-8');
        file.split(/\r?\n/).forEach((line) =>  {
            const split = line.split('\t');
            if (split.length == 0) return;
            const word = split[1];
            const freq = split[3];
            const frequency = freq / maxFreq;
            var obj = {word: word, freq: frequency}
            self.wordObjs.push(obj);
            self.wordsCount++;
        });
        console.log('Done, count: ' + self.wordsCount);

    }

    teach() {
        this.setup();
        console.log('Completed teaching word frequencies setup.');
            
        this.teachSub()
        console.log('Completed teaching word frequencies setup.');
        
        return self.promises;
    }

}

exports.WordFreqCorpSensei60k = WordFreqCorpSensei60k;
