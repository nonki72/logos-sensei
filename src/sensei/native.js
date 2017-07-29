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
	  	return self.apiClient.createAbstraction("test", parseInt(freeIdentifier.id)).then((abstraction) => {
		  	return self.apiClient.createApplication(parseInt(abstraction.id), parseInt(freeIdentifier.id)).then((application) => {
			  	return self.apiClient.createSubstitution("eta", parseInt(application.id), parseInt(freeIdentifier.id)).then((substiution) => {
			  		return self.apiClient.createAssociation(parseInt(freeIdentifier.id), parseInt(abstraction.id), 0.1).then((association) => {
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
  else defer.resolve(new Diary.Abstraction(abs));
});
defer.promise`, 
				fntype: 'promise', 
				fnclass: 'Abstraction', 
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
	else defer.resolve(new Diary.Application(app));
});
defer.promise`, 
			fntype: 'promise', 
			fnclass: 'Application', 
			argnum: 2, 
			argtypes: '[["definition1","number"], ["definition2","number"]]', 
			modules: null, 
			memoize: true, 
			testargs: [parseInt(self.testValues.abstraction.id), parseInt(self.testValues.freeIdentifier.id)]
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
	 else defer.resolve(new Diary.FreeIdentifier(id));
});
defer.promise`, 
				fntype: 'promise', 
				fnclass: 'Identifier', 
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
	 else defer.resolve(new Diary.Association(ass));
});
defer.promise`, 
				fntype: 'promise', 
				fnclass: 'Association', 
				argnum: 3, 
				argtypes: '[["sourceid","number"], ["destinationid","number"], ["associativevalue","number"]]', 
				modules: null, 
				memoize: false, 
				testargs: [parseInt(self.testValues.freeIdentifier.id), parseInt(self.testValues.abstraction.id), 0.1]
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
	 else defer.resolve(new Diary.Substitution(sub));
});
defer.promise`, 
				fntype: 'promise', 
				fnclass: 'Substitution', 
				argnum: 3, 
				argtypes: '[["type","string"], ["definition1","number"], ["definition2","number"]]', 
				modules: null, 
				memoize: true, 
				testargs: ['eta', parseInt(self.testValues.application.id), parseInt(self.testValues.freeIdentifier.id)]
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
	 else defer.resolve(new Diary.Entry(ent));
});
defer.promise`, 
				fntype: 'promise', 
				fnclass: 'Entry', 
				argnum: 1, 
				argtypes: '[["id","number"]]', 
				modules: null, 
				memoize: true, 
				testargs: [parseInt(self.testValues.freeIdentifier.id)]
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
	 else defer.resolve(new Diary.Entry(ent));
});
defer.promise`, 
				fntype: 'promise', 
				fnclass: 'Entry', 
				argnum: 1, 
				argtypes: '[["sourceid","number"]]', 
				modules: null, 
				memoize: false, 
				testargs: [parseInt(self.testValues.freeIdentifier.id)]
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
	 else defer.resolve(new Diary.Entry(ent));
});
defer.promise`, 
				fntype: 'promise', 
				fnclass: 'Entry', 
				argnum: 0, 
				argtypes: null, 
				modules: null, 
				memoize: false, 
				testargs: null
	  	};

    	return self.apiClient.createStoredFunction(data);
    });


    return promises;

  }
}

exports.NativeSensei = NativeSensei;


