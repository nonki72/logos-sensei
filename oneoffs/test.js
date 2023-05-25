'use strict';
const Q = require('q');
var promises = Q();

function go() {
    var promise = Q();
    var counter = 0;
    while (++counter < 10) {
       console.log(counter);
       promise = promise.nfcall(go);
    }
    return promise;
}
promises
    .then(go())
    .then(go())
    .then((r)=>{console.log('done');r()});


