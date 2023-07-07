'use strict';
const Q = require('q');
Q.map = require('q-map').map;
const async = require('async');
const nlpcloud = require('nlpcloud');
const nlpcloudConfig = require('../../keys/nlpcloud.json');


class NlpCloudSensei {

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
	promises = promises.then(this.apiClient.createModule('nlpcloud', 'nlpcloud'));
	promises = promises.then(this.apiClient.createModule('JS', null));
	promises = promises.then(this.apiClient.createClass('Array', 'JS'));
  	promises = promises.then(() => {console.log('Creating NlP Cloud functions...')});

	const client = new nlpcloud('fast-gpt-j', nlpcloudConfig.apiKey, true);

	// create read frequency
  	promises = promises.then(() => {
		var data = {
			  name: 'KeyWordFinder',
			  astid: null, 
			  fn: `
var defer = Q.defer();
const client = new nlpcloud('fast-gpt-j','${nlpcloudConfig.apiKey}', true);
client.kwKpExtraction(CTX.args.phrase)
  .then(function (response) {
	defer.resolve(response.data.keywords_and_keyphrases);
  }).catch(function (err) {
	defer.reject(err.response.status + ", " + err.response.data.detail);
  });
defer.promise`, 
			  fntype: 'object', 
			  fnclas: 'Array',
			  fnmod: 'JS',
			  argnum: 1, 
			  argtypes: [["phrase","string"]], 
			  modules: ['nlpcloud'],
			  memoize: true,
			  promise: true,
			  testargs: ["this is a test of the hatsune miku key word finder"]
		};

		return self.apiClient.createStoredFunction(data);
	});


    return promises;

  }
}

exports.NlpCloudSensei = NlpCloudSensei;


