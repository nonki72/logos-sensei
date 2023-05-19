'use strict';
const http = require('http');

class WordFreqSensei {

    constructor() {
    }



     doRequest(options, freq) {
        return new Promise ((resolve, reject) => {
          let req = http.request(options);
      
          req.on('response', res => {
            resolve(res);
          });
      
          req.on('error', err => {
            reject(err);
          });
      
          req.write('{ "freq" : '+freq+' }',);
          req.end();
        }); 
      }
      



    teach() {
var self = this;

        var optionsArray = [];
        for (let i = 0; i < 100; i++) {
            var word = {word:"testing" + i, freq: i};
            console.log(word);

            const nameEscaped = encodeURI(word.word);
                    
            var options = {
                hostname: '127.0.0.1',
                port: 9001,
                path: "/api/frequency/" + nameEscaped,
                method: 'post',
                headers: {
                        "content-type": "application/json",
                    },     
                freq: word.freq
            };

            optionsArray.push(options);
        }

        // options array complete

        optionsArray.forEach(async function(options) {
            try {
            let res = await self.doRequest(options,options.freq);
            } catch (err) {
            console.log(err);
            }
        });
    }
}
var wfs = new WordFreqSensei();
wfs.teach();
