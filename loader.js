'use strict';

const Q = require('q');
const Services = require('service-js');
const ApiClient = require('./src/apiclient');
const WordnetSensei = require('./src/sensei/wordnet');
const NativeSensei = require('./src/sensei/native');

// order in which to run sensei's
var services = ['WordnetSensei', 'NativeSensei'];

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
	  NativeSenseiService.service = new NativeSensei.NativeSensei(apiClient.service);
	});
}
NativeSenseiService.isUsable = function() {
  return Services.ready('ApiClient');
};
Services.register('NativeSensei', NativeSenseiService);


// Initialization
Services.start();

function startUp() {
	var promise = {
		chain: Q()
	};

  // add a service's teach promise chain to the main one
  // if error occurs, delay and try again
	var startService = function (serviceName, promise) {
		promise.chain = promise.chain.then(() => {
			console.log("========= Starting Sensei Service '" + serviceName + "'... =========")
		}).then(() => {
			return Services.ready(serviceName)
			      .spread((senseiService) => {
		          return senseiService.service.teach()
						}, () => {
							console.log('.');
							setTimeout(startService, 500, serviceName, promise);
							return true
						}).then((error) => {
							if (!error) console.log("========= Sensei Service '" + serviceName + "' finished. =========")
						})
		});
		promise.chain.done();
	};

  // iterate through services array and attempt to create teaching promise chain
  // and add it to the main promise chain
	services.forEach((serviceName) => {
		startService.call(null, serviceName, promise);
	});
	// Services.ready('WordnetSensei').spread(function(wordnetSensei) {
	//   wordnetSensei.service.teach();
	// }, () => {
	// 	console.log('.');
	// 	setTimeout(startUp, 500);
	// });
	// Services.ready('NativeSensei').spread(function(nativeSensei) {
	//   nativeSensei.service.teach();
	// }, () => {
	// 	console.log('.');
	// 	setTimeout(startUp, 500);
	// });
}

startUp();