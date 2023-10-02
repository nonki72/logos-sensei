'use strict';
var Promise = require("bluebird");
var edgeglove = require('../../../logos-ai/src/edgeglove.js');

function strikeThrough(text) {
	return text
	  .split('')
	  .map(char => char + '\u0336')
	  .join('')
  }
  

class EdgeGloveCorpSensei {

  constructor(apiClient) {
  	this.apiClient = apiClient;
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
				name: 'EdgeGloveFuncRelated',
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
  	  .then((freeIdentifier) => { self.edgeGloveFuncRelated = freeIdentifier })
  	];

    return Promise.all(basicPromises);

  }

  // parse through the Wordnet indexes and use the JS Wordnet library API to look up each entry's details
  // add all relevent data to the Diary
  teach(args) {
	  var self = this;

	  var skip = 0; // how many words to skip
	  if (args) skip = args[0];
	  var count = 0;

  	var promises = new Promise((resolve) => {console.log('Establishing basic definitions...'); resolve()})
  	promises = promises.then(() => {return this.basic()});
    promises = promises.then(() => {console.log('Reading Diary words...')});

	promises = promises.then(async () => {
		//function to use to process each free identifier (wordnet word)
		const processWord  = function(freeIdentifier) {
			const word = freeIdentifier.fn.replace(/\"/g, '');
			// run edgeGloveFuncRelated to get the related words
			const nearestNeighbors = edgeglove.edgegloveFreqWord(word, 100, 100);
			console.log("Edge Glove nearest neighbors for " + word + ": " + nearestNeighbors);
			// for each related word, add an application and substitution to the Diary
			nearestNeighbors.forEach(async (word2) => {
				const freeIdentifierWord2 = await self.apiClient.readFreeIdentifierByFn("\"" + word2 + "\"");
				if (freeIdentifierWord2 != null) {
					// make an application (edgeGloveFuncRelated, freeIdentifierWord2)
					await self.apiClient.createApplication(self.edgeGloveFuncRelated.id, freeIdentifierWord.id)
						.then(async (applicationRelatedWord) => {
							// make a substitution (applicationRelatedWord) -> freeIdentifierWord2
							await self.apiClient.createSubstitution('eta', applicationRelatedWord.id, freeIdentifierWord2.id);
							console.log("Added " + word + " -> " + word2);
						});
				} else {
					console.log("Skipping " + word + " -> " + strikeThrough(word2));
				}
			});
		}

		var {freeIdentifiers, nextCursor} = await self.apiClient.readFreeIdentifiersRegex("WordnetWord.*", null, 100);
		while (freeIdentifiers.length > 0) {
			freeIdentifiers.forEach(processWord);
			const res = await self.apiClient.readFreeIdentifiersRegex("WordnetWord.*", nextCursor, 100);
			freeIdentifiers = res.freeIdentifiers;
			nextCursor = res.nextCursor;
		}
	});

    return promises;
  }
  
}


exports.EdgeGloveCorpSensei = EdgeGloveCorpSensei;
