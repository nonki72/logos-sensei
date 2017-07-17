'use strict';

var XMLHttpRequest = require('xhr2');
var XMLHttpRequestUpload = XMLHttpRequest.XMLHttpRequestUpload;
var request = require('superagent-q');
 
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

	createStoredFunction(name, astid, fn, fntype, fnclass, argnum, argtypes, modules, memoize, testargs) {
		var data = {
			astid: astid,
			fn: fn,
			fntype: fntype,
			fnclass: fnclass,
			argnum: argnum,
			argtypes: argtypes,
			modules: modules,
			memoize: memoize,
			testargs: testargs
		};
		// if (astid) data.append("astid", astid);
		// if (fn) formData.append("fn", fn);
		// if (fntype) formData.append("fntype", fntype);
		// if (fnclass) formData.append("fnclass", fnclass);
		// if (argnum != null) formData.append("argnum", argnum);
		// if (argtypes) formData.append("argtypes", JSON.stringify(argtypes));
		// if (modules) formData.append("modules", JSON.stringify(modules));
		// if (memoize != null) formData.append("memoize", memoize);
		// if (testargs) formData.append("testargs", JSON.stringify(testargs));

		return request.post(this.hostname + "/api/function/" + name)
		  .send(data).end()
	    .then(function(res) {
				if (res.status != 200) throw new Error(res.statusText);
	      return res.json();
	    }).then(function(json) {
	    	console.log("success:"+JSON.stringify(json));
				return json.storedfunction;
	    });
	}

	createAssociation(sourceid, destinationid, associativevalue) {
		var data = {
			sourceid: sourceid,
			destinationid: destinationid,
			associativevalue: associativevalue
		};
		// formData.append("sourceid", sourceid);
		// formData.append("destinationid", destinationid);
		// formData.append("associativevalue", associativevalue);
		
		return request.post(this.hostname + "/api/function/association")
		  .send(data).end()
	    .then(function(res) {
				if (res.status != 200) throw new Error(res.statusText);
	      return res.json();
	    }).then(function(json) {
	    	console.log("success:"+JSON.stringify(json));
				return json.storedfunction;
	    });
	}

	createApplication(definition1, definition2) {
		var data = {
			definition1: definition1,
			definition2: definition2
		};
		// formData.append("definition1", definition1);
		// formData.append("definition2", definition2);

		return agent.post(this.hostname + "/api/lambda/application", data)
	    .then(function(res) {
				if (res.status != 200) throw new Error(res.statusText);
	      return res.json();
	    }).then(function(json) {
	    	console.log("success:"+JSON.stringify(json));
				return json.storedfunction;
	    });
	}

	createSubstitution(type, definition1, definition2) {
		var formData = new FormData();
		formData.append("type", type);
		formData.append("definition1", definition1);
		formData.append("definition2", definition2);
		
		return fetch(this.hostname + "/api/lambda/substitution", { method: 'POST', body: formData })
	    .then(function(res) {
				if (res.status != 200) throw new Error(res.statusText);
	      return res.json();
	    }).then(function(json) {
	    	console.log("success:"+JSON.stringify(json));
				return json.storedfunction;
	    });
	}

	createFreeIdentifier(name) {
		var formData = new FormData();
		formData.append("name", name);
		
		return fetch(this.hostname + "/api/lambda/freeidentifier", { method: 'POST', body: formData })
	    .then(function(res) {
				if (res.status != 200) throw new Error(res.statusText);
	      return res.json();
	    }).then(function(json) {
	    	console.log("success:"+JSON.stringify(json));
				return json.storedfunction;
	    });

	}


}

exports.ApiClient = ApiClient;