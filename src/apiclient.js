'use strict';

var XMLHttpRequest = require('xhr2');
var XMLHttpRequestUpload = XMLHttpRequest.XMLHttpRequestUpload;
var request = require('superagent-q');
const http = require('http');

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

	readWordFrequency(name) {
		return request.get(this.hostname + "/api/frequency/" + name)
			.end()
			.then(function(res) {
				if (!res.ok) throw new Error(res.status);
				return res.body.word;
			}, (res)=>{
				console.log(res.message + " : " + res.response);
			});
	}

  readFreeIdentifier(name) {
	  return request.get(this.hostname + "/api/function/" + name)
	  .end()
		.then(function(res) {
			if (!res.ok) throw new Error(res.status);
			return res.body.freeidentifier;
    }, (res)=>{
    	console.log(res.message + " : " + res.response);
    });
  }


// attributes of 'data':
      // name
			// astid
			// fn
			// fntype
			// fnclass
			// argnum
			// argtypes
			// modules
			// memoize
			// testargs
	createStoredFunction(data) {
		return request.post(this.hostname + "/api/function/" + data.name)
		  .send(data).end()
		  .then(function(res) {
				if (!res.ok) throw new Error(res.status);
	    	//console.log("success:"+JSON.stringify(res.body));
				return res.body.storedfunction;
	    }, (res)=>{
	    	console.log(res.message + " : " + res.response.text);
	    });
	}

	createStoredValue(name, type, mod, klass, value) {
		var data = {
			name: name,
			astid: null,
			fn: value,
			fntype: type,
			fnmod: mod,
			fnclass: klass,
			argnum: null,
			argtypes: null,
			modules: null,
			memoize: false,
			testargs: null
		};
		return this.createStoredFunction(data);
	}

	incrementEC(sourceid, destinationid) {
		var data = {
			sourceid: sourceid,
			destinationid: destinationid
		};
		
		return request.post(this.hostname + "/api/ec/increment")
		  .send(data).end()
	    .then(function(res) {
				if (!res.ok) throw new Error(res.status);
	    	// console.log("success:"+JSON.stringify(res.body));
				return res.body.association;
	    }, (res)=>{
	    	console.log(res.message + " : " + res.response);
	    });
	}

	createApplication(definition1, definition2) {
		var data = {
			definition1: definition1,
			definition2: definition2
		};

		return request.post(this.hostname + "/api/lambda/application")
		.send(data).end()
	    .then(function(res) {
				if (!res.ok) throw new Error(res.status);
	    	// console.log("success:"+JSON.stringify(res.body));
				return res.body.application;
	    }, (res)=>{
	    	console.log(res.message + " : " + res.response);
	    });
	}

	createAbstraction(name, definition2) {
		var data = {
			name: name,
			definition2: definition2
		};

		return request.post(this.hostname + "/api/lambda/abstraction")
		.send(data).end()
	    .then(function(res) {
				if (!res.ok) throw new Error(res.status);
	    	// console.log("success:"+JSON.stringify(res.body));
				return res.body.abstraction;
	    }, (res)=>{
	    	console.log(res.message + " : " + res.response);
	    });
	}


	createSubstitution(type, definition1, definition2) {
		var data = {
			type: type,
			definition1: definition1,
			definition2:definition2
		};
		return request.post(this.hostname + "/api/lambda/substitution")
		  .send(data).end()
	    .then(function(res) {
				if (!res.ok) throw new Error(res.status);
	    //	console.log("success:"+JSON.stringify(res.body));
				return res.body.substitution;
	    }, (res)=>{
	    	console.log(res.message + " : " + res.response);
	    });
	}

	createWordFrequency(name, freq) {
		const nameEscaped = encodeURI(name);
				
		var options = {
			hostname: '127.0.0.1',
			port: 9001,
			path: "/api/frequency/" + nameEscaped,
			method: 'post',
			headers: {
					"content-type": "application/json",
				}
				
		};
		var req = http.request(options, function(res) {
			console.log('Status: ' + res.statusCode);
			console.log('Headers: ' + JSON.stringify(res.headers));
			res.setEncoding('utf8');
			res.on('data', function (body) {
				console.log('Body: ' + body); 
			});
		});
		req.on('error', function(e) {
			console.log('problem with request: ' + e.message);
		});
		req.write('{ "freq" : '+freq+' }',);
		req.end();
	}

	createFreeIdentifier(name) {
		var data = {name: name};
		
		return request.post(this.hostname + "/api/lambda/freeidentifier")
		  .send(data).end()
	    .then(function(res) {
				if (!res.ok) throw new Error(res.status);
	    	// console.log("success:"+JSON.stringify(res.body));
				return res.body.freeidentifier;
	    }, (res)=>{
	    	console.log(res.message + " : " + res.response);
	    });

	}

	createModule(name, path) {
		var data = {name: name, path: path};
		
		return request.post(this.hostname + "/api/module/" + name)
		  .send(data).end()
	    .then(function(res) {
				if (!res.ok) throw new Error(res.status);
	    	// console.log("success:"+JSON.stringify(res.body));
				return res.body.module;
	    }, (res)=>{
	    	console.log(res.message + " : " + res.response);
	    });

	}


	createClass(name, module) {
		var data = {name: name, module: module};
		
		return request.post(this.hostname + "/api/class/" + name)
		  .send(data).end()
	    .then(function(res) {
				if (!res.ok) throw new Error(res.status);
	    	// console.log("success:"+JSON.stringify(res.body));
				return res.body.module;
	    }, (res)=>{
	    	console.log(res.message + " : " + res.response);
	    });

	}
}

exports.ApiClient = ApiClient;