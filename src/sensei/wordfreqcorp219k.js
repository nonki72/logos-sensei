'use strict';
const fs = require('fs');
const Q = require('q');
var http = require('http');

const columns = ['rank', 'word', 'freq', '#texts', '%caps', 'blog', 'web', 'TVM', 'spok', 'fic', 'mag', 'news', 'acad', 'blogPM', 'webPM', 'TVMPM', 'spokPM', 'ficPM', 'magPM', 'newsPM', 'acadPM'];
const maxFreq = 50074257;

class WordFreqCorpSensei219k {

    constructor() {
        this.wordsCount = 0;
        this.writeWordsCount = 0;
        this.promises = Q();
    }

    createWordFrequency(name, freq) {
        return new Promise((resolve, reject) => {
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
                    resolve();
                });
            });
            req.on('error', function(e) {
                console.log('problem with request: ' + e.message);
                reject(e);
            });
            req.write('{ "freq" : '+freq+' }');
            req.end();
        });
    }

    async teachSub(wordObjs) {
        try {
            for (let obj of wordObjs) {
                if (obj == null || obj.word === undefined) continue;
                await this.createWordFrequency(obj.word,obj.freq);
                console.log((this.writeWordsCount)+" > "+obj.word);
                this.writeWordsCount++;
            }
        } catch (e) {
            console.error(e);
        }
    }

    setup() {
        const self = this;
        const wordObjs = [];
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
            const freq = split[3];
            const frequency = freq / maxFreq;
            var obj = {word: word, freq: frequency}
            wordObjs.push(obj);
            self.wordsCount++;
        });
        console.log('Done, count: ' + self.wordsCount);
        return wordObjs;
    }

    teach() {
        this.promises = Q.fcall(() => { 
            try {
                const wordObjs = this.setup();
                console.log('Completed teaching word frequencies setup.');
                        
                this.teachSub(wordObjs);
                console.log('Completed teaching word frequencies.'); 
            } catch (e) {
                console.error(e);
            }
        }); 
        return this.promises;
    }

}


exports.WordFreqCorpSensei219k = WordFreqCorpSensei219k;
