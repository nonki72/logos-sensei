'use strict';
const Q = require('q');
Q.map = require('q-map').map;
const async = require('async');


class AssociationSensei {

  constructor(apiClient) {
  	this.apiClient = apiClient;
  }

  basic() {
  	var self = this;

  	// lambda elements test values
  	return self.apiClient.createFreeIdentifier("test").then((freeIdentifier) => {
	  	return self.apiClient.createAbstraction("test", freeIdentifier.id).then((abstraction) => {
		  	return self.apiClient.createApplication(abstraction.id, freeIdentifier.id).then((application) => {
			  	return self.apiClient.createSubstitution("eta", application.id, freeIdentifier.id).then((substitution) => {
		  			self.testValues["freeIdentifier"] = freeIdentifier;
		  			self.testValues["abstraction"] = abstraction;
		  			self.testValues["application"] = application;
		  			self.testValues["substitution"] = substitution;
		  			return self.testValues;
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


	// get first part of an application
  	promises = promises.then(() => {
	  	var data = {
				name: 'AssociationExtractApplicationLeft',
				astid: null, 
				fn: `
var defer = Q.defer();
var fragment;
if (CTX.args.application.lhs != null) fragment = AST.cast(CTX.args.application.lhs);
else fragmentAst = AST.cast(CTX.args.application.lhsid);
if (fragmentAst == null) defer.reject();
else defer.resolve(fragmentAst);
defer.promise`, 
				fntype: 'object',  
				fnmod: 'AST',
				fnclass: 'Fragment', 
				argnum: 1, 
				argtypes: [["application","object","AST","Application"]], 
				modules: null, 
				memoize: true,  
				promise: true,
				testargs: [self.testValues.application.id]
	  	};

	  	return self.apiClient.createStoredFunction(data);
	  });

	// get second part of an application
  	promises = promises.then(() => {
	  	var data = {
				name: 'AssociationExtractApplicationRight',
				astid: null, 
				fn: `
var defer = Q.defer();
var fragment;
if (CTX.args.application.lhs != null) fragment = AST.cast(CTX.args.application.rhs);
else fragmentAst = AST.cast(CTX.args.application.rhsid);
if (fragmentAst == null) defer.reject();
else defer.resolve(fragmentAst);
defer.promise`, 
				fntype: 'object',  
				fnmod: 'AST',
				fnclass: 'Fragment', 
				argnum: 1, 
				argtypes: [["application","object","AST","Application"]], 
				modules: null, 
				memoize: true,   
				promise: true,
				testargs: [self.testValues.application.id]
	  	};

	  	return self.apiClient.createStoredFunction(data);
	  });

	// get body of an abstraction
  	promises = promises.then(() => {
	  	var data = {
				name: 'AssociationExtractAbstractionBody',
				astid: null, 
				fn: `
var defer = Q.defer();
var fragment;
if (CTX.args.application.body != null) fragment = AST.cast(CTX.args.application.body);
else fragmentAst = AST.cast(CTX.args.application.bodyid);
if (fragmentAst == null) defer.reject();
else defer.resolve(fragmentAst);
defer.promise`, 
				fntype: 'object',  
				fnmod: 'AST',
				fnclass: 'Fragment', 
				argnum: 1, 
				argtypes: [["application","object","AST","Abstraction"]], 
				modules: null, 
				memoize: true,   
				promise: true,
				testargs: [self.testValues.abstraction.id]
	  	};

	  	return self.apiClient.createStoredFunction(data);
	  });

	// get another of this type
  	promises = promises.then(() => {
	  	var data = {
				name: 'AssociationTypeOther',
				astid: null, 
				fn: `
var defer = Q.defer();
var fragmentAst = AST.cast(CTX.args.fragment);
if (fragmentAst == null) defer.reject();
readByRandomValueAndType(fragmentAst, (random) => {
  var randomAst = AST.cast(random);
  defer.resolve(randomAst);
});
else defer.resolve(fragmentAst);
defer.promise`, 
				fntype: 'object',  
				fnmod: 'AST',
				fnclass: 'Fragment', 
				argnum: 1, 
				argtypes: [["fragment","object","AST","Fragment"]], 
				modules: null, 
				memoize: true,   
				promise: true,
				testargs: [self.testValues.abstraction.id]
	  	};

	  	return self.apiClient.createStoredFunction(data);
	  });

  }
}


exports.AssociationSensei = AssociationSensei;
