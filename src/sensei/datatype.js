'use strict';
const Q = require('q');
Q.map = require('q-map').map;
const async = require('async');

/* Data type functions
 *
 * DataTypes*
 */

class DataTypeSensei {

  constructor(apiClient) {
  	this.apiClient = apiClient;

  	this.testValues = {};
  }

  
  basic() {
  	var self = this;

  	// lambda elements test values
  	return []
  }

  teach() {
  	var self = this;

  	var promises = Q.fcall(() => {console.log('Establishing modules...')});
  	promises = promises.then(() => {console.log('Establishing test definitions...')});
  	promises = promises.then(() => {return self.basic()});
  	promises = promises.then(() => {console.log('Creating inter data type functions...')});
  	promises = promises.then(() => {console.log(self.testValues)});


	  // select topic
  	promises = promises.then(() => {
		console.log('---SelectTopic---');
	  	var data = {
				name: 'SelectTopic',
				astid: null, 
				fn: `
var defer = Q.defer();
console.log("CTX ARG:"+ CTX.args.input);
if (!Array.isArray(CTX.args.input)) {
	defer.reject();
} else {
	const randomInt = Grammar.getRandomInt(0,CTX.args.input.length);
	defer.resolve(CTX.args.input[randomInt]);
}
defer.promise`, 
				fntype: 'string',  
				fnmod: null,
				fnclass: null, 
				argnum: 1, 
				argtypes: [["input","undefined","JS","Array"]], 
				modules: ['Grammar'], 
				memoize: false, 
				promise: true,
				testargs: [["test", "key", "word", "finder"]]
	  	};

	  	return self.apiClient.createStoredFunction(data);
	  });

    return promises;

  }
}

exports.DataTypeSensei = DataTypeSensei;


