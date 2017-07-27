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

/* Wordnet identifier names
 *
 * WordnetFunc*
 * WordnetPos*
 * WordnetWord*
 * WordnetSynset*
 */

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
  	self.apiClient.createStoredFunction({
				name: 'WordnetFuncDefinition',
				astid: null, 
				fn: null, 
				fntype: 'identifier', 
				fnclass: 'object', // array of words 
				argnum: 1, 
				argtypes: `[["word","string"]]`, 
				modules: null, 
				memoize: true, 
				testargs: ["test"]
	  	})
  	  .then((freeIdentifier) => { self.basicFunctionInstances['definition'] = freeIdentifier }),

    self.apiClient.createStoredFunction({
				name: 'WordnetFuncSynset',
				astid: null, 
				fn: null, 
				fntype: 'identifier', 
				fnclass: 'set', 
				argnum: 1, 
				argtypes: `[["synset","number"]]`, 
				modules: null, 
				memoize: true, 
				testargs: ["123"]
	  	})
  	  .then((freeIdentifier) => { self.basicFunctionInstances['synonym set'] = freeIdentifier }),

  	self.apiClient.createStoredFunction({
				name: 'WordnetFuncElement',
				astid: null, 
				fn: null, 
				fntype: 'identifier', 
				fnclass: 'string', 
				argnum: 1, 
				argtypes: `[["set","object"]]`, 
				modules: null, 
				memoize: true, 
				testargs: [["test"]]
	  	})
  	  .then((freeIdentifier) => { self.basicFunctionInstances['element'] = freeIdentifier }),

  	self.apiClient.createStoredFunction({
				name: 'WordnetFuncPOS',
				astid: null, 
				fn: null, 
				fntype: 'identifier', 
				fnclass: 'string', 
				argnum: 1, 
				argtypes: `[["synset","number"]]`, 
				modules: null, 
				memoize: true, 
				testargs: ["123"]
	  	})
  	  .then((freeIdentifier) => { self.basicFunctionInstances['part of speech'] = freeIdentifier })
  	];

  	// basic part-of-speech
  	var basicPromises = Object.keys(basicPOS).reduce((accumulator, basicPosAbbreviation) => {
  		const basicPosWord = basicPOS[basicPosAbbreviation];
  		return accumulator.concat([
  			self.apiClient.createStoredValue("WordnetPos"+basicPosAbbreviation.toUpperCase(), 'string', null, basicPosWord)
  			  .then((freeIdentifier) => { self.basicPOSInstances[basicPosAbbreviation] = freeIdentifier })
  		]);

  	}, basicPromises);

    return Q.all(basicPromises);

  }

  // parse through the Wordnet indexes and use the JS Wordnet library API to look up each entry's details
  // add all relevent data to the Diary
  teach() {
	  var self = this;

  	var promises = Q.fcall(() => {console.log('Establishing basic definitions...')});
  	promises = promises.then(() => {return this.basic()});
  	promises = promises.then(() => {console.log('Reading wordnet corpus...')});

    // read words straight from the indexes
    // (use them to perform lookup)
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
				console.log("Completed reading suffix " + suffix + ", count: " + words.length);
				return words;
			});

     };

    // for each index file
		promises = promises.then(() => {
		  return Q.all(suffixes.map(getWordsPromise))
		  .then((wordsArrays) => {
			  var words = [].concat.apply([], wordsArrays);
			  console.log("Completed reading all indexes, total count: " + words.length);
			  return words;
		  })
		 });

		// begin teaching
		promises = promises
		  .then((words) => {console.log('Starting Wordnet simple teaaching program...');return Q(words)})
    	.then((words) => {

        // teach routine for a word
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
						process.stdout.write(word+'..');
		        // sub: (synset $word) -> $synset
		    		return self.apiClient.createStoredValue("WordnetWord" + numToLetters(result.synsetOffset) + word.replace(/[^a-zA-Z]/g, ''), 'string', null, word)
			    	  .then((freeIdentifierWord) => {
			    		return self.apiClient.createApplication(self.basicFunctionInstances['synonym set'].id, freeIdentifierWord.id)
			    		   .then((applicationSynsetWord) => {
			    	    return self.apiClient.createStoredValue("WordnetSynset" + numToLetters(result.synsetOffset), 'number', null, parseInt(result.synsetOffset))
			    	      .then((freeIdentifierSynset) => {
			    		    return self.apiClient.createSubstitution('eta', applicationSynsetWord.id, freeIdentifierSynset.id)
			    		      .then((substiution1) => {
			    		    	// sub: (element $synset) -> word
			    		    	return self.apiClient.createApplication(self.basicFunctionInstances['element'].id, freeIdentifierSynset.id)
			    		    	  .then((applicationElementSynset) => {
			    		    	  return self.apiClient.createSubstitution('eta', applicationElementSynset.id, freeIdentifierWord.id);
			    		    	});
			    		    });
			    		  });
			    		});
				    });//.then(()=>{process.stdout.write('=')});
			    }));
        };

        // for each word
        // (wordnet lib's lookupAsync() is somehow faulty.. use deferred instead to make it a promise)
		    return Q.map(words, (word) => {
		    	  var deferred = Q.defer();
		    	  self.wordnet.lookup(word,(err, results)=> {
		    	  	if (err) deferred.reject(err);
		    	  	deferred.resolve(results);
		    	  });
		    	  return deferred.promise
		    	  .then((results) => {return Q({word: word, results: results})})
		    	  .then(teachPromise)
		    }, 20);
    	});

    	promises.done();
    }
  
}


exports.WordnetSensei = WordnetSensei;


function numToLetters(number) {
	var num = new String(number);
	var out = '';
	for (var i = 0; i < num.length; i++) {
		var char =  String.fromCharCode(94 + num[i]);
		if (i == 0) char = char.toUpperCase();
		out += char;
	}
	return out;
}

function wordsToChunks(words) {
	var wordsChunks = [];
	for (var i = 0; i < words.length; i+=20) {
		var wordsChunk = words.slice(wordCounter, wordCounter + 20);
		wordsChunks.push(wordsChunk);
  }
  return wordsChunks;
}
