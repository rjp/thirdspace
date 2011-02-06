var assert = require('assert');
var http = require('http');
var ua3 = require('../server');
var tester = require('../httpclient');
var sys = require('sys');
var testdata = require('../testdata.js');

exports['subscribe-private'] = function(test){
    var body = "";
    tester.rjp.post('/folder/private/subscribe', {}, function(got, code){
        test.expect(1);
        test.equal(code, 500, '500 error');
        test.done();
    });
};

exports['subscribe-test'] = function(test){
    tester.rjp.post('/folder/test/subscribe', {}, function(got, code){
        test.expect(3);
        test.equal(code, 200, '200 OK');
        test.deepEqual(got, {"folder":"test"}, "Folder TEST");
        // TODO this should test that we're subscribed to all our original
        // folders + test but that's tricky given we get a list back from
        // /folders and deepEqual can't compare differently sorted lists
        tester.rjp.get('/folderinfo/test', function(got, code){
            test.equal(got.sub, 1, 'subscribed ok?');
            test.done();
        });
    });
};

exports['unsubscribe-test'] = function(test){
    tester.rjp.post('/folder/test/unsubscribe', {}, function(got, code){
        test.expect(3);
        test.equal(code, 200, '200 OK');
        test.deepEqual(got, {"folder":"test"}, "Folder TEST");
        tester.rjp.get('/folderinfo/test', function(got, code){
            test.equal(got.sub, 0, 'subscribed ok?');
            test.done();
        });
    });
};


exports['subscribe-no-folder'] = function(test){
    var body = "";
    tester.rjp.post('/folder/kalamazoo/subscribe', {}, function(got, code){
        test.expect(2);
        test.equal(code, 404, '404 Unknown Folder');
        tester.rjp.get('/folder/kalamazoo', function(got, code){
            test.equal(code, 404, 'subscribe-auto-vivify?');
            test.done();
        });
    });
};
