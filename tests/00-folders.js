var assert = require('assert');
var http = require('http');
var ua3 = require('../server');
var tester = require('../httpclient');
var sys = require('sys');

var myfolders = JSON.parse('[{"folder":"chat","unread":3,"count":5},{"folder":"mine","unread":1,"count":2}]');

ua3.startup();

exports['folders'] = function(test){
    var body = "";
    test.expect(1);
    tester.request('/folders', function(got){
        test.deepEqual(got, myfolders, "Folders");
        test.done();
    });
};
