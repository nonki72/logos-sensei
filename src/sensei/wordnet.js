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
  basic() {
  	var self = this;
  	self.basicPOSInstances = {};
  	self.basicFunctionInstances= {};

  	// basic functions
  	var basicPromises = [
  	self.apiClient.createStoredFunction('definition',     null, null, 'function', 'string', 1, ['string'], null, 0, null)
  	  .then((freeIdentifier) => { self.basicFunctionInstances['definition'] = freeIdentifier }),

    self.apiClient.createStoredFunction('synonym set',    null, null, 'function', 'string', 1, ['number'], null, 0, null)
  	  .then((freeIdentifier) => { self.basicFunctionInstances['synonym set'] = freeIdentifier }),

  	self.apiClient.createStoredFunction('element',        null, null, 'function', 'string', 1, ['Array'],  null, 0, null)
  	  .then((freeIdentifier) => { self.basicFunctionInstances['element'] = freeIdentifier }),

  	self.apiClient.createStoredFunction('part of speech', null, null, 'function', 'string', 1, ['number'], null, 0, null)
  	  .then((freeIdentifier) => { self.basicFunctionInstances['part of speech'] = freeIdentifier })
  	];

  	// basic part-of-speech
  	var basicPromises = Object.keys(basicPOS).reduce((accumulator, basicPosAbbreviation) => {
  		const basicPosWord = basicPOS[basicPosAbbreviation];
  		return accumulator.concat([
  			self.apiClient.createStoredFunction(basicPosWord, null, basicPosWord, 'string', null, 0, null, null, null, null)
  			  .then((freeIdentifier) => { self.basicPOSInstances[basicPosWord] = freeIdentifier })
  		]);

  	}, basicPromises);

    return Q.all(basicPromises);

  }

  // parse through the Wordnet indexes and use the JS Wordnet library API to look up each entry's details
  // add all relevent data to the Diary
  lookupAllWords() {
	  var self = this;

  	var promises = Q.fcall(() => {console.log('Establishing basic definitions...')});
  	promises = promises.then(() => {return this.basic()});
  	promises = promises.then(() => {console.log('Reading wordnet corpus...')});
  	var promiseChunks = [];
		async.eachSeries(suffixes, (suffix, suffixCb) => {
			var filepath = wndb.path + '\\index.' + suffix;
			var promiseChunk = [];

			lineReader.eachLine(filepath, function(line, last) {
				if (line.substr(0,1) == ' ') return true;
				var word = line.substr(0, line.indexOf(' '));

				promiseChunk.push(

					 self.wordnet.lookupAsync(word).then(function(results) {
					// store words
			    async.eachSeries(results, (result, wordnetCb) => {
		        // console.log('------------------------------------');
		        // console.log(result.synsetOffset);
		        // console.log(result.pos);
		        console.log(result.lemma);
		        // console.log(result.synonyms);
		        // console.log(result.pos);
		        // console.log(result.gloss);

		        // sub: (synset $word) -> $synset
			    		return self.apiClient.createStoredFunction(word, null, word, 'string', null, 0, null, null, 0, null)
				    	  .then((freeIdentifierWord) => {
				    		return self.apiClient.createApplication(self.basicFunctionInstances['synonym set'].id, freeIdentifierWord.id)
				    		 //  .then((applicationSynsetWord) => {
				    	  //   return self.apiClient.createStoredFunction("synset-" + result.synsetOffset, null, result.synsetOffset, 'string', null, 0, null, null, 0, null)
				    	  //     .then((freeIdentifierSynset) => {
				    		 //    return self.apiClient.createSubstitution(applicationSynsetWord.id, freeIdentifierSynset.id)
				    		 //      .then((substiution1) => {
				    		 //    	// sub: (element $synset) -> word
				    		 //    	return self.apiClient.createApplication(self.basicFunctionInstances['element'].id, freeIdentifierSynset.id)
				    		 //    	  .then((applicationElementSynset) => {
				    		 //    	  return self.apiClient.createSubstitution(applicationElementSynset.id, freeIdentifierWord.id);
				    		 //    	});
				    		 //    });
				    		 //  });
				    	  // });
			    	  });
			    	});
		      })
		    );

        if (promiseChunk.length >= 20) {
			    promiseChunks.push(promiseChunk);
        	promiseChunk = [];
        }

	    	return last ? false : true // true: keep reading
	    }, (err) => {
	    	if (err) throw err;
		    promiseChunks.push(promiseChunk);
		    suffixCb();
	    });
		}, (err) => {
			if (err) throw err;
			promiseChunks.forEach((chunk) => {
				promises = promises.then(Q.all(chunk));
			});
			promises.done();
		});
  }
}

exports.WordnetSensei = WordnetSensei;