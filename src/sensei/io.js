'use strict';
const Q = require('q');
Q.map = require('q-map').map;
const async = require('async');


class IoSensei {

  constructor(apiClient) {
  	this.apiClient = apiClient;
  }

  basic() {
  	var promises = this.apiClient.createModule('readline', 'readline');
  	return promises;
  }

  teach() {
  	var self = this;

  	var promises = Q.fcall(() => {console.log('Establishing dependencies...')});
  	promises = promises.then(() => {return self.basic()});
  	promises = promises.then(() => {console.log('Creating Input/Output functions...')});

    // read a line
    // returns a promise so it will wait for input
    promises = promises.then(() => {
	  	var data = {
				name: 'readlineInputLine',
				astid: null, 
				fn: `
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
var defer = Q.defer();
var response;
rl.setPrompt("Waiting for input...");
rl.prompt();
rl.on('line', (userInput) => {
    response = userInput;
    rl.close();
});
rl.on('close', () => {
    return defer.resolve(response);
});
defer.promise`, 
				fntype: 'string', 
				fnclass: null, 
				argnum: 0, 
				argtypes: null, 
				modules: ['readline'], 
				memoize: false, 
				promise: true, 
				testargs: null
	  	};

	    return self.apiClient.createStoredFunction(data);
		});

    // print a line
    promises = promises.then(() => {
	  	var data = {
				name: 'readlineOutputLine',
				astid: null, 
				fn: `
console.log(CTX.args.line)`, 
				fntype: undefined, 
				fnclass: null, 
				argnum: 1, 
				argtypes: [["line","string"]], 
				modules: null, 
				memoize: false,  
				promise: false,
				testargs: ["konnichiwa sekai"]
	  	};

	    return self.apiClient.createStoredFunction(data);
		});

    return promises;
  }

}


exports.IoSensei = IoSensei;
