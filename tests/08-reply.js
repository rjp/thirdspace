var assert = require('assert');
var http = require('http');
var ua3 = require('../server');
var tester = require('../httpclient');
var sys = require('sys');
var testdata = require('../testdata.js');

exports['reply-1'] = function(test){
    tester.post('/message/1', {body:"Testings"}, function(got, code){
        test.expect(2);
        test.equal(code, 200, '200 OK');
        var reply_epoch = got.epoch;
        delete got.epoch; // ignore this for deepEqual
        test.deepEqual(got, testdata.replies.r_one, 'Matched R1');
        var now = parseInt(new Date().getTime() / 1000, 10);
        // test that now - reply_epoch < 30ish
        // test.within(30, now - reply_epoch, 'recent is ok');
        test.done();
    });
};

