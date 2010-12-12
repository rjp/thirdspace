var assert = require('assert');
var http = require('http');
var ua3 = require('../server');
var tester = require('../httpclient');
var sys = require('sys');

var myfolders = JSON.parse('{"chat":{"folder":"chat","unread":3,"count":5},"mine":{"unread":1,"count":2,"folder":"mine"}}');

exports['folder-chat'] = function(test){
    var body = "";
    test.expect(1);
    tester.request('/folder/chat', function(got){
        test.deepEqual(got, myfolders.chat, "Folder CHAT");
        test.done();
    });
};

exports['folder-mine'] = function(test){
    var body = "";
    test.expect(1);
    tester.request('/folder/mine', function(got){
        test.deepEqual(got, myfolders.mine, "Folder MINE");
        test.done();
    });
};

exports['folder-test'] = function(test){
    var body = "";
    test.expect(1);
    tester.request('/folder/test', function(got){
            sys.puts(sys.inspect(got));
        test.deepEqual(got, myfolders.test, "Folder TEST");
        test.done();
    });
};
