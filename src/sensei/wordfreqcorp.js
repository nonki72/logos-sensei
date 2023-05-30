'use strict';
const fs = require('fs');
const Q = require('q');
var http = require('http');

const columns = ['rank', 'word', 'freq', '#texts', '%caps', 'blog', 'web', 'TVM', 'spok', 'fic', 'mag', 'news', 'acad', 'blogPM', 'webPM', 'TVMPM', 'spokPM', 'ficPM', 'magPM', 'newsPM', 'acadPM'];
const maxFreq = 50074257;

class WordFreqCorpSensei {

    constructor() {
        this.wordsCount = 0;
        this.wordObjs = [];
        this.readWordsCount = 0;
        this.writeWordsCount = 0;
        this.writeWordsCountSub = 0;
        this.promises = Q();
        this.promise = Q.defer();
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
                self.writeWordsCount++;
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
        if (this.writeWordsCount >= this.readWordsCount) {
            this.promise.resolve();
        }
    }

    teachSub() {
        for(var i = 0; i < 100; i++) {
            var obj = this.wordObjs[this.readWordsCount++];
            console.log(">"+obj.word);
            setTimeout(this.createWordFrequency.bind(this,obj.word,obj.freq),10);
        };
        setTimeout(this.waitSub.bind(this), 10); 
        return this.promise.promise;
    }

    teach() {
        var self = this;
        console.log('Starting WordFreq simple teaching program...');
  
        console.log('Reading wordfreq corpus...');

        // read words straight from the corpus
        // TODO: (use them to perform wordnet lookup)
        const filepath = __dirname + '/../../corpus/words_219k_m2355.txt';

        const file = fs.readFileSync(filepath, 'utf-8');
        file.split(/\r?\n/).forEach((line) =>  {
            const split = line.split('\t');
            if (split.length == 0) return;
            const word = split[1];
            const freq = split[2];
            const frequency = freq / maxFreq;
            var obj = {word: word, freq: frequency}
            self.wordObjs.push(obj);
            self.wordsCount++;
        });
        console.log('Done, count: ' + self.wordsCount);
        self.promises = self.promises.then(new Promise((resolve) => {console.log('Completed teaching word frequencies setup.'); resolve()}));

        self.promises = self.promises.then(this.teachSub());

        
        return self.promises;
    }
}


exports.WordFreqCorpSensei = WordFreqCorpSensei;
