'use strict';
const Q = require('q');
Q.map = require('q-map').map;
const async = require('async');

/* Native identifier names
 *
 * NativeFunc*
 */

class NativeSensei {

  constructor(apiClient) {
  	this.apiClient = apiClient;

  	this.testValues = {};
  }

  basic() {
  	var self = this;

  	// lambda elements test values
  	return self.apiClient.createFreeIdentifier("test").then((freeIdentifier) => {
	  	return self.apiClient.createAbstraction("test", freeIdentifier.id).then((abstraction) => {
		  	return self.apiClient.createApplication(abstraction.id, freeIdentifier.id).then((application) => {
			  	return self.apiClient.createSubstitution("eta", application.id, freeIdentifier.id).then((substiution) => {
			  		return self.apiClient.createAssociation(freeIdentifier.id, abstraction.id, 0.1).then((association) => {
			  			self.testValues["freeIdentifier"] = freeIdentifier;
			  			self.testValues["abstraction"] = abstraction;
			  			self.testValues["application"] = application;
			  			self.testValues["substiution"] = substiution;
			  			self.testValues["association"] = association;
			  			return self.testValues;
			  		})
			  	})
		  	})
	  	})
  	});
  }

  teach() {
  	var self = this;

  	var promises = Q.fcall(() => {console.log('Establishing test definitions...')});
  	promises = promises.then(() => {return self.basic()});
  	promises = promises.then(() => {console.log('Creating Auto-interface functions...')});
  	promises = promises.then(() => {console.log(self.testValues)});


	  // create abstraction
  	promises = promises.then(() => {
	  	var data = {
				name: 'NativeFuncReadOrCreateAbstraction',
				astid: null, 
				fn: `
var defer = Q.defer();
DataLib.readOrCreateAbstraction(CTX.args.name, CTX.args.definition2, (abs) => {
  if (abs == null) defer.reject();
  else defer.resolve(abs);
});
defer.promise`, 
				fntype: 'promise', 
				fnclass: 'abstraction', 
				argnum: 2, 
				argtypes: `[["name","string"], ["definition2","number"]]`, 
				modules: null, 
				memoize: true, 
				testargs: ["test", parseInt(self.testValues.freeIdentifier.id)]
	  	};

	  	return self.apiClient.createStoredFunction(data);
	  });

    // create application
    promises = promises.then(() => {
  	var data = {
			name: 'NativeFuncReadOrCreateApplication',
			astid: null, 
			fn: `
var defer = Q.defer();
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

		return self.apiClient.createStoredFunction(data);
	});

    // create free identifier
    promises = promises.then(() => {
	  	var data = {
				name: 'NativeFuncReadOrCreateFreeIdentifier',
				astid: null, 
				fn: `
var defer = Q.defer();
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

			return self.apiClient.createStoredFunction(data);
		});

    // create association
    promises = promises.then(() => {
	  	var data = {
				name: 'NativeFuncReadOrCreateAssociation',
				astid: null, 
				fn: `
var defer = Q.defer();
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

    	return self.apiClient.createStoredFunction(data);
    });

    // create substitution
    promises = promises.then(() => {
	  	var data = {
				name: 'NativeFuncReadOrCreateSubstitution',
				astid: null, 
				fn: `
var defer = Q.defer();
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

    	return self.apiClient.createStoredFunction(data);
    });

    // read by id
    promises = promises.then(() => {
	  	var data = {
				name: 'NativeFuncReadById',
				astid: null, 
				fn: `
var defer = Q.defer();
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

    	return self.apiClient.createStoredFunction(data);
    });


    // read by associative value
    promises = promises.then(() => {
	  	var data = {
				name: 'NativeFuncReadApplicatorByAssociativeValue',
				astid: null, 
				fn: `
var defer = Q.defer();
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

    	return self.apiClient.createStoredFunction(data);
    });


    // read by random value
    promises = promises.then(() => {
	  	var data = {
				name: 'NativeFuncReadByRandomValue',
				astid: null, 
				fn: `
var defer = Q.defer();
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

    	return self.apiClient.createStoredFunction(data);
    });


    promises.done();

  }
}

exports.NativeSensei = NativeSensei;


