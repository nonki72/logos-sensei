'use strict';
const fs = require('fs');
const Q = require('q');
var http = require('http');
const brain = require('brain.js');

class HatsuneMikuSensei {

    constructor() {
        this.promises = Q();
    }

    teach(args) {
        var self = this;
        console.log('Starting Hatsune Miku neural network teaching program...');

        // args
        var maxLines = 50;
        var maxIterations = 100;
        if (args == undefined || args.length < 2) {
            console.log("Takes 2 arguments: maxLines maxIterations (outputFilename)");
            console.log("Defaulting to 50 100 ./data/hatsune-training-data.json");
        } else {
            maxLines = args[0];
            maxIterations = args[1];    
        }
        var outputFilename;
        if (args != undefined && args.length > 2) {
            outputFilename = args[2];
        } else {
            outputFilename = "./data/hatsune-training-data.json"
        }

        // read
        console.log('Reading hatsune miku lyrics corpus...');
        var i = 0;
        const trainingInputData = [];
        const allFileContents = fs.readFileSync('./corpus/hatsune_miku_lyrics_4k.txt', 'utf-8');
        allFileContents.split(/\r?\n/).every(line =>  {
            i++;
            console.log(`Line from file: ${line}`);
            trainingInputData.push(line);
            if (i >= maxLines) {
                return false;
            }
            return true;
        });
        const used = process.memoryUsage().heapUsed / 1024 / 1024;
        console.log(`The list uses approximately ${Math.round(used * 100) / 100} MB`);
        console.log(`The list is ${trainingInputData.length} lines long`);

        // train
        const lstm = new brain.recurrent.LSTM();
        const result = lstm.train(trainingInputData, {
            iterations: maxIterations,
            log: details => console.log(details),
            errorThresh: 0.011
        });

        // store
        const trainingOutputData = lstm.toJSON();

        // create training data fragment
        self.promises = self.promises.then(() => {
            console.log('---HatsuneMikuTrainingDataLyrics---');
            var data = {
                    name: 'HatsuneMikuTrainingDataLyrics',
                    astid: null, 
                    fn: trainingOutputData, 
                    fntype: 'object',
                    argnum: 0, 
                    argtypes: [], 
                    modules: [], 
                    memoize: false, 
                    promise: false
            };

            return self.apiClient.createStoredFunction(data);
        });




        self.promises = self.promises.then(new Promise((resolve) => {console.log('Completed teaching hatsune miku neural network training setup.'); resolve()}));

        self.promises = self.promises.then(this.teachSub());

        
        return self.promises;
    }
}


exports.HatsuneMikuSensei = HatsuneMikuSensei;
