var sys = require('sys');
var fs = require('fs');
var connect = require('./connect/lib/connect/index');
var redisFactory = require('./redis-node-client/lib/redis-client');
var Log = require('log'), log = new Log(Log.INFO);

// default redis host and port - TODO get this from config?
var redis = redisFactory.createClient();

// nice to have configuration in a distinct place
var config;
try {
    var config_json = fs.readFileSync(process.argv[2], 'utf8');
    config = JSON.parse(config_json);
} catch(e) {
    config = {"port":3000}
}

// create a bogstandard authenticating connect server
var server = connect.createServer(
    connect.logger({buffer:true})
);

server.use(connect.basicAuth(authenticate, 'ua3'));

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
    // shortcut any processing if we've got an empty list
    if (list === undefined || list === null || list.length === 0) {
        final_callback(undefined, []);
        return;
    }
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

function k_user(username, subkey) {
    return 'user:'+canon_user(username)+':'+subkey;
}

function canon_folder(foldername) {
    return foldername.toLowerCase().replace(/[^a-z0-9]/, '_');
}

function k_folder(foldername) {
    return 'folder:'+canon_folder(foldername);
}

function error(req, res, message) {
    var ejson = { error: message };
    res.writeHead(500, {'Content-Type':'application/json'});
    res.end(JSON.stringify(ejson));
}

// work out unread count for a folder for a user
function get_folder_unread(folder, user_read, callback) {
    var c;
    redis.scard(k_folder(folder), function(e, c){
        if (e) throw(e);
        redis.sdiff(k_folder(folder), user_read, function(e,v){
            if (e) throw(e);
            callback(undefined, {folder:folder, unread:v.length, count: c});
        })
    });
}

function json_folders(req, res, auth) {
    var k_subs = k_user(auth, 'subs');
    var k_read = k_user(auth, 'read');
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

function json_folder(req, res, auth) {
    var folder = canon_folder(req.params.name);
    var k_subs = k_user(auth, 'subs');
    var k_read = k_user(auth, 'read');

    redis.exists(k_folder(folder), function(e, v){
        if(v === 0) {
            error(req, res, "No such folder:"+c_folder);
            return;
        }
        get_folder_unread(folder, 0, function(e, f){
            res.writeHead(200, {'Content-Type':'application/json'});
            res.end(JSON.stringify(f));
        });
    });
}

// finally, our actual routing tables

function folder_private(app) {
    app.get('/', function(req, res, next){
        json_private_folder(req, res, req.remoteUser);
    });
    app.get('/:extra', function(req, res, next){
        json_private_folder(req, res, req.remoteUser);
    });
    app.post('/', function(req, res, next){
        post_private(req, res, req.remoteUser);
    });
}
function folder(app) {
    app.get('/:name', function(req, res, next){
        json_folder(req, res, req.remoteUser);
    });
    app.get('/:name/:extra', function(req, res, next){
        json_folder(req, res, req.remoteUser);
    });
    app.post('/:name', function(req, res, next){
        post_folder(req, res, req.remoteUser);
    });
}

function folders(app) {
    app.get('/', function(req, res, next){
        json_folders(req, res, req.remoteUser);
    });
}

exports.startup = function() {
	server.use('/folders', connect.router(folders));
	server.use('/folder/private', connect.router(folder_private));
	server.use('/folder', connect.router(folder));
	
	server.listen(config.port);
	log.info('Connect server listening on port '+config.port);
}
