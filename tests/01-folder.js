var assert = require('assert');
var http = require('http');
var ua3 = require('../server');
var tester = require('../httpclient');
var sys = require('sys');
var testdata = require('../testdata.js');

exports['folder-chat'] = function(test){
    var body = "";
    tester.get('/folder/chat', function(got){
        test.expect(1);
        test.deepEqual(got, testdata.h_myfolders.chat, "Folder CHAT");
        test.done();
    });
};

exports['folder-mine'] = function(test){
    var body = "";
    tester.get('/folder/mine', function(got){
        test.expect(1);
        test.deepEqual(got, testdata.h_myfolders.mine, "Folder MINE");
        test.done();
    });
};

exports['folder-test'] = function(test){
    var body = "";
    tester.get('/folder/test', function(got){
        test.expect(1);
        test.deepEqual(got, testdata.h_allfolders.test, "Folder TEST");
        test.done();
    });
};
