'use strict';
const Q = require('q');
Q.map = require('q-map').map;

class SpacySensei {

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
  	promises = promises.then(() => {console.log('Establishing modules and classes...')});
	promises = promises.then(this.apiClient.createModule('spacyjs', 'spacy-js'));
	promises = promises.then(this.apiClient.createModule('JS', null));
	promises = promises.then(this.apiClient.createClass('Array', 'JS'));
  	promises = promises.then(() => {console.log('Creating spaCy functions...')});

	  // make the code that will go into the database as free identifiers

	promises = promises.then(() => {
		var data = {
			  name: 'getNlpDoc',
			  astid: null, 
			  fn: `
var defer = Q.defer();
console.log("NlpDoc ARG:" + JSON.stringify(CTX.args.sentence));
async function run() {  
    try {  
        const nlp = spacyjs.load('en_core_web_sm');
        const doc = await nlp(CTX.args.sentence);
        console.log("NlpDoc RESPONSE: (doc)");
		defer.resolve(doc);
	} catch (err) {
		console.error("NlpDoc REJECT: " + err);
		defer.reject(err);
	}
}
run();
defer.promise`, 
			  fntype: 'object', 
			  fnclas: 'Array',
			  fnmod: 'JS',
			  argnum: 1, 
			  argtypes: [["sentence","string"]], 
			  modules: ['spacyjs'],
			  memoize: true,
			  promise: true,
			  testargs: ["this is a test of hatsune miku get NLP doc"]
		};

		return self.apiClient.createStoredFunction(data);
	});


    return promises;

  }
}

exports.SpacySensei = SpacySensei;


