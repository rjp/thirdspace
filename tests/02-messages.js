var assert = require('assert');
var http = require('http');
var ua3 = require('../server');
var tester = require('../httpclient');
var sys = require('sys');
var testdata = require('../testdata.js');

exports['message-1'] = function(test){
    var body = "";
    tester.get('/message/1', function(got, code){
        test.expect(1);
        test.equal(code, 200, '200 OK');
        test.done();
    });
};

