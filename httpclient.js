var http = require('http');
var sys = require('sys');
var my_client = http.createClient(3000, 'localhost');

exports.request = function(path){
    var auth = 'Basic ' + new Buffer('rjp:moose').toString('base64');
    var header = {'Host': 'localhost', 'Authorization': auth};

    return my_client.request('GET', path, header);
}
