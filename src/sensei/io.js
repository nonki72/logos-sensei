'use strict';
const Q = require('q');
Q.map = require('q-map').map;
const async = require('async');


class IoSensei {

  constructor(apiClient) {
  	this.apiClient = apiClient;
  }

  teach() {

  }

}


exports.IoSensei = IoSensei;