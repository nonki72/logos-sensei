'use strict';

const Q = require('q');
const Services = require('service-js');
const ApiClient = require('./src/apiclient');
const IoSensei = require('./src/sensei/io');
const NativeSensei = require('./src/sensei/native');
const AssociationSensei = require('./src/sensei/association');
const TwitterSensei = require('./src/sensei/twitter');
const WordnetSensei = require('./src/sensei/wordnet');

// order in which to run sensei's
var services = ['IoSensei', 'NativeSensei', 'AssociationSensei', 'TwitterSensei', 'WordnetSensei'];

// API Client Service
var ApiClientService = Object.create(Services.Service);
ApiClientService.service = new ApiClient.ApiClient("http://localhost:9001");
ApiClientService.isUsable = function() {
  return Q.nbind(this.service.healthCheck, this.service);
};
Services.register('ApiClient', ApiClientService);


// ##### Sensei's #######

// I/O Sensei
var IoSenseiService = Object.create(Services.Service);
IoSenseiService.onStart = function() {
	return Services.ready('ApiClient').spread((apiClient) => {
	  IoSenseiService.service = new IoSensei.IoSensei(apiClient.service);
	});
}
IoSenseiService.isUsable = function() {
  return Services.ready('ApiClient');
};
Services.register('IoSensei', IoSenseiService);


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

// Association Sensei
var AssociationSenseiService = Object.create(Services.Service);
AssociationSenseiService.onStart = function() {
	return Services.ready('ApiClient').spread((apiClient) => {
	  AssociationSenseiService.service = new AssociationSensei.AssociationSensei(apiClient.service);
	});
}
AssociationSenseiService.isUsable = function() {
  return Services.ready('ApiClient');
};
Services.register('AssociationSensei', AssociationSenseiService);

// Twitter Sensei
var TwitterSenseiService = Object.create(Services.Service);
TwitterSenseiService.onStart = function() {
	return Services.ready('ApiClient').spread((apiClient) => {
		TwitterSenseiService.service = new TwitterSensei.TwitterSensei(apiClient.service);
	});
}
TwitterSenseiService.isUsable = function() {
	return Services.ready('ApiClient');
};
Services.register('TwitterSensei', TwitterSenseiService);

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
						}).then(() => {
							console.log("========= Sensei Service '" + serviceName + "' finished. =========")
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
