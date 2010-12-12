var assert = require('assert');
var http = require('http');
var tester = require('../httpclient');
var sys = require('sys');

var myfolders = JSON.parse('[{"folder":"chat","unread":3,"count":5,"sub":1},{"folder":"mine","unread":1,"count":2, "sub":1}]');
var allfolders = JSON.parse('[{"folder":"chat","unread":3,"count":5,"sub":1},{"folder":"mine","unread":1,"count":2, "sub":1},{"folder":"test","unread":3,"count":3,"sub":0}]');

exports['folders'] = function(test){
    var body = "";
    tester.get('/folders', function(got){
        test.expect(1);
        test.deepEqual(got, myfolders, "Folders");
        test.done();
    });
};
