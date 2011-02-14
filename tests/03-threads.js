var assert = require('assert');
var http = require('http');
var ua3 = require('../server');
var tester = require('../httpclient');
var sys = require('sys');
var testdata = require('../testdata.js');

var threads = {
    "1": ["m_one", "m_two", "m_ten"],
    "2": ["m_three"],
    "3": ["m_four", "m_seven"],
    "4": ["m_five"]
};

// convert our thread shortcuts into full message lists
var expected = [];
var with_body = [];
for (var thread in threads) {
    for (var message in threads[thread]) {
        var id = threads[thread][message];
        if (expected[thread] == undefined) { expected[thread] = []; }
        if (with_body[thread] == undefined) { with_body[thread] = []; }
        var wb = {}; var o = {};
        var source = testdata.json.preload[id];
        for (var i in source) { wb[i] = source[i]; o[i] = source[i]; }
        delete o['body'];
        expected[thread].push(o);
        with_body[thread].push(wb);
    }
};

function make_header_test(thread, who, wanted) {
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

function make_body_test(thread, who, wanted) {
    var e = with_body[thread];
    return function(test) {
	    tester[who].get('/thread/'+thread+'/full', function(got, code){
	        test.expect(2);
            test.equal(code, 200, '200 OK');
	        test.deepEqual(e, got, "FULL "+thread+", "+who);
	        test.done();
	    });
    }
}

var users = ['rjp','techno','lurker'];
var threads = [1,2,3,4];
for(var i in users) {
    var user = users[i];
    for(var t in threads) {
        var th = threads[t];
        exports['thread-'+user+'-'+th] = make_header_test(th, user);
        exports['thread-full-'+user+'-'+th] = make_body_test(th, user);
    }
}
