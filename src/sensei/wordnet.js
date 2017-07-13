'use strict';
const Q = require('q');
const lineReader = require('line-reader');
const async = require('async');
const wndb = require('wndb-with-exceptions');
const WordNet = require('node-wordnet');

const suffixes = ['adj', 'adv', 'noun', 'verb'];

const basicPOS = {n:'noun', v:'verb', a:'adjective', r:'adverb', s:'adjective satellite'};
const basicFunctions = ['definition', 'synonym set', 'element', 'part of speech'];

class WordnetSensei {

  constructor(apiClient) {
  	this.apiClient = apiClient;
	  this.wordnet = new WordNet();
  }

  // set up basic Diary entries (free identifiers) that are used extensively by this sensei
  // just ensure that they exist
  basic(cb) {
  	var self = this;
  	self.basicPOSInstances = {};
  	self.basicFunctionInstances= {};
  	// basic functions
  	      Q.nfcall(self.apiClient.createStoredFunction, 'definition',     null, null, 'function', 'string', 1, ['string'], null, 0, null)
  	        .then((err, freeIdentifier) => { self.basicFunctionInstances['definition'] = freeIdentifier })

  	.then(Q.nfcall(self.apiClient.createStoredFunction, 'synonym set',    null, null, 'function', 'string', 1, ['number'], null, 0, null))
  	        .then((err, freeIdentifier) => { self.basicFunctionInstances['synonym set'] = freeIdentifier })

  	.then(Q.nfcall(self.apiClient.createStoredFunction, 'element',        null, null, 'function', 'string', 1, ['Array'],  null, 0, null))
  	        .then((err, freeIdentifier) => { self.basicFunctionInstances['element'] = freeIdentifier })

  	.then(Q.nfcall(self.apiClient.createStoredFunction, 'part of speech', null, null, 'function', 'string', 1, ['number'], null, 0, null))
  	        .then((err, freeIdentifier) => { self.basicFunctionInstances['part of speech'] = freeIdentifier })
  	.then((err) => {
  		if (err) return cb(err);
	  	// basic part-of-speech
	  	async.eachSeries(basicPOS.keys(), (basicPosAbbreviation, cb2) => {
	  		const basicPosWord = basicPOS[basicPosAbbreviation];
		  	self.apiClient.createStoredFunction(basicPosWord, null, basicPosWord, 'string', null, 0, null, null, null, null, (err2, freeIdentifier) => {
		  		self.basicPOSInstances[basicPosWord] = freeIdentifier;
		  		cb2(err2);
		  	});
	  	}, (err3) => {
	  		cb(err3);
	  	});
	  });

  }

  // parse through the Wordnet indexes and use the JS Wordnet library API to look up each entry's details
  // add all relevent data to the Diary
  lookupAllWords() {
  	this.basic((err) => {
	  	var self = this;
			async.eachSeries(suffixes, (suffix, cb) => {
				var filepath = wndb.path + '\\index.' + suffix;
				lineReader.eachLine(filepath, function(line, last, cb2) {
					if (line.substr(0,1) == ' ') return cb2();
					var word = line.substr(0, line.indexOf(' ')); 

					self.wordnet.lookup(word, function(results) {
						// store words
				    async.eachSeries(results, (result, cb3) => {
			        // console.log('------------------------------------');
			        // console.log(result.synsetOffset);
			        // console.log(result.pos);
			        console.log(result.lemma);
			        // console.log(result.synonyms);
			        // console.log(result.pos);
			        // console.log(result.gloss);

			        // sub: (synset $word) -> $synset
				    	self.apiClient.createStoredFunction(word, null, word, 'string', null, 0, null, null, 0, null, (freeIdentifierWord) => {
				    		self.apiClient.createApplication(self.basicFunctionInstances['synonym set'].id, freeIdentifierWord.id, (applicationSynsetWord) => {
				    	    self.apiClient.createStoredFunction("synset-" + result.synsetOffset, null, result.synsetOffset, 'string', null, 0, null, null, 0, null, (freeIdentifierSynset) => {
				    		    self.apiClient.createSubstitution(applicationSynsetWord.id, freeIdentifierSynset.id, (substiution1) => {
				    		    	// sub: (element $synset) -> word
				    		    	self.apiClient.createApplication(self.basicFunctionInstances['element'].id, freeIdentifierSynset.id, (applicationElementSynset) => {
				    		    	  self.apiClient.createSubstitution(applicationElementSynset.id, freeIdentifierWord.id, (substiution2) => {
				    		    	    cb3();
				    		    	  });
				    		    	});
				    		    });
				    		  });
				    	  });
				    	});
				    }, (err2) => {
				    	if (last) cb();
				    	else      cb2(true); // true: keep reading
				    });
					});
				});
			});
		});
  }

}

exports.WordnetSensei = WordnetSensei;