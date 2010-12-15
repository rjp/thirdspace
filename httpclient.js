var http = require('http');
var sys = require('sys');
var my_client = http.createClient(3000, 'localhost');

function request(method, path, callback){
    var auth = 'Basic ' + new Buffer('rjp:moose').toString('base64');
    var header = {'Host': 'localhost', 'Authorization': auth};
    var request = my_client.request(method, path, header);
    var body = '';

    request.end();
    request.on('response', function (response) {
        response.on('data', function (chunk) {
            body = body + chunk;
        });
        response.on('end', function(){
            var got;
            var code = response.statusCode;
            try {
                got = JSON.parse(body);
            } catch(e) {
                got = {};
                code = '999';
            }
            callback(got, code);
        });
    });
}

exports.get = function(path, callback) {
    request('GET', path, callback);
}

exports.post = function(path, callback) {
    request('POST', path, callback);
}
