'use strict';
const http = require('http');

class WordFreqSensei {

    constructor() {
    }

    createWordFrequency(name, freq) {
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
            });
        });
        req.on('error', function(e) {
            console.log('problem with request: ' + e.message);
        });
        req.write('{ "freq" : '+freq+' }');
        req.end();
    }

    teach() {
        for (let i = 0; i < 1000; i++) {
            var word = {word:"testing" + i, freq: i};
            console.log(word);
            this.createWordFrequency(word.word, word.freq);
        }

    }

}
var wfs = new WordFreqSensei();
wfs.teach();
