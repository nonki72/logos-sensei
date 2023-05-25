'use strict';
const fs = require('fs');
const Q = require('q');
var http = require('http');

class WordFreqSensei {

    constructor() {
        this.wordsCount = 0;
        this.wordObjs = [];
        this.readWordsCount = 0;
        this.writeWordsCountSub = 0;
        this.promises = Q();
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
            console.log('Status: ' + res.statusCode);
            console.log('Headers: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            res.on('data', function (body) {
                console.log('Body: ' + body); 
                self.writeWordsCountSub++;
            });
        });
        req.on('error', function(e) {
            console.log('problem with request: ' + e.message);
        });
        req.write('{ "freq" : '+freq+' }');
        req.end();
    }

    waitSub() {
        if (this.writeWordsCountSub <= 99) {
            setTimeout(this.waitSub.bind(this), 10); 
        } else {
            this.writeWordsCountSub = 0;
            this.teachSub();
        }
    }

    teachSub() {
        for(var i = 0; i < 100; i++) {
            var obj = this.wordObjs[this.readWordsCount++];
            console.log(">"+obj.word);
            setTimeout(this.createWordFrequency.bind(this,obj.word,obj.freq),10);
        };
        setTimeout(this.waitSub.bind(this), 10); 

    }

    teach() {
        var self = this;
        console.log('Starting WordFreq simple teaching program...');
  
        console.log('Reading wordfreq corpus...');

        // read words straight from the corpus
        // TODO: (use them to perform wordnet lookup)
        const filepath = __dirname + '/../corpus/words_219k_m2355.txt';

        const file = fs.readFileSync(filepath, 'utf-8');
        file.split(/\r?\n/).forEach((line) =>  {
            const split = line.split('\t');
            if (split.length == 0) return;
            const word = split[1];
            const freq = split[2];
            var obj = {word: word, freq: freq}
            self.wordObjs.push(obj);
            self.wordsCount++;
        });
        console.log('Done, count: ' + self.wordsCount);

        this.teachSub();

        
        self.promises = self.promises.then(new Promise((resolve) => {console.log('Completed teaching word frequencies.'); resolve()}));
        return self.promises;
    }
}
var wfs = new WordFreqSensei();
wfs.teach();
