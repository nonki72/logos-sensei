const lineReader = require('line-reader');
const async = require('async');
const wndb = require('wndb-with-exceptions');
const WordNet = require('node-wordnet');
var wordnet = new WordNet();

const suffixes = ['adj', 'adv', 'noun', 'verb'];

async.eachSeries(suffixes, (suffix, cb) => {
	var filepath = wndb.path + '\\index.' + suffix;
	console.log(filepath);


	lineReader.eachLine(filepath, function(line, last, cb2) {
		if (line.substr(0,1) == ' ') return cb2();
		var word = line.substr(0, line.indexOf(' ')); 

		wordnet.lookup(word, function(results) {
	    async.eachSeries(results, (result, cb3) => {
        console.log('------------------------------------');
        console.log("word:"+word);
        console.log("synset:"+result.synsetOffset);
        console.log("pos:"+result.pos);
        console.log("lemma:"+result.lemma);
        console.log("synonyms:"+result.synonyms);
        console.log("gloss:"+result.gloss);
        cb3();
	    }, (err) => {
	    	if (last) cb();
	    	else      cb2(true); // true: keep reading
	    });
		});
	});
});

