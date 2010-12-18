var assert = require('assert');
var http = require('http');
var ua3 = require('../server');
var tester = require('../httpclient');
var sys = require('sys');
var testdata = require('../testdata.js');

exports['posting-1'] = function(test){
    tester.post('/folder/test', {subject:"Testing post", body:"New Post"}, function(got, code){
        test.expect(4);
        test.equal(code, 200, '200 OK');
        test.equal(11, got.id, 'New message ID = 11');
        test.equal(11, got.thread, 'New thread ID = 11');
        // message epoch should be recent
        var now = parseInt(new Date().getTime() / 1000, 10);
        test.ok(now - got.epoch < 30, 'recent is ok');
        test.done();
    });
};

exports['posting-2'] = function(test) {
    tester.get('/message/11', function(got, code){
        test.expect(3);
        test.equal(200, code, 'Message 11 exists');
        test.equal('Testing post', got.subject, 'Message 11 subject');
        test.equal('New Post', got.body, 'Message 11 body');
        test.done();
    });
}

