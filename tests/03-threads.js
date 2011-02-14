var assert = require('assert');
var http = require('http');
var ua3 = require('../server');
var tester = require('../httpclient');
var sys = require('sys');
var testdata = require('../testdata.js');

var threads = {
    "1": ["m_one", "m_two", "m_ten"],
    "2": ["m_three"],
    "3": ["m_four"],
    "4": ["m_five", "m_seven"]
};

// convert our thread shortcuts into full message lists
var expected = [];
for (var thread in threads) {
    for (var message in threads[thread]) {
        var id = threads[thread][message];
        if (expected[thread] == undefined) { expected[thread] = []; }
        var o = testdata.json.preload[id];
        delete o['body'];
        expected[thread].push(o);
    }
};

function make_test(thread, who, wanted) {
    var e = expected[thread];
    return function(test) {
	    tester[who].get('/thread/'+thread, function(got, code){
	        test.expect(2);
            test.equal(code, 200, '200 OK');
	        test.deepEqual(got, e, "Thread "+thread+", "+who);
	        test.done();
	    });
    }
}

var users = ['rjp','techno','lurker'];
for(var i in users) {
    var user = users[i];
    for(var t in [1,2,3,4]) {
        exports['thread-'+user+'-'+t] = make_test(1, user);
    }
}
