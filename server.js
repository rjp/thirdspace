var sys = require('sys');
var connect = require('connect');
var auth = require('connect-auth');
var fs = require('fs');
var redisFactory = require('redis-node');
var Log = require('log'), log = new Log(Log.INFO);

// default redis host and port - TODO get this from config?
var redis = redisFactory.createClient();

// nice to have configuration in a distinct place
var config_json = fs.readFileSync(process.argv[2], 'utf8');
var config = JSON.parse(config_json);

// create a bogstandard authenticating connect server
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

// this should probably be smarter
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

// convert a list of buffers into strings, works on hashes too
function buffer_to_strings(x) {
    for(var i in x) {
        // TODO check for hasOwnProperty here
        if (typeof x[i] === "buffer") {
            x[i] = x[i].toString('utf8');
        }
    }
    return x;
}

function json_folders(req, res, err, authx) {
    return '{"folders":"flanges"}';
}

function json_folder(req, res, err, authx) {
    var o = { folder: req.params.name };
    if (req.params.extra) {
        o.extra = req.params.extra;
    }
    return JSON.stringify(o);
}


function makeHandler(name, after_auth) {
    return function(req, res){
        req.authenticate(['basic'], function(err, authx){
            var auth = req.getAuthDetails().user.username;
            log.info('AUTHENTICATED AS '+auth);
            res.writeHead(200, {'Content-Type':'application/json'});
            // dump whatever we get back to the browser
            res.end(after_auth(req, res, err, authx));
        })
    };
}

// finally, our actual routing table
function app(app) {
    app.get('/folders', makeHandler('folders', json_folders));
    app.get('/folder/:name', makeHandler('folder/name', json_folder));
    app.get('/folder/:name/:extra', makeHandler('folder/name', json_folder));
}

