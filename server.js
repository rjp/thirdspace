var sys = require('sys');
var connect = require('./connect/lib/connect/index');
var fs = require('fs');
var redisFactory = require('./redis-node-client/lib/redis-client');
var Log = require('log'), log = new Log(Log.INFO);

// default redis host and port - TODO get this from config?
var redis = redisFactory.createClient();

// nice to have configuration in a distinct place
var config_json = fs.readFileSync(process.argv[2], 'utf8');
var config = JSON.parse(config_json);

// create a bogstandard authenticating connect server
var server = connect.createServer(
    connect.logger({buffer:true})
);

server.use(connect.basicAuth(authenticate, 'ua3'));

function folders(app) {
    app.get('/', function(req, res, next){
        json_folders(req, res, req.remoteUser);
    });
}
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
        if (typeof x[i] === "object" || typeof x[i] === "buffer") {
            x[i] = x[i].toString('utf8');
        }
    }
    return x;
}

// perform asynchronous callbacks for each item in a list and then
// pass the new list off to a final callback
function map(list, each_callback, final_callback) {
    var ilist = new Array;
    var lsize = list.length;
    var mid_callback = function(err, val){
        if (err) final_callback(err, undefined);
        ilist.push(val);
        if (ilist.length == lsize) {
            final_callback(undefined, ilist);
	    }
    };
    for(var i in list) {
        each_callback(list[i], i, mid_callback);
    }
}

function canon_user(username) {
    return username.toLowerCase().replace(/[^a-z0-9]/, '_');
}

// work out unread count for a folder for a user
function get_folder_unread(folder, user_read, callback) {
    var c;
    redis.scard('folder:'+folder, function(e, c){
        if (e) throw(e);
        redis.sdiff('folder:'+folder, user_read, function(e,v){
            if (e) throw(e);
            callback(undefined, {folder:folder, unread:v.length, count: c});
        })
    });
}

function json_folders(req, res, auth) {
    var c_user = 'user:' + canon_user(auth);
    var k_subs = c_user + ':subs';
    var k_read = c_user + ':read';
    redis.smembers(k_subs, function(err, subs) {
        var r = [];
        if(err) { throw(err); } // TODO fix this up
        buffer_to_strings(subs); 
        map(subs, function(f, i, c) {
                get_folder_unread(f, k_read, c);
            }, function(e, newlist) {
                res.writeHead(200, {'Content-Type':'application/json'});
                res.end(JSON.stringify(newlist));
            }
        );
    });
}

function json_folder(req, res, err, auth) {
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
            // callback handles headers and content
            after_auth(req, res, err, auth);
        })
    };
}

// finally, our actual routing table
function pending(app) {
    app.get('/folder/:name', makeHandler('folder/name', json_folder));
    app.get('/folder/:name/:extra', makeHandler('folder/name', json_folder));
}

server.use('/folders', connect.router(folders));

server.listen(config.port);
log.info('Connect server listening on port '+config.port);

