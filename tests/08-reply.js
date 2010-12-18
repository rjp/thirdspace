var assert = require('assert');
var http = require('http');
var ua3 = require('../server');
var tester = require('../httpclient');
var sys = require('sys');
var testdata = require('../testdata.js');

exports['reply-1'] = function(test){
    tester.post('/message/1', {body:"Reply to #1"}, function(got, code){
        test.expect(4);
        test.equal(code, 200, '200 OK');
        test.equal(13, got.id, 'New message ID = 13');
        test.equal(1, got.thread, 'Old thread ID = 1');
        // message epoch should be recent
        var now = parseInt(new Date().getTime() / 1000, 10);
        test.ok(now - got.epoch < 30, 'recent is ok');
        test.done();
    });
};

exports['reply-2'] = function(test) {
    tester.get('/message/13', function(got, code){
        test.expect(3);
        test.equal(200, code, 'Reply 13 exists');
        test.equal(testdata.messages.m_one.subject, got.subject, 'Matches #1 subject');
        test.equal('Reply to #1', got.body, 'Reply 13 body');
        test.done();
    });
}
