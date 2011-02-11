var assert = require('assert');
var http = require('http');
var ua3 = require('../server');
var tester = require('../httpclient');
var sys = require('sys');
var testdata = require('../testdata.js');

exports['thread-1'] = function(test){
    tester.rjp.get('/thread/1', function(got, code){
        test.expect(2);
        test.equal(code, 200, '200 OK');
        test.deepEqual(got, testdata.json.threads.t_1, 'Matched T1');
        test.done();
    });
};

exports['thread-2'] = function(test){
    tester.rjp.get('/thread/2', function(got, code){
        test.expect(2);
        test.equal(code, 200, '200 OK');
        test.deepEqual(got, testdata.json.threads.t_2, 'Matched T2');
        test.done();
    });
};

