'use strict';

const Q = require('q');
const Services = require('service-js');
const ApiClient = require('./src/apiclient');
const IoSensei = require('./src/sensei/io');
const NativeSensei = require('./src/sensei/native');
const AssociationSensei = require('./src/sensei/association');
const TwitterSensei = require('./src/sensei/twitter');
const GrammarSensei = require('./src/sensei/grammar');
const WordFreqSensei = require('./src/sensei/wordfreq');
const WordnetSensei = require('./src/sensei/wordnet');

// Mapping of names to Senseis
const senseisConstructorMap = {}
senseisConstructorMap['IoSensei'] = IoSensei.IoSensei;
senseisConstructorMap['NativeSensei'] = NativeSensei.NativeSensei;
senseisConstructorMap['AssociationSensei'] = AssociationSensei.AssociationSensei;
senseisConstructorMap['TwitterSensei'] = TwitterSensei.TwitterSensei;
senseisConstructorMap['GrammarSensei'] = GrammarSensei.GrammarSensei;
senseisConstructorMap['WordFreqSensei'] = WordFreqSensei.WordFreqSensei;
senseisConstructorMap['WordnetSensei'] = WordnetSensei.WordnetSensei;

// API Client Service needed by all Senseis
var ApiClientService = Object.create(Services.Service);
ApiClientService.service = new ApiClient.ApiClient("http://127.0.0.1:9001");
ApiClientService.isUsable = function() {
  return Q.nbind(this.service.healthCheck, this.service);
};
Services.register('ApiClient', ApiClientService);


// order in which to run Senseis
var senseis = [];
if (process.argv.length > 2) {
    // Command Line Argument to run only one Sensei
	const senseiNames = Object.keys(senseisConstructorMap);
    const indexOfArgSensei = senseiNames.indexOf(process.argv[2]);
	if (indexOfArgSensei == -1) {
		console.error("Sensei name " + process.argv[2] + " not found! Use name type 'ExampleSensei'.");
		process.exit(1);
	}
	const senseiName = senseiNames[indexOfArgSensei];
	senseis.push(senseiName);
} else {
	// default to run all Senseis
	senseis.push(
		'IoSensei', 
		'NativeSensei', 
		'AssociationSensei', 
		'TwitterSensei', 
		'GrammarSensei', 
		'WordFreqSensei', 
		'WordnetSensei'
	);
}

// store the sensei services so they are accessible programatically
for (const senseiNameIndex in senseis) {
	const senseiName = senseis[senseiNameIndex];
	var service = Object.create(Services.Service);
	var senseisConstructor = senseisConstructorMap[senseiName];
	service.onStart = function() {
		return Services.ready('ApiClient').spread((apiClient) => {
		service.service = new senseisConstructor(apiClient.service);
		});
	}
	service.isUsable = function() {
		return Services.ready('ApiClient');
	};
	Services.register(senseiName, service);
}

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
	senseis.forEach((senseiName) => {
		startService.call(null, senseiName, promise);
	});
}

startUp();
