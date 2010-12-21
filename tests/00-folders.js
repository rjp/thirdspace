var assert = require('assert');
var http = require('http');
var tester = require('../httpclient');
var sys = require('sys');
var testdata = require('../testdata.js');

function make_test(who) {
    return function(test) {
	    tester[who].get('/folders', function(got){
	        test.expect(1);
	        test.deepEqual(got, testdata.json.folders.t00[who], "Folders "+who);
	        test.done();
	    });
    }
}

var fred = testdata.json.folders.t01;
var users = ['rjp', 'techno', 'lurker'];

for (var j in users) {
    exports['folders-'+users[j]] = make_test(users[j]);
}
