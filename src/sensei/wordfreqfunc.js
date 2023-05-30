'use strict';
const Q = require('q');
Q.map = require('q-map').map;
const async = require('async');
const AST = require('../../../logos/src/ast');

/* Native identifier names
 *
 * NativeFunc*
 */

class WordFreqFuncSensei {

  constructor(apiClient) {
  	this.apiClient = apiClient;
  }


  basic() {
	return [];
  }

  teach() {
  	var self = this;

  	var promises = Q.fcall(() => {console.log('Establishing basic definitions...')});
  	promises = promises.then(() => {return self.basic()});
  	promises = promises.then(() => {console.log('Creating Word Frequency functions...')});

	// create read frequency
  	promises = promises.then(() => {
		var data = {
			  name: 'WordFuncReadFrequency',
			  astid: null, 
			  fn: `
var defer = Q.defer();
DataLib.readWordFrequency(CTX.args.word, (word) => {
if (word == null) defer.reject();
else defer.resolve(word.frequency);
});
defer.promise`, 
			  fntype: 'number',  
			  fnclass: null, 
			  argnum: 1, 
			  argtypes: [["word","string"]], 
			  modules: null, 
			  memoize: true, 
			  promise: true,
			  testargs: ["test"]
		};

		return self.apiClient.createStoredFunction(data);
	});

	// create read frequency atleast
  	promises = promises.then(() => {
		var data = {
			  name: 'WordFuncReadWordFrequencyAtLeast',
			  astid: null, 
			  fn: `
var defer = Q.defer();
DataLib.readWordFrequencyAtLeast(CTX.args.frequency, (word) => {
if (word == null) defer.reject();
else defer.resolve(word.word);
});
defer.promise`, 
			  fntype: 'string',  
			  fnclass: null, 
			  argnum: 1, 
			  argtypes: [["frequency","number"]], 
			  modules: null, 
			  memoize: true, 
			  promise: true,
			  testargs: [0.2]
		};

		return self.apiClient.createStoredFunction(data);
	});


    return promises;

  }
}

exports.WordFreqFuncSensei = WordFreqFuncSensei;


