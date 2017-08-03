var q=require('q');

var d = q.defer();
d.resolve('b');
d.reject('a');
d.promise.then((i)=>{console.log("success:"+i)},(e)=>{console.log("error:"+e)}).done();