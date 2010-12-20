var http = require('http');
var sys = require('sys');
var restler = require('./restler/lib/restler');

function Tester(user, pass) {
    // ramming this in here is crufty but the easiest way to work
    // around the restler.service call being effectively a singleton
    var UA3 = restler.service(function(u, p){
	    this.defaults.username = u;
	    this.defaults.password = p;
	    this.defaults.parser = restler.parsers.auto;
	    this.defaults.ignoreErrors = true;
        this.defaults.jsondata = true;
	}, {
	    baseURL: 'http://localhost:3000'
	}, {
	    raw_get: function(path, callback) {
	        // uh-huh, you have to pass {} to get if you use defaults
	        this.get(path, {}).addListener('complete', function(data, resp){
	            callback(data, resp.statusCode);
	        });
	    },
	    raw_post: function(path, cgi, callback) {
	        this.post(path, {data:cgi}).addListener('complete', function(data, resp){
	            callback(data, resp.statusCode);
	        });
	    }
	});

    this.ua3 = new UA3(user, pass);
}

Tester.prototype.get = function(path, callback) {
    this.ua3.raw_get(path, callback);
}
Tester.prototype.post = function(path, data, callback) {
    this.ua3.raw_post(path, data, callback);
}
exports.Tester = Tester;

exports.rjp = new Tester('rjp','moose');
exports.techno = new Tester('techno','ladroga');
exports.lurker = new Tester('lurker','spaniel');
