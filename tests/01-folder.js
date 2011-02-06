var assert = require('assert');
var http = require('http');
var ua3 = require('../server');
var tester = require('../httpclient');
var sys = require('sys');
var testdata = require('../testdata.js');

var m = {
    "rjp": {
        "chat": ["m_four", "m_seven", "m_eight"],
        "test": ["m_three", "m_five", "m_six"],
        "mine": ["m_ten"]
    },
    "techno": {
        "chat": ["m_four", "m_seven", "m_eight"],
        "test": ["m_three", "m_five", "m_six"],
        "mine": ["m_nine","m_ten"]
    },
    "lurker": {
        "chat": ["m_one", "m_four", "m_two", "m_seven", "m_eight"],
        "test": ["m_three", "m_five", "m_six"],
        "mine": ["m_nine","m_ten"]
    }
};

var expected = [];
for (var u in m) {
    for (var f in m[u]) {
        for (var mn in m[u][f]) {
            var k = m[u][f][mn];
            if (expected[u] == undefined) { expected[u] = []; }
            if (expected[u][f] == undefined) { expected[u][f] = []; }
            var o = testdata.json.preload[k];
            delete o['body'];
            expected[u][f].push(o);
        }
    }
};
 
function make_test(folder, who, wanted) {
    var e = [];
    if (expected[who] != undefined && expected[who][folder] != undefined) {
        e = expected[who][folder];
    }
    return function(test) {
	    tester[who].get('/folder/'+folder, function(got){
	        test.expect(1);
	        test.deepEqual(got, e, "Folder "+folder+", "+who);
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

