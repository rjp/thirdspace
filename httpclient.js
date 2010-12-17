var http = require('http');
var sys = require('sys');
var restler = require('./restler/lib/restler');
var my_client = http.createClient(3000, 'localhost');

UA3 = restler.service(function(u, p){
    this.defaults.username = u;
    this.defaults.password = p;
    this.defaults.parser = restler.parsers.auto;
}, {
    baseURL: 'http://localhost:3000'
}, {
    raw_get: function(path, callback) {
        // uh-huh, you have to pass {} to get if you use defaults
        this.get(path, {}).addListener('complete', function(data, resp){
            callback(data, resp.statusCode);
        });
    },
    raw_post: function(path, data, callback) {
        this.post(path, data).addListener('complete', function(data, resp){
            callback(data, resp.statusCode);
        });
    }
});

var my_ua3 = new UA3('rjp','moose'); // change this at some point

exports.get = function(path, callback) {
    my_ua3.raw_get(path, callback);
}

exports.post = function(path, data, callback) {
    my_ua3.raw_post(path, data, callback);
}
