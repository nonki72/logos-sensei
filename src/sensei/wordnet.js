'use strict';
const Q = require('q');
Q.map = require('q-map').map;
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

  	// basic functions                   name,          astid,  fn,          fntype,  fnclass, argnum, argtypes, modules, memoize, testargs
  	var basicPromises = [
  	self.apiClient.createStoredFunction('definition',     null, undefined, 'undefined', 'string', 1, '["string"]', null, 0, null)
  	  .then((freeIdentifier) => { self.basicFunctionInstances['definition'] = freeIdentifier }),

    self.apiClient.createStoredFunction('synonym set',    null, undefined, 'undefined', 'string', 1, '["number"]', null, 0, null)
  	  .then((freeIdentifier) => { self.basicFunctionInstances['synonym set'] = freeIdentifier }),

  	self.apiClient.createStoredFunction('element',        null, undefined, 'undefined', 'string', 1, '["Array"]',  null, 0, null)
  	  .then((freeIdentifier) => { self.basicFunctionInstances['element'] = freeIdentifier }),

  	self.apiClient.createStoredFunction('part of speech', null, undefined, 'undefined', 'string', 1, '["number"]', null, 0, null)
  	  .then((freeIdentifier) => { self.basicFunctionInstances['part of speech'] = freeIdentifier })
  	];

  	// basic part-of-speech
  	var basicPromises = Object.keys(basicPOS).reduce((accumulator, basicPosAbbreviation) => {
  		const basicPosWord = basicPOS[basicPosAbbreviation];
  		return accumulator.concat([
  			self.apiClient.createFreeIdentifier(basicPosWord)
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

		var getWordsPromise = (suffix) => {
			var filepath = wndb.path + '\\index.' + suffix;
      var words = [];

			var lineReaderPromise = Q.denodeify(lineReader.eachLine);
			return lineReaderPromise(filepath, function(line) {
				if (line.substr(0,1) == ' ') return;
				var word = line.substr(0, line.indexOf(' '));
				words.push(word);
				// if (words.length % 200 == 0) deferred.notify(words.length);
			}).then(() => {
				console.log("completed reading suffix " + suffix + ", count: " + words.length);
				return words;
			});

     };

		promises = promises.then(() => {
		  return Q.all(suffixes.map(getWordsPromise))
		  .then((wordsArrays) => {
			  var words = [].concat.apply([], wordsArrays);
			  console.log("completed reading indexes, count: " + words.length);
			  return words;
		  })
		 });


		promises = promises
    	.then((words) => {

				var teachPromise = function(obj) {
					var word = obj.word;
					var results = obj.results;
					// store words
			    return Q.all(results.map((result) => {
		        // console.log('------------------------------------');
		        // console.log(result.synsetOffset);
		        // console.log(result.pos);
		        // console.log(word + "<>" + result.lemma);
		        // console.log(result.synonyms);
		        // console.log(result.pos);
		        // console.log(result.gloss);
console.log(word);
		        // sub: (synset $word) -> $synset
		    		return self.apiClient.createFreeIdentifier(word)
			    	  .then((freeIdentifierWord) => {
			    		return self.apiClient.createApplication(self.basicFunctionInstances['synonym set'].id, freeIdentifierWord.id)
			    		   .then((applicationSynsetWord) => {
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
				    }).then(()=>{process.stdout.write('=')});
			    }));
        };

		    return Q.map(words, (word) => {
		    	  var deferred = Q.defer();
		    	  self.wordnet.lookup(word,(err, results)=> {
		    	  	if (err) deferred.reject(err);
		    	  	deferred.resolve(results);
		    	  });
		    	  return deferred.promise
		    	  .then((results) => {console.log(results);return Q({word: word, results: results})})
		    	  .then(teachPromise)
		    }, 10);
    	});

    	promises.done();
    }
  
}


exports.WordnetSensei = WordnetSensei;



function wordsToChunks(words) {
	var wordsChunks = [];
	for (var i = 0; i < words.length; i+=20) {
		var wordsChunk = words.slice(wordCounter, wordCounter + 20);
		wordsChunks.push(wordsChunk);
  }
  return wordsChunks;
}
