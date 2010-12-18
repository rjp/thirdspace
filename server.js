var sys = require('sys');
var fs = require('fs');
var connect = require('./connect/lib/connect/index');
var redisFactory = require('./redis-node/lib/redis');
var Log = require('log'), log = new Log(Log.WARNING);

// nice to have configuration in a distinct place
var config;
try {
    var config_json = fs.readFileSync(process.argv[2], 'utf8');
    config = JSON.parse(config_json);
} catch(e) {
    config = {"port":3000,"redisport":6379, "redisdb":2};
}

if (process.env.redisport !== undefined) {
    config.redisport = parseInt(process.env.redisport, 10);
}

var redis = redisFactory.createClient(config.redisport);

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
    var ilist = [];
    var lsize = list.length;
    var mid_callback = function(err, val){
        if (err) { final_callback(err, undefined); }
        ilist.push(val);
        if (ilist.length == lsize) {
            final_callback(undefined, ilist);
	    }
    };
    for(var i in list) {
        if (list.hasOwnProperty(i)) {
            each_callback(list[i], i, mid_callback);
        }
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

function k_message(id) {
    return 'message:'+parseInt(id, 10);
}

function k_body(id) {
    return 'body:'+parseInt(id, 10);
}

function error(req, res, message, code) {
    var ejson = { error: message };
    if (code === undefined) { code = 500; }
    res.writeHead(code, {'Content-Type':'application/json'});
    res.end(JSON.stringify(ejson));
}

// work out unread count for a folder for a user
function get_folder_unread(folder, user, callback) {
    var c;
    redis.sismember(k_user(user, 'subs'), canon_folder(folder), function(e, s){
        redis.scard(k_folder(folder), function(e, c){
            if (e) { throw(e); }
            redis.sdiff(k_folder(folder), k_user(user, 'read'), function(e,v){
                if (e) { throw(e); }
                callback(undefined, 
                    {folder:folder, unread:v.length, count: c, sub: s});
            });
        });
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
                get_folder_unread(f, auth, c);
            }, function(e, newlist) {
                res.writeHead(200, {'Content-Type':'application/json'});
                res.end(JSON.stringify(newlist));
            }
        );
    });
}

function subscribe_folder(req, res, auth) {
    var folder = req.params.name;
    redis.exists(k_folder(folder), function(e, v){
        if(!v) {
            error(req, res, "No such folder:"+folder, 404);
            return;
        }
        var k_subs = k_user(auth, 'subs');
        redis.sadd(k_subs, canon_folder(folder), function(e, v){
            if (e) { error(req, res, "Failed to subscribe:"+folder, 500); }
            res.writeHead(200, {'Content-Type':'application/json'});
            res.end(JSON.stringify({"folder":folder}));
        });
    });
}

// there's a lot of "check if this folder exists" duplication
// TODO refactor it out into some kind of guard assertion clause thing
function unsubscribe_folder(req, res, auth) {
    var folder = req.params.name;
    redis.exists(k_folder(folder), function(e, v){
        if(!v) {
            error(req, res, "No such folder:"+folder, 404);
            return;
        }
        var k_subs = k_user(auth, 'subs');
        redis.srem(k_subs, canon_folder(folder), function(e, v){
            if (e) { error(req, res, "Failed to unsubscribe:"+folder, 500); }
            res.writeHead(200, {'Content-Type':'application/json'});
            res.end(JSON.stringify({"folder":folder}));
        });
    });
}

function json_folder(req, res, auth) {
    var folder = req.params.name;
    var k_subs = k_user(auth, 'subs');
    var k_read = k_user(auth, 'read');

    redis.exists(k_folder(folder), function(e, v){
        if(!v) {
            error(req, res, "No such folder:"+folder, 404);
            return;
        }
        get_folder_unread(folder, auth, function(e, f){
            res.writeHead(200, {'Content-Type':'application/json'});
            res.end(JSON.stringify(f));
        });
    });
}

function reply_message(req, res, auth) {
    var id = req.params.id;
    var k_mid = k_message(id);
    if (req.body.body === undefined) {
        error(req, res, 'Must supply a body for a reply', 500);
        return undefined;
    }

    var body = req.body.body;
    var epoch = parseInt(new Date().getTime() / 1000, 10);

    redis.hgetall(k_mid, function(e, v){
        if (e) { error(req, res, "Exception:"+e, 500); }
        sys.puts(sys.inspect(v));
        var h_message = { from:auth };
        h_message.subject = req.body.subject || v.subject;
        h_message.folder = req.body.folder || v.folder;
        h_message.thread = v.thread; // same thread ID

        // avoid an undefined To: being stored in the hash
        if (v.to) { h_message.to = v.to; }
        if (req.body.to) { h_message.to = req.body.to; }

	    redis.incr('c_message', function(e, message_id) {
	        if(e) { error(req, res, "could not get message id", 500); }
	        log.info("new message id is "+message_id);
	        h_message.id = message_id;
            redis.hmset('message:'+message_id, h_message, function(e,v){
                if(e) { error(req, res, "could not store message", 500); }
                log.info("new message stored "+message_id);

                redis.set('body:'+message_id, body, function(e, v){
                    if(e) { error(req, res, "could not store body", 500); }
                    var retval = {
                        id: message_id, thread: h_message.thread,
                        folder: h_message.folder, epoch: epoch
                    };
                    log.info("new body stored "+message_id);
                    res.writeHead(200, {'Content-Type':'application/json'});
                    res.end(JSON.stringify(retval));
                });
            });
        });
    });
}

function json_message(req, res, auth) {
    var id = req.params.id;
    var k_mid = k_message(id);
    var k_bid = k_body(id);

    redis.hgetall(k_mid, function(e, v){
        if (e) { error(req, res, "Exception:"+e, 500); }
        redis.get(k_bid, function(e, b) {
            if (e) { error(req, res, "Exception:"+e, 500); }
            if (v.id === undefined || v.id !== id) {
                error(req, res, "No such message:"+id, 404);
            }
            v.body = b;
            res.writeHead(200, {'Content-Type':'application/json'});
            res.end(JSON.stringify(v));
        });
    });
}

function post_folder(req, res, auth) {
    var folder = canon_folder(req.params.name);
    var body = req.body.body;
    var subject = req.body.subject;
    var to = req.body.to;
    var epoch = parseInt(new Date().getTime() / 1000, 10);

    var h_message = {
        from: canon_user(auth), subject: subject,
        epoch: epoch, folder: folder
    };
    if (to !== undefined) {
        h_message.to = canon_user(to);
    }
    // this should all be in a transaction, I guess
    redis.incr('c_message', function(e, message_id) {
        if(e) { error(req, res, "could not get message id", 500); }
        log.info("new message id is "+message_id);
        h_message.id = message_id;
        redis.incr('c_thread', function(e, thread_id) {
            if(e) { error(req, res, "could not get thread id", 500); }
            log.info("new thread id is "+message_id);
            h_message.thread = thread_id;
            redis.hmset('message:'+message_id, h_message, function(e,v){
                if(e) { error(req, res, "could not store message", 500); }
                log.info("new message stored "+message_id);
                redis.set('body:'+message_id, body, function(e, v){
                    var retval = {
                        id: message_id, thread: thread_id,
                        folder: folder, epoch: epoch
                    };
                    if(e) { error(req, res, "could not store body", 500); }
                    log.info("new body stored "+message_id);
                    res.writeHead(200, {'Content-Type':'application/json'});
                    res.end(JSON.stringify(retval));
                });
            });
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
    // GET
    app.get('/:name', function(req, res, next){
        json_folder(req, res, req.remoteUser);
    });
    app.get('/:name/:extra', function(req, res, next){
        json_folder(req, res, req.remoteUser);
    });
    // POST
    app.post('/private/subscribe', function(req, res, next) {
        error(req, res, "cannot resubscribe to private", 500);
    });
    app.post('/:name/subscribe', function(req, res, next){
        subscribe_folder(req, res, req.remoteUser);
    });
    app.post('/private/unsubscribe', function(req, res, next) {
        error(req, res, "cannot unsubscribe from private", 500);
    });
    app.post('/:name/unsubscribe', function(req, res, next){
        unsubscribe_folder(req, res, req.remoteUser);
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

function message(app) {
    // GET
    app.get('/:id', function(req, res, next) {
        json_message(req, res, req.remoteUser);
    });
    // POST
    app.post('/:id', function(req, res, next) {
        reply_message(req, res, req.remoteUser);
    });
}

// create a bogstandard authenticating connect server
var server = connect.createServer( connect.logger({buffer:true}), connect.bodyDecoder() );
server.use(connect.basicAuth(authenticate, 'ua3'));

exports.startup = function() {
	server.use('/folders', connect.router(folders));
	server.use('/folder/private', connect.router(folder_private));
	server.use('/folder', connect.router(folder));
    server.use('/message', connect.router(message));
	
    redis.select(config.redisdb,function(){});
	server.listen(config.port);
	log.info('Connect server listening on port '+config.port);
};

