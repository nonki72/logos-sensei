'use strict';
const Q = require('q');
Q.map = require('q-map').map;
var w2v = require( 'word2vec' );

class Word2VecSensei {

  constructor(apiClient) {
  	this.apiClient = apiClient;
	
  }


  async basic() {
	const promise = new Promise((resolve, reject) => {
		w2v.word2vec( __dirname + '/../../corpus/enwiki_20180420_100d.txt', __dirname + '/../../gen/enwiki_20180420_100d_vectors.txt', {
			cbow: 1,
			size: 200,
			window: 8,
			negative: 25,
			hs: 0,
			sample: 1e-4,
			threads: 20,
			iter: 15,
			minCount: 2
		}, function(exitCode) {
			if (exitCode !== 0) {
				return reject(new Error('word2vec failed, exit code: '+ exitCode));
			}
			return resolve(null);
		});
	});

	await promise;

	return [];
  }


  teach() {
  	var self = this;

  	var promises = Q.fcall(() => {console.log('Establishing basic definitions...')});
  	promises = promises.then(() => {return self.basic()});
  	promises = promises.then(() => {console.log('Establishing modules and classes...')});
	promises = promises.then(this.apiClient.createModule('w2v', 'word2vec'));
  	promises = promises.then(() => {console.log('Creating Word2Vec functions...')});

	  // make the code that will go into the database as free identifiers

	promises = promises.then(() => {
		var data = {
			  name: 'getSimilarity',
			  astid: null, 
			  fn: `
var defer = Q.defer();
console.log("getSimilarity ARGS: " + CTX.args.word1 + ", " + CTX.args.word2);
async function run() {  
    try {  
		w2v.loadModel( './gen/enwiki_20180420_100d_vectors.txt', function( error, model ) {
			console.log( model );
	
			const similarity = model.similarity(CTX.args.word1, CTX.args.word2);
			console.log("getSimilarity RESPONSE: " + JSON.stringify(similarity));
			defer.resolve(similarity);
		});
	} catch (err) {
		console.error("getSimilarity REJECT: " + err);
		defer.reject(err);
	}
}
run();
defer.promise`, 
			  fntype: 'number', 
			  fnclas: null,
			  fnmod: null,
			  argnum: 1, 
			  argtypes: [["word1","string"],["word2","string"]], 
			  modules: ['w2v'],
			  memoize: true,
			  promise: true,
			  testargs: ["vector", "motion"]
		};

		return self.apiClient.createStoredFunction(data);
	});


    return promises;

  }
}

exports.Word2VecSensei = Word2VecSensei;


