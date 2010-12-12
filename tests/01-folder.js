var assert = require('assert');
var http = require('http');
var ua3 = require('../server');
var tester = require('../httpclient');
var sys = require('sys');

var myfolders = JSON.parse('{"chat":{"folder":"chat","unread":3,"count":5,"sub":1},"mine":{"unread":1,"count":2,"folder":"mine","sub":1}}');

exports['folder-chat'] = function(test){
    var body = "";
    tester.get('/folder/chat', function(got){
        test.expect(1);
        test.deepEqual(got, myfolders.chat, "Folder CHAT");
        test.done();
    });
};

exports['folder-mine'] = function(test){
    var body = "";
    tester.get('/folder/mine', function(got){
        test.expect(1);
        test.deepEqual(got, myfolders.mine, "Folder MINE");
        test.done();
    });
};

exports['folder-test'] = function(test){
    var body = "";
    tester.get('/folder/test', function(got){
        test.expect(1);
        test.deepEqual(got, myfolders.test, "Folder TEST");
        test.done();
    });
};
