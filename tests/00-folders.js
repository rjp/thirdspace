var assert = require('assert');
var http = require('http');
var tester = require('../httpclient');
var sys = require('sys');
var testdata = require('../testdata.js');

exports['folders-1'] = function(test){
    var body = "";
    tester.rjp.get('/folders', function(got, code){
        test.expect(2);
        test.equal(code, 200, '200 OK');
        test.deepEqual(got, testdata.l_myfolders, "/folders");
        test.done();
    });
};

exports['folders-2'] = function(test){
    var body = "";
    tester.techno.get('/folders', function(got, code){
        test.expect(2);
        test.equal(code, 200, '200 OK');
        test.deepEqual(got, testdata.l_myfolders, "/folders");
        test.done();
    });
};
