var assert = require('assert');
var http = require('http');
var ua3 = require('../server');
var tester = require('../httpclient');
var sys = require('sys');

var myfolders = JSON.parse('{"chat":{"folder":"chat","unread":3,"count":5},"mine":{"unread":1,"count":2,"folder":"mine"}}');

exports['subscribe-private'] = function(test){
    var body = "";
    tester.post('/folder/private/subscribe', function(got, code){
        test.expect(1);
        test.equal(code, 500, '500 error');
        test.done();
    });
};

exports['subscribe-test'] = function(test){
    var body = "";
    tester.post('/folder/test/subscribe', function(got, code){
        test.expect(3);
        test.equal(code, 200, '200 OK');
        test.deepEqual(got, {"folder":"test"}, "Folder TEST");
        tester.get('/folder/test', function(got, code){
            test.equal(got.sub, 1, 'subscribed ok?');
            test.done();
        });
    });
};

exports['subscribe-no-folder'] = function(test){
    var body = "";
    tester.post('/folder/kalamazoo/subscribe', function(got, code){
        test.expect(2);
        test.equal(code, 404, '404 OK');
        tester.get('/folder/kalamazoo', function(got, code){
            test.equal(code, 404, 'subscribe-vivify?'); 
            test.done();
        });
    });
};
