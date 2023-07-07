'use strict';
var Promise = require("bluebird");
const lineReader = require('line-reader');
const async = require('async');
const wndb = require('wndb-with-exceptions');
const WordNet = require('node-wordnet');

const suffixes = ['adj', 'adv', 'noun', 'verb'];

const basicPOS = {n:'noun', v:'verb', a:'adjective', r:'adverb', s:'adjectiveSatellite'};
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
				fntype: 'string', 
				fnclass: null,
				argnum: 1, 
				argtypes: [["word","string"]], 
				modules: null, 
				memoize: true,  
				promise: false,
				testargs: ["test"]
	  	})
  	  .then((freeIdentifier) => { self.basicFunctionInstances['definition'] = freeIdentifier }),

    self.apiClient.createStoredFunction({
				name: 'WordnetFuncSynset',
				astid: null, 
				fn: null, 
				fntype: 'number', 
				fnclass: null,
				argnum: 1, 
				argtypes: [["word","string"]], 
				modules: null, 
				memoize: true,  
				promise: false,
				testargs: ["test"]
	  	})
  	  .then((freeIdentifier) => { self.basicFunctionInstances['synonym set'] = freeIdentifier }),

  	self.apiClient.createStoredFunction({
				name: 'WordnetFuncElement',
				astid: null, 
				fn: null, 
				fntype: 'string', 
				fnclass: null, 
				argnum: 1, 
				argtypes: [["set","number"]], 
				modules: null, 
				memoize: true,  
				promise: false,
				testargs: [123]
	  	})
  	  .then((freeIdentifier) => { self.basicFunctionInstances['element'] = freeIdentifier }),

  	self.apiClient.createStoredFunction({
				name: 'WordnetFuncPOS',
				astid: null, 
				fn: null, 
				fntype: 'string', 
				fnclass: null, 
				argnum: 1, 
				argtypes: [["synset","number"]], 
				modules: null, 
				memoize: true,  
				promise: false,
				testargs: [123]
	  	})
  	  .then((freeIdentifier) => { self.basicFunctionInstances['part of speech'] = freeIdentifier })
  	];

  	// basic part-of-speech
  	// TODO make this a stored function and apply them to the words below
  	var basicPromises2 = Object.keys(basicPOS).reduce((accumulator, basicPosAbbreviation) => {
  		const basicPosWord = basicPOS[basicPosAbbreviation];
  		return accumulator.concat([
  			self.apiClient.createStoredValue("WordnetPos"+basicPosAbbreviation.toUpperCase(), 'string', null, '"'+basicPosWord+'"')
  			  .then((freeIdentifier) => { self.basicPOSInstances[basicPosAbbreviation] = freeIdentifier })
  		]);

  	}, basicPromises);

    return Promise.all(basicPromises2);

  }

  // parse through the Wordnet indexes and use the JS Wordnet library API to look up each entry's details
  // add all relevent data to the Diary
  teach() {
	  var self = this;

  	var promises = new Promise((resolve) => {console.log('Establishing basic definitions...'); resolve()})
  	promises = promises.then(() => {return this.basic()});
    promises = promises.then(() => {console.log('Reading wordnet corpus...')});

    // read words straight from the indexes
    // (use them to perform lookup)
		var getWordsPromise = (suffix) => {
			var filepath = wndb.path + '/index.' + suffix;
      var words = [];

			var lineReaderPromise = Promise.promisify(lineReader.eachLine);
			return lineReaderPromise(filepath, function(line) {
				if (line.substr(0,1) == ' ') return;
				var word = line.substr(0, line.indexOf(' '));
				var obj = {word: word, synsetType: suffix}
				words.push(obj);
				// if (words.length % 200 == 0) deferred.notify(words.length);
			}).then(() => {
				console.log("Completed reading suffix " + suffix + ", count: " + words.length);
				return words;
			});

     };

    // for each index file
		promises = promises.then(() => {
		  return Promise.all(suffixes.map(getWordsPromise))
		  .then((wordsArrays) => {
			  var words = [].concat.apply([], wordsArrays);
			  console.log("Completed reading all indexes, total count: " + words.length);
			  return words;
		  })
		 });

		// begin teaching
		promises = promises
		  .then((words) => {console.log('Starting Wordnet simple teaching program...');return Promise.resolve(words)})
    	.then((words) => {

        // teach routine for a word
				var teachPromise = (obj) => {
					var word = obj.word.word.replace(/_/g,' ');
					var posClass = suffixToClass(obj.word.synsetType);
					var results = obj.results;
					// store words
			    return Promise.all(results.map((result) => {
		        // console.log('------------------------------------');
		        // console.log(result.synsetOffset);
		        // console.log(result.pos);
		        // console.log(word + "<>" + result.lemma);
		        // console.log(result.synonyms);
		        // console.log(result.pos);
		        // console.log(result.gloss);
						process.stdout.write(word+'..');
		        // sub: (synset $word) -> $synset
		    		return self.apiClient.createStoredValue(
						"WordnetWord" + numToLetters(result.synsetOffset) + word.replace(/[^a-zA-Z]/g, ''), 
						'object',
						'Grammar', 
						posClass, 
						'"'+word+'"')
			    	  .then((freeIdentifierWord) => {
			    		return self.apiClient.createApplication(self.basicFunctionInstances['synonym set'].id, freeIdentifierWord.id)
			    		   .then((applicationSynsetWord) => {
			    	    return self.apiClient.createStoredValue("WordnetSynset" + numToLetters(result.synsetOffset), 'number', null, null, parseInt(result.synsetOffset))
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
		    return Promise.map(words, async (obj) => {
		    	  var lookupPromise = new Promise((resolve, reject) => {
		    	  	self.wordnet.lookup(obj.word, (err, results) => {
			    	  	if (err) reject(err);
			    	  	else resolve(results);
		    	  	});
		    	  });

				  // make sure this has a frequency entry in wordfreq db
				  // TODO: append frequency to the wordnet object
				  var frequency = await self.apiClient.readWordFrequency(obj.word);
				  if (frequency == null) {
					process.stdout.write(obj.word+'..');
					return null;
				  }

		    	  return lookupPromise
					.then((results) => {return Promise.resolve({word: obj, results: results})})
					.then(teachPromise)
		    }, {concurrency: 5});
    	});

    return promises;
  }
  
}


exports.WordnetSensei = WordnetSensei;


function numToLetters(number) {
	var num = new String(number);
	var out = '';
	for (var i = 0; i < num.length; i++) {
		var char =  String.fromCharCode(65 + parseInt(num.charAt(i)));
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

function suffixToClass(pos) {
	if (pos == 'noun') return 'Noun';
	if (pos == 'verb') return 'Verb';
	if (pos == 'adj') return 'Adjective';
	if (pos == 'adv') return 'Adverb';
}

// not currently used. see grammar.js in 'logos' project
function posToClass(pos) {
	if (pos == 'noun') return 'Noun';
	if (pos == 'verb') return 'Verb';
	if (pos == 'adjective') return 'Adjective';
	if (pos == 'adverb') return 'Adverb';
	if (pos == 'adjective satellite') return 'AdjectiveSatellite';
}