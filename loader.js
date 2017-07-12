'use strict';

const Q = require('q');
const Services = require('service-js');
const ApiClient = require('src/apiclient');
const WordnetSensei = require('src/sensei/wordnet');


// API Client Service
var ApiClientService = Object.create(Services.Service);
ApiClientService.onStart = function() {
	this.service = new ApiClient.ApiClient("localhost");
}
ApiClientService.isUsable = function() {
  return Q.nfcall(this.service.healthCheck);
};
Services.register('ApiClient', ApiClientService);


// ##### Sensei's #######

// Wordnet Sensei
var WordnetSenseiService = Object.create(Services.Service);
WordnetSenseiService.onStart = function() {
	return Services.ready('ApiClient').spread((apiClient) => {
	  this.service = new WordnetSensei.WordnetSensei(apiClient);
	});
}
Services.register('WordnetSensei', WordnetSensei);


// Initialization
Services.start();

Services.ready('WordnetSensei').spread(function(wordnetSensei) {
  wordnetSensei.lookupAllWords();
});