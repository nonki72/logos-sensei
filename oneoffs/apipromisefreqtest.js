'use strict';

const ApiClient = require('../src/apiclient');

class WordFreqSensei {

    constructor() {
        this.apiClient = new ApiClient.ApiClient("http://127.0.0.1:9001");
    }



     doRequest(word, freq) {
        return new Promise ((resolve, reject) => {
          this.apiClient.createWordFrequency(word, freq);
          console.log(word);
        }); 
      }
      



    teach() {
        var self = this;

        var optionsArray = [];
        for (let i = 0; i < 10000; i++) {
            var word = {word:"testing" + i, freq: i};
            

            optionsArray.push(word);
        }

        // options array complete

        optionsArray.forEach(async function(word) {
            try {
            let res = await self.doRequest(word.word,word.freq);
            } catch (err) {
            console.log(err);
            }
        });
    }
}
var wfs = new WordFreqSensei();
wfs.teach();
