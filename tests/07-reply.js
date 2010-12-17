var assert = require('assert');
var http = require('http');
var ua3 = require('../server');
var tester = require('../httpclient');
var sys = require('sys');
var testdata = require('../testdata.js');

exports['reply-1'] = function(test){
    tester.post('/message/1', {}, function(got, code){
        test.expect(2);
        test.equal(code, 200, '200 OK');
        test.deepEqual(got, testdata.messages.m_one, 'Matched M1');
        test.done();
    });
};

