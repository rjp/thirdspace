var assert = require('assert');
var http = require('http');
var ua3 = require('../server');
var tester = require('../httpclient');
var sys = require('sys');
var testdata = require('../testdata.js');

function make_test(folder, who, wanted) {
    return function(test) {
	    tester[who].get('/folder/'+folder, function(got){
	        test.expect(1);
	        test.deepEqual(got, wanted, "Folder "+folder+", "+who);
	        test.done();
	    });
    }
}

var fred = testdata.json.folders.t01;
var users = ['rjp', 'techno', 'lurker'];
var folders = ['chat', 'mine', 'test'];

for(var i in folders) {
    for (var j in users) {
        var f = folders[i];
        var u = users[j];
        sys.puts("making test for "+f+", "+u);
        exports['folder-'+f+'-'+u] = make_test(f, u, fred[u][f]);
    }
}

