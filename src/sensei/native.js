'use strict';
const Q = require('q');
Q.map = require('q-map').map;
const async = require('async');
const AST = require('../../../logos/src/ast');

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
  	return promises;
  }
  basic() {
  	var self = this;

  	// lambda elements test values
  	return self.apiClient.createFreeIdentifier("test").then((freeIdentifier) => {
	  	return self.apiClient.createAbstraction("test", freeIdentifier.id).then((abstraction) => {
		  	return self.apiClient.createApplication(abstraction.id, freeIdentifier.id).then((application) => {
			  	return self.apiClient.createSubstitution("eta", application.id, freeIdentifier.id).then((substitution) => {
		  			self.testValues["freeIdentifier"] = AST.cast(freeIdentifier);
		  			self.testValues["abstraction"] = AST.cast(abstraction);
		  			self.testValues["application"] = AST.cast(application);
		  			self.testValues["substitution"] = AST.cast(substitution);
		  			console.log(JSON.stringify(application,null,4))
		  			return self.testValues;
			  	})
		  	})
	  	})
  	});
  }

  teach() {
  	var self = this;

  	var promises = Q.fcall(() => {console.log('Establishing modules...')});
  	promises = promises.then(this.apiClient.createModule('AST', './ast'));
  	promises = promises.then(this.apiClient.createClass('Fragment', 'AST'));
  	promises = promises.then(() => {console.log('Establishing test definitions...')});
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
DataLib.readOrCreateAbstraction(CTX.args.name, CTX.args.definition2.astid, (abs) => {
  if (abs == null) defer.reject();
  else defer.resolve(AST.cast(abs));
});
defer.promise`, 
				fntype: 'promise', 
				fnclass: 'Abstraction', 
				argnum: 2, 
				argtypes: [["name","string"], ["definition2","AST","Fragment"]], 
				modules: ['AST'], 
				memoize: true, 
				testargs: ["test", self.testValues.freeIdentifier]
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
DataLib.readOrCreateApplication(CTX.args.definition1.astid, CTX.args.definition2.astid, (app) => {
	if (app == null) defer.reject();
	else defer.resolve(AST.cast(app));
});
defer.promise`, 
			fntype: 'promise', 
			fnclass: 'Application', 
			argnum: 2, 
			argtypes: [["definition1","AST","Fragment"], ["definition2","AST","Fragment"]], 
			modules: ['AST'], 
			memoize: true, 
			testargs: [self.testValues.abstraction, self.testValues.freeIdentifier]
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
DataLib.readOrCreateFreeIdentifier(CTX.args.name, (identifier) => {
	 if (identifier == null) defer.reject();
	 else defer.resolve(AST.cast(identifier));
});
defer.promise`, 
				fntype: 'promise', 
				fnclass: 'Identifier', 
				argnum: 1, 
				argtypes: [["name","string"]], 
				modules: ['AST'], 
				memoize: true, 
				testargs: ["test"]
	  	};

			return self.apiClient.createStoredFunction(data);
		});

    // create association
//     promises = promises.then(() => {
// 	  	var data = {
// 				name: 'NativeFuncReadOrCreateAssociation',
// 				astid: null, 
// 				fn: `
// var defer = Q.defer();
// DataLib.readOrCreateAssociation(CTX.args.sourceid, CTX.args.destinationid, CTX.args.associativevalue, (ass) => {
// 	 if (ass == null) defer.reject();
// 	 else defer.resolve(AST.cast(Association(ass));
// });
// defer.promise`, 
// 				fntype: 'promise', 
// 				fnclass: 'Association', 
// 				argnum: 3, 
// 				argtypes: '[["sourceid","number"], ["destinationid","number"], ["associativevalue","number"]]', 
// 				modules: null, 
// 				memoize: false, 
// 				testargs: [self.testValues.freeIdentifier), self.testValues.abstraction), 0.1]
// 	  	};

//     	return self.apiClient.createStoredFunction(data);
//     });

    // create substitution
    promises = promises.then(() => {
	  	var data = {
				name: 'NativeFuncReadOrCreateSubstitution',
				astid: null, 
				fn: `
var defer = Q.defer();
DataLib.readOrCreateSubstitution(CTX.args.type, CTX.args.definition1.astid, CTX.args.definition2.astid, (sub) => {
	 if (sub == null) defer.reject();
	 else defer.resolve(sub);
});
defer.promise`, 
				fntype: 'promise', 
				fnclass: 'object', 
				argnum: 3, 
				argtypes: [["type","string"], ["definition1","AST","Fragment"], ["definition2","AST","Fragment"]], 
				modules: ['AST'], 
				memoize: true, 
				testargs: ['eta', self.testValues.application, self.testValues.freeIdentifier]
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
DataLib.readById(CTX.args.fragment.astid, (ent) => {
	 if (ent == null) defer.reject();
	 else defer.resolve(AST.cast(ent));
});
defer.promise`, 
				fntype: 'promise', 
				fnclass: 'Entry', 
				argnum: 1, 
				argtypes: [["fragment","AST","Fragment"]], 
				modules: ['AST'], 
				memoize: true, 
				testargs: [self.testValues.freeIdentifier]
	  	};

    	return self.apiClient.createStoredFunction(data);
    });

/*
    // read by random value
    promises = promises.then(() => {
	  	var data = {
				name: 'NativeFuncReadByRandomValue',
				astid: null, 
				fn: `
var defer = Q.defer();
DataLib.readByRandomValue((ent) => {
	 if (ent == null) defer.reject();
	 else defer.resolve(AST.cast(ent));
});
defer.promise`, 
				fntype: 'promise', 
				fnclass: 'Fragment', 
				argnum: 0, 
				argtypes: null, 
				modules: ['AST'], 
				memoize: false, 
				testargs: null
	  	};

    	return self.apiClient.createStoredFunction(data);
    });
*/

    return promises;

  }
}

exports.NativeSensei = NativeSensei;


