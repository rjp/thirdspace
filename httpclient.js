var http = require('http');
var sys = require('sys');
var my_client = http.createClient(3000, 'localhost');

exports.request = function(path, callback){
    var auth = 'Basic ' + new Buffer('rjp:moose').toString('base64');
    var header = {'Host': 'localhost', 'Authorization': auth};
    var request = my_client.request('GET', path, header);
    var body = '';

    request.end();
    request.on('response', function (response) {
        response.on('data', function (chunk) {
            body = body + chunk;
        });
        response.on('end', function(){
            var got = JSON.parse(body);
            callback(got);
        });
    });
}
