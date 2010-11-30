var sys = require('sys');
var connect = require('connect');
var auth = require('connect-auth');
var fs = require('fs');
var redisFactory = require('redis-node');
var Log = require('log'), log = new Log(Log.INFO);
var redis = redisFactory.createClient();

var config_json = fs.readFileSync(process.argv[2], 'utf8');
var config = JSON.parse(config_json);

var server = connect.createServer(
    connect.logger({ format: ':method :url' }),
    connect.bodyDecoder(),
    auth([
        auth.Basic({validatePassword: authenticate, realm: 'ua3'})
    ]),
    connect.router(app),
    connect.errorHandler({ dumpExceptions: true, showStack: true })
);

server.listen(config.port);
log.info('Connect server listening on port '+config.port);

function authenticate(user, pass, success, failure) {
    log.info('pass is '+pass);
    log.info('getting the key auth:'+user);
    redis.get('auth:'+user, function(err, result) {
        var real_pass = result.toString('utf8');
        log.info('real pass is '+real_pass);
        if (pass == real_pass) {
            log.info('AUTHENTICATED, PROCEEDING');
            success();
        } else {
            failure();
        }
    });
}

function buffer_to_strings(x) {
    for(var i in x) {
        if (typeof x === "buffer") {
            x[i] = x[i].toString('utf8');
        }
    }
    return x;
}

function debuffer_hash(h) {
    for(var i in h) {
        if (typeof h[i] === 'string') {
            h[i] = h[i].toString('utf8');
        }
    }
}

function app(app) {
    app.get('/folders', function(req, res){
        req.authenticate(['basic'], function(err, authx){
            var auth = req.getAuthDetails().user.username;
            log.info('AUTHENTICATED AS '+auth);
            res.writeHead(200, {'Content-Type':'application/json'});
            res.end(JSON.stringify({folders:"flanges"}));
        })
    });
}

