'use strict';

const Q = require('q');
const Services = require('service-js');
const ApiClient = require('./src/apiclient');
const WordnetSensei = require('./src/sensei/wordnet');


// API Client Service
var ApiClientService = Object.create(Services.Service);
ApiClientService.service = new ApiClient.ApiClient("http://localhost");
ApiClientService.isUsable = function() {
  return Q.nbind(this.service.healthCheck, this.service);
};
Services.register('ApiClient', ApiClientService);


// ##### Sensei's #######

// Wordnet Sensei
var WordnetSenseiService = Object.create(Services.Service);
WordnetSenseiService.onStart = function() {
	return Services.ready('ApiClient').spread((apiClient) => {
	  WordnetSenseiService.service = new WordnetSensei.WordnetSensei(apiClient.service);
	});
}
WordnetSenseiService.isUsable = function() {
  return Services.ready('ApiClient');
};
Services.register('WordnetSensei', WordnetSenseiService);

// Native Sensei
var NativeSenseiService = Object.create(Services.Service);
NativeSenseiService.onStart = function() {
	return Services.ready('ApiClient').spread((apiClient) => {
	  NativeSenseiService.service = new NativenetSensei.NativeSensei(apiClient.service);
	});
}
NativeSenseiService.isUsable = function() {
  return Services.ready('ApiClient');
};
Services.register('WordnetSensei', WordnetSenseiService);


// Initialization
Services.start();

function startUp() {
	Services.ready('WordnetSensei').spread(function(wordnetSensei) {
	  wordnetSensei.service.teach();
	}, () => {
		console.log('.');
		setTimeout(startUp, 500);
	});
	// Services.ready('NativeSensei').spread(function(nativeSensei) {
	//   nativeSensei.service.teach();
	// }, () => {
	// 	console.log('.');
	// 	setTimeout(startUp, 500);
	// });
}

startUp();