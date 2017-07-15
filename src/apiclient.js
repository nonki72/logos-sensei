'use strict';

var XMLHttpRequest = require('xhr2');
var XMLHttpRequestUpload = XMLHttpRequest.XMLHttpRequestUpload;
var FormData = require('form-data');
var fetch = require('node-fetch');

class ApiClient {

	constructor(hostname) {
		this.hostname = hostname;
	}

	healthCheck(none, cb) {
		var oReq = new XMLHttpRequest();
		oReq.open("GET", this.hostname + "/health");
		oReq.addEventListener("load", (evt) => {
		  if (oReq.status != 200) return cb(oReq.responseText);
	    return cb(null);
		});
		oReq.send();
	}

  readFreeIdentifier(name, cb) {
		var oReq = new XMLHttpRequest();
		oReq.open("GET", this.hostname + "/api/function/" + name);
		oReq.addEventListener("load", (evt) => {
			if (oReq.status != 200) return cb(oReq.responseText);
			var response = JSON.parse(oReq.responseText);
			return cb(null, response.freeIdentifier);
		});
		oReq.send();
  }

	createStoredFunction(name, astid, fn, fntype, fnclass, argnum, argtypes, modules, memoize, testargs, cb) {
		var formData = new FormData();
		if (astid) formData.append("astid", astid);
		if (fn) formData.append("fn", fn);
		if (fntype) formData.append("fntype", fntype);
		if (fnclass) formData.append("fnclass", fnclass);
		if (argnum != null) formData.append("argnum", argnum);
		if (argtypes) formData.append("argtypes", JSON.stringify(argtypes));
		if (modules) formData.append("modules", JSON.stringify(modules));
		if (memoize != null) formData.append("memoize", memoize);
		if (testargs) formData.append("testargs", JSON.stringify(testargs));

		fetch(this.hostname + "/api/function/" + name, { method: 'POST', body: formData })
		    .then(function(res) {
						if (res.status != 200) throw new Error(res.statusText);
		        return res.json();
		    }).then(function(json) {
		    	console.log("success:"+JSON.stringify(json));
						return cb(null, json.storedfunction);
		    }, function(reason) {
		    	return cb(reason);
		    });
	}

	createAssociation(sourceid, destinationid, associativevalue, cb) {
		var formData = new FormData();
		formData.append("sourceid", sourceid);
		formData.append("destinationid", destinationid);
		formData.append("associativevalue", associativevalue);
		
		var oReq = new XMLHttpRequest();
		oReq.addEventListener("load", (evt) => {
			if (oReq.status != 200) return cb(oReq.responseText);
			var response = JSON.parse(oReq.responseText);
			return cb(null, response.association);
		});
		oReq.open("POST", oReq.hostname + "/api/lambda/association");
		oReq.send(formData);
	}

	createApplication(definition1, definition2, cb) {
		var formData = new FormData();
		formData.append("definition1", definition1);
		formData.append("definition2", definition2);
		
		var oReq = new XMLHttpRequest();
		oReq.addEventListener("load", (evt) => {
			if (oReq.status != 200) return cb(oReq.responseText);
			var response = JSON.parse(oReq.responseText);
			return cb(null, response.association);
		});
		oReq.open("POST", oReq.hostname + "/api/lambda/application");
		oReq.send(formData);
	}

	createSubstitution(type, definition1, definition2, cb) {
		var formData = new FormData();
		formData.append("type", type);
		formData.append("definition1", definition1);
		formData.append("definition2", definition2);
		
		var oReq = new XMLHttpRequest();
		oReq.addEventListener("load", (evt) => {
			if (oReq.status != 200) return cb(oReq.responseText);
			var response = JSON.parse(oReq.responseText);
			return cb(null, response.substitution);
		});
		oReq.open("POST", oReq.hostname + "/api/lambda/substitution");
		oReq.send(formData);
	}

	createFreeIdentifier(name, cb) {
		var formData = new FormData();
		formData.append("name", name);
		
		var oReq = new XMLHttpRequest();
		oReq.addEventListener("load", (evt) => {
			if (oReq.status != 200) return cb(oReq.responseText);
			var response = JSON.parse(oReq.responseText);
			return cb(null, response.freeidentifier);
		});
		oReq.open("POST", oReq.hostname + "/api/lambda/freeidentifier");
		oReq.send(formData);
	}


}

exports.ApiClient = ApiClient;