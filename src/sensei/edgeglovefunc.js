'use strict';
const Q = require('q');
Q.map = require('q-map').map;

class EdgeGloveFuncSensei {

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
	promises = promises.then(this.apiClient.createModule('edgeglove', './edgeglove.js'));
	promises = promises.then(this.apiClient.createModule('JS', null));
	promises = promises.then(this.apiClient.createClass('Array', 'JS'));
  	promises = promises.then(() => {console.log('Creating Edge-ML GloVe NLP functions...')});

	  // make the code that will go into the database as free identifiers

	promises = promises.then(() => {
		var data = {
			  name: 'getNearestNeighbors',
			  astid: null, 
			  fn: `
var defer = Q.defer();
console.log("getNNs ARG:" + JSON.stringify(CTX.args.word));
async function run() {  
    try {  
		const nns = edgeglove.edgegloveFreqWord(CTX.args.word, 100, 100);
        console.log("getNNs RESPONSE: " + JSON.stringify(nns));
		defer.resolve(nns);
	} catch (err) {
		console.error("getNNs REJECT: " + err);
		defer.reject(err);
	}
}
run();
defer.promise`, 
			  fntype: 'object', 
			  fnclas: 'Array',
			  fnmod: 'JS',
			  argnum: 1, 
			  argtypes: [["word","string"]], 
			  modules: ['edgeglove'],
			  memoize: true,
			  promise: true,
			  testargs: ["edge"]
		};

		return self.apiClient.createStoredFunction(data);
	});


    return promises;

  }
}

exports.EdgeGloveFuncSensei = EdgeGloveFuncSensei;


