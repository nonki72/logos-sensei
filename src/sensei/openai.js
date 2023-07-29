'use strict';
const Q = require('q');
Q.map = require('q-map').map;

class OpenAiSensei {

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
	promises = promises.then(this.apiClient.createModule('openai', 'openai'));
	promises = promises.then(this.apiClient.createModule('JS', null));
	promises = promises.then(this.apiClient.createClass('Array', 'JS'));
  	promises = promises.then(() => {console.log('Creating Open AI functions...')});

	  // make the code that will go into the database as free identifiers
  	promises = promises.then(() => {
		var data = {
			  name: 'GrammarCorrector',
			  astid: null, 
			  fn: `
var defer = Q.defer();
console.log("GCARG:" + JSON.stringify(CTX.args.phrase));
const configuration = new openai.Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});
const openaiapi = new openai.OpenAIApi(configuration);
async function run() {
	return await openaiapi.createChatCompletion({
		model: "gpt-3.5-turbo",
		messages: [{
				"role": "system",
				"content": "You will be provided with statements, and your task is to convert them to standard English."
			},
			{
				"role": "user",
				"content": CTX.args.phrase
			}
		],
		temperature: 0,
		max_tokens: 256,
	});
}
async function fulfill() {
	try {
		const response = await run();
		const sentence = response.data.choices[0].message.content;
		console.log("GCRESPONSE: " + sentence);
		defer.resolve(sentence);
	} catch (err) {
		console.error("GCREJECT: " + err);
		defer.reject(err);
	}
}
fulfill();
defer.promise`, 
			  fntype: 'string', 
			  fnclas: null,
			  fnmod: null,
			  argnum: 1, 
			  argtypes: [["phrase","string"]], 
			  modules: ['openai'],
			  memoize: true,
			  promise: true,
			  testargs: ["this a testing of hatsune miku grammar checker"]
		};

		return self.apiClient.createStoredFunction(data);
	});

	promises = promises.then(() => {
		var data = {
			  name: 'KeywordFinder',
			  astid: null, 
			  fn: `
var defer = Q.defer();
console.log("KWARG:" + JSON.stringify(CTX.args.phrase));
const configuration = new openai.Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});
const openaiapi = new openai.OpenAIApi(configuration);
async function run() {
	return await openaiapi.createChatCompletion({
		model: "gpt-3.5-turbo",
		messages: [{
				"role": "system",
				"content": "You will be provided with a block of text, and your task is to extract a list of keywords from it."
			},
			{
				"role": "user",
				"content": CTX.args.phrase
			}
		],
		temperature: 0.5,
		max_tokens: 256,
		top_p: 1,
		frequency_penalty: 0,
		presence_penalty: 0,
	});
}
async function fulfill() {
	try {
		const response = await run();
		var keywordsString = response.data.choices[0].message.content;
		if (keywordsString.startsWith("The keyword from the given text is")) {
			keywordsString = keywordsString.match(/"([^"]+)"/)[1]; // one keyword
		} else if (keywordsString.startsWith("keywords")) {
			keywordsString = keywordsString.split(': ')[1]; // many keywords
		} else if (keywordsString == null) {
			console.error("KWARGREJECT: keywordsString is null");
			return defer.reject("keywordsString is null"); // no keywords
		}
		const keywords = keywordsString.split(', ');
		console.log("KWRESPONSE: "+JSON.stringify(keywords));
		defer.resolve(keywords);
	} catch (err) {
		console.error("KWREJECT: " + err);
		defer.reject(err);
	}
}
fulfill();
defer.promise`, 
			  fntype: 'object', 
			  fnclas: 'Array',
			  fnmod: 'JS',
			  argnum: 1, 
			  argtypes: [["phrase","string"]], 
			  modules: ['openai'],
			  memoize: true,
			  promise: true,
			  testargs: ["this is a test of the hatsune miku key word finder"]
		};

		return self.apiClient.createStoredFunction(data);
	});


    return promises;

  }
}

exports.OpenAiSensei = OpenAiSensei;


