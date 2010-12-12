var assert = require('assert');
var http = require('http');
var ua3 = require('../server');
var tester = require('../httpclient');
var sys = require('sys');

var myfolders = JSON.parse('[{"folder":"chat","unread":5,"count":5},{"folder":"mine","unread":2,"count":2}]');

ua3.startup();

exports['folders'] = function(test){
    var body = "";
    test.expect(1);
    var request = tester.request('/folders');
    request.end();
    request.on('response', function (response) {
        response.on('data', function (chunk) {
            body = body + chunk;
        });
        response.on('end', function(){
            var got = JSON.parse(body);
            test.deepEqual(got, myfolders, "Folders");
            test.done();
        });
    });
}
