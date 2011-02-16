var assert = require('assert');
var http = require('http');
var ua3 = require('../server');
var tester = require('../httpclient');
var sys = require('sys');
var testdata = require('../testdata.js');

exports['markread-1'] = function(test){
    tester.rjp.get('/folder/chat', function(got, code){
        test.expect(4);
        test.equal(got.length, 3, '3 unread messages to start with');
        tester.rjp.post('/message/read', {messages:[4]}, function(got, code){
            test.equal(code, 200, 'can mark things as read');
            test.deepEqual(got, {count:1}, 'one message marked read');
            tester.rjp.get('/folder/chat', function(got, code){
                test.equal(got.length, 2, '2 unread messages after');
                test.done();
            });
        });
    });
};

exports['markread-2'] = function(test){
    test.expect(3);
    tester.rjp.post('/message/unread', {messages:[4]}, function(got, code){
        test.equal(code, 200, 'can mark things as read');
        test.deepEqual(got, {count:1}, 'one message marked unread');
        tester.rjp.get('/folder/chat', function(got, code){
            test.equal(got.length, 3, '3 unread messages after');
            test.done();
        });
    });
};

exports['markread-3'] = function(test){
    test.expect(3);
    tester.rjp.post('/thread/read', {thread:3}, function(got, code){
        test.equal(code, 200, 'can mark threads as read');
        test.deepEqual(got, {count:2}, 'one thread, two messages marked read');
        tester.rjp.get('/folder/chat', function(got, code){
            test.equal(got.length, 1, '1 unread messages after');
            test.done();
        });
    });
};

exports['markread-4'] = function(test){
    test.expect(3);
    tester.rjp.post('/thread/unread', {thread:3}, function(got, code){
        test.equal(code, 200, 'can mark threads as read');
        test.deepEqual(got, {count:2}, 'one thread, two messages marked unread');
        tester.rjp.get('/folder/chat', function(got, code){
            test.equal(got.length, 3, '3 unread messages after');
            test.done();
        });
    });
};

