var assert = require('assert');
var http = require('http');
var ua3 = require('../server');
var tester = require('../httpclient');
var sys = require('sys');
var testdata = require('../testdata.js');

exports['annotate-1'] = function(test){
    tester.rjp.post('/annotate/1', {anno:"Correction!"}, function(got, code){
        test.expect(2);
        test.equal(code, 200, 'can annotate your own message');
/* check some other things here */
        tester.rjp.get('/message/1', function(got, code){
            test.equal(got.anno_from, 'Correction!', 'annotated ok');
            test.done();
        });
    });
};

exports['annotate-2'] = function(test) {
    tester.rjp.post('/annotate/2', {anno:"Flanges?"}, function(got, code){
        test.expect(2);
        test.equal(200, code, 'can annotate a reply');
        tester.rjp.get('/message/2', function(got, code){
            test.equal(got.anno_to, 'Flanges?', 'annotated ok');
            test.done();
        });
    });
}

exports['annotate-3'] = function(test){
    tester.rjp.post('/annotate/1', {anno:"Twice?"}, function(got, code){
        test.expect(1);
        test.equal(code, 500, 'can only annotate once');
/* check some other things here */
        test.done();
    });
};

exports['annotate-4'] = function(test){
    tester.rjp.post('/annotate/3', {anno:"Moist"}, function(got, code){
        test.expect(1);
        test.equal(code, 500, 'cannot annotate non-to/from messages');
/* check some other things here */
        test.done();
    });
};

exports['annotate-5'] = function(test) {
    tester.techno.post('/annotate/2', {anno:"Puntime"}, function(got, code){
        test.expect(3);
        test.equal(200, code, 'can annotate after to:annotation');
        tester.techno.get('/message/2', function(got, code){
            test.equal(got.anno_to, 'Flanges?', 'annotated ok');
            test.equal(got.anno_from, 'Puntime', 'annotated ok');
            test.done();
        });
    });
};

