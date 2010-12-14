var assert = require('assert');
var http = require('http');
var tester = require('../httpclient');
var sys = require('sys');
var testdata = require('../testdata.js');

exports['folders'] = function(test){
    var body = "";
    tester.get('/folders', function(got, code){
        test.expect(2);
        test.equal(code, 200, '200 OK');
        test.deepEqual(got, testdata.myfolders, "/folders");
        test.done();
    });
};
