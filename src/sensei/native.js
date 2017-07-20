'use strict';
const Q = require('q');
Q.map = require('q-map').map;
const async = require('async');

const suffixes = [];

class NativeSensei {

  constructor(apiClient) {
  	this.apiClient = apiClient;
	  this.wordnet = new WordNet();
  }

  basic() {
  	var self = this;

  	self.testValues = {};

  	// lambda elements test values
  	return self.apiClient.createFreeIdentifier("test").then((freeIdentifier) => {
	  	self.apiClient.createAbstraction("test", freeIdentifier.id).then((abstraction) => {
		  	self.apiClient.createApplication(abstraction.id, freeIdentifier.id).then((application) => {
			  	self.apiClient.createSubstitution("eta", application.id, freeIdentifier.id).then((substiution) => {
			  		self.apiClient.createAssociation(freeIdentifier.id, abstraction.id, 0.1).then((association) => {
			  			self.testValues["freeIdentifier"] = freeIdentifier;
			  			self.testValues["abstraction"] = abstraction;
			  			self.testValues["application"] = application;
			  			self.testValues["substiution"] = substiution;
			  			self.testValues["association"] = association;
			  		})
			  	})
		  	})
	  	})
  	});
  }

  teach() {
  	var self = this;

  	var promises = Q.fcall(() => {console.log('Establishing basic definitions...')});
  	promises = promises.then(() => {return self.basic()});
  	promises = promises.then(() => {console.log('Creating Auto-interface functions...')});

    // create abstraction
  	var data = {
			name: 'readOrCreateAbstraction',
			astid: null, 
			fn: `var defer = Q.defer();
			     DataLib.readOrCreateAbstraction(CTX.args.name, CTX.args.definition2, (abs) => {
			     	 if (abs == null) defer.reject();
			     	 else defer.resolve(abs);
			     });
			     defer.promise`, 
			fntype: 'promise', 
			fnclass: 'abstraction', 
			argnum: 2, 
			argtypes: '[["name","string"], ["definition2","number"]]', 
			modules: null, 
			memoize: true, 
			testargs: ["test", self.testValues.freeIdentifier.id]
  	};

    promises = promises.then(self.apiClient.createStoredFunction(data));

    // create application
  	data = {
			name: 'readOrCreateApplication',
			astid: null, 
			fn: `var defer = Q.defer();
			     DataLib.readOrCreateApplication(CTX.args.definition1, CTX.args.definition2, (app) => {
			     	 if (app == null) defer.reject();
			     	 else defer.resolve(app);
			     });
			     defer.promise`, 
			fntype: 'promise', 
			fnclass: 'application', 
			argnum: 2, 
			argtypes: '[["definition1","number"], ["definition2","number"]]', 
			modules: null, 
			memoize: true, 
			testargs: [self.testValues.abstraction.id, self.testValues.freeIdentifier.id]
  	};

    promises = promises.then(self.apiClient.createStoredFunction(data));

    // create free identifier
  	data = {
			name: 'readOrCreateFreeIdentifier',
			astid: null, 
			fn: `var defer = Q.defer();
			     DataLib.readOrCreateFreeIdentifier(CTX.args.name, (id) => {
			     	 if (id == null) defer.reject();
			     	 else defer.resolve(id);
			     });
			     defer.promise`, 
			fntype: 'promise', 
			fnclass: 'identifier', 
			argnum: 1, 
			argtypes: '[["name","string"]]', 
			modules: null, 
			memoize: true, 
			testargs: ["test"]
  	};

    promises = promises.then(self.apiClient.createStoredFunction(data));

    // create association
  	data = {
			name: 'readOrCreateAssociation',
			astid: null, 
			fn: `var defer = Q.defer();
			     DataLib.readOrCreateAssociation(CTX.args.sourceid, CTX.args.destinationid, CTX.args.associativevalue, (ass) => {
			     	 if (ass == null) defer.reject();
			     	 else defer.resolve(ass);
			     });
			     defer.promise`, 
			fntype: 'promise', 
			fnclass: 'association', 
			argnum: 3, 
			argtypes: '[["sourceid","number"], ["destinationid","number"], ["associativevalue","number"]]', 
			modules: null, 
			memoize: false, 
			testargs: [self.testValues.freeIdentifier.id, self.testValues.abstraction.id, 0.1]
  	};

    promises = promises.then(self.apiClient.createStoredFunction(data));

    // create substitution
  	data = {
			name: 'readOrCreateSubstitution',
			astid: null, 
			fn: `var defer = Q.defer();
			     DataLib.readOrCreateSubstitution(CTX.args.type, CTX.args.definition1, CTX.args.definition2, (sub) => {
			     	 if (sub == null) defer.reject();
			     	 else defer.resolve(sub);
			     });
			     defer.promise`, 
			fntype: 'promise', 
			fnclass: 'substitution', 
			argnum: 3, 
			argtypes: '[["type","string"], ["definition1","number"], ["definition2","number"]]', 
			modules: null, 
			memoize: true, 
			testargs: [self.testValues.freeIdentifier.id, self.testValues.abstraction.id, 0.1]
  	};

    promises = promises.then(self.apiClient.createStoredFunction(data));

    // read by id
  	data = {
			name: 'readById',
			astid: null, 
			fn: `var defer = Q.defer();
			     DataLib.readById(CTX.args.id, (ent) => {
			     	 if (ent == null) defer.reject();
			     	 else defer.resolve(ent);
			     });
			     defer.promise`, 
			fntype: 'promise', 
			fnclass: 'entry', 
			argnum: 1, 
			argtypes: '[["id","number"]]', 
			modules: null, 
			memoize: true, 
			testargs: [self.testValues.freeIdentifier.id]
  	};

    promises = promises.then(self.apiClient.createStoredFunction(data));


    // read by associative value
  	data = {
			name: 'readApplicatorByAssociativeValue',
			astid: null, 
			fn: `var defer = Q.defer();
			     DataLib.readApplicatorByAssociativeValue(CTX.args.sourceid, (ent) => {
			     	 if (ent == null) defer.reject();
			     	 else defer.resolve(ent);
			     });
			     defer.promise`, 
			fntype: 'promise', 
			fnclass: 'entry', 
			argnum: 1, 
			argtypes: '[["sourceid","number"]]', 
			modules: null, 
			memoize: false, 
			testargs: [self.testValues.freeIdentifier.id]
  	};

    promises = promises.then(self.apiClient.createStoredFunction(data));


    // read by random value
  	data = {
			name: 'readByRandomValue',
			astid: null, 
			fn: `var defer = Q.defer();
			     DataLib.readByRandomValue((ent) => {
			     	 if (ent == null) defer.reject();
			     	 else defer.resolve(ent);
			     });
			     defer.promise`, 
			fntype: 'promise', 
			fnclass: 'entry', 
			argnum: 0, 
			argtypes: null, 
			modules: null, 
			memoize: false, 
			testargs: null
  	};

    promises = promises.then(self.apiClient.createStoredFunction(data));



    return promises;

  }


exports.NativeSensei = NativeSensei;


