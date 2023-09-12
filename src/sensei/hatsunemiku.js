'use strict';
const fs = require('fs');
const Q = require('q');
var http = require('http');
const brain = require('brain.js');
var zlib = require('zlib');


class HatsuneMikuSensei {

    constructor(apiClient) {
        this.promises = Q();
        this.apiClient = apiClient;
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
        const trainingOutputData = JSON.stringify(lstm.toJSON());
        var trainingOutputDataZ64 = zlib.deflateSync(trainingOutputData).toString('base64');
//        let trainingOutputDataZBin = Buffer.from(trainingOutputDataZ64, 'base64');


        //
        self.promises = self.promises.then(this.apiClient.createModule('DataLib', './datalib'));
        self.promises = self.promises.then(this.apiClient.createModule('zlib', 'zlib'));
        self.promises = self.promises.then(this.apiClient.createModule('brain', 'brain.js'));
        self.promises = self.promises.then(this.apiClient.createModule('tools', './tools'));

        // create training data fragment
        self.promises = self.promises.then(() => {
            console.log('---HatsuneMikuTrainingDataLyrics---');

            return self.apiClient.createStoredValue('HatsuneMikuTrainingDataLyrics', 'string', null, null, trainingOutputDataZ64);
        });

        self.promises = self.promises.then(() => {
            console.log('---HatsuneMikuNextWordFn---');
            var data = {
                  name: 'HatsuneMikuNextWordFn',
                  astid: null, 
                  fn: `
    var defer = Q.defer();
    const lastWord = CTX.args.lastWord;
    console.log("HMNW Arg:" + JSON.stringify(lastWord));
    async function run(lastWord) {
        const trainingDataFreeIdentifier = await tools.promisify(DataLib.getFreeIdentifierByName)("HatsuneMikuTrainingDataLyrics")
          .catch((reason) => {console.error("HMNW REJECT: " + reason); return defer.reject(reason);});
        if (trainingDataFreeIdentifier == null) {
            return setTimeout(run, 1000);
        }
    
        const buffer = Buffer.from(trainingDataFreeIdentifier.fn, 'base64');
        const trainingOutputData = zlib.inflateSync(buffer);
        const trainingOutputDataJson = JSON.parse(trainingOutputData);
    
        const used = process.memoryUsage().heapUsed / 1024 / 1024;
        console.log("The training data uses approximately " + Math.round(used * 100) / 100 + " MB");
      
        // load
        const lstm = new brain.recurrent.LSTM();
        lstm.fromJSON(trainingOutputDataJson);
    
        // run
        const run1 = lstm.run(lastWord);
        const words = run1.split(" ");
        const firstWordRun1 = (words[0] == "") ? words[1] : words[0];
        console.log("HMNW RESPONSE: " + firstWordRun1);
        defer.resolve(firstWordRun1);
    }
    run(lastWord);
    defer.promise`, 
                  fntype: 'string', 
                  fnclas: null,
                  fnmod: null,
                  argnum: 1, 
                  argtypes: [["lastWord","string"]], 
                  modules: ["DataLib", "zlib", "brain", "tools"],
                  memoize: true,
                  promise: true,
                  testargs: ["test"]
            };
    
            return self.apiClient.createStoredFunction(data);
        });
    
    

        self.promises = self.promises.then(new Promise((resolve) => {console.log('Completed teaching hatsune miku neural network training setup.'); resolve()}));

        
        return self.promises;
    }
}


exports.HatsuneMikuSensei = HatsuneMikuSensei;
