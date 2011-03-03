var sys = require('sys');
var fs = require('fs');
var connect = require('./connect/lib/connect/index');
var redisFactory = require('./redis-node/lib/redis');
var Log = require('./log.js/'), log = new Log(Log.WARNING);

var config = {"port":3000,"redisport":6379, "redisdb":2};

// nice to have configuration in a distinct place
var new_config;
try {
    var config_json = fs.readFileSync(process.argv[2], 'utf8');
    new_config = JSON.parse(config_json);
} catch(e) {
    new_config = {};
}
for(var i in new_config) {
    config[i] = new_config[i];
}

if (process.env.httpport !== undefined) {
    config.port = parseInt(process.env.httpport, 10);
}

if (process.env.redisport !== undefined) {
    config.redisport = parseInt(process.env.redisport, 10);
}

if (process.env.redisdb !== undefined) {
    config.redisdb = parseInt(process.env.redisdb, 10);
}


sys.puts(sys.inspect(config));

var redis = redisFactory.createClient(config.redisport);

function remove_undef(list) {
    var outlist = [];
    for (var i in list) {
        if (list.hasOwnProperty(i)) {
            if (list[i] != undefined) { outlist.push(list[i]); }
        }
    }
    return outlist;
}

// this should probably be smarter
function authenticate(user, pass, success, failure) {
    log.info('pass is '+pass);
    log.info('getting the key auth:'+user);
    redis.hgetall('userinfo:'+user, function(err, result) {
        if (result === undefined || result === null) {
            failure();
        } else {
            var real_pass = result.pass.toString('utf8');
            log.info('real pass is '+real_pass);
            if (pass == real_pass) {
                log.info('AUTHENTICATED, PROCEEDING');
                success(result);
            } else {
                failure();
            }
        }
    });
}

function zdiffstore_withscores(user, s_one, s_two, just_count, callback) {
    var inter = 'inter:' + user + ':' + s_one + ':zdiff:' + s_two;
    var finish = 'final:' + user + ':' + s_one + ':zdiff:' + s_two;
    var w1 = {}; w1[s_one] = 1; w1[s_two] = -1;
    var w2 = {}; w2[inter] = 1; w2[s_two] = 1;
    redis.zunionstore(inter, w1, 'sum', function(e, s) {
        if (e) { throw(e); }
        redis.zremrangebyscore(inter, 0, '+inf', function(e, s) {
            if (e) { throw(e); }
            redis.zinterstore(finish, w2, 'max', function(e, s) {
                if (e) { throw(e); }
                if (just_count === true) {
                    redis.zcard(finish, callback);
                } else {
                    redis.zrange(finish, 0, -1, callback);
                }
            });
        });
    });
}


function zdiffstore_noscores(user, s_one, s_two, just_count, callback) {
    var inter = 'inter:' + user + ':' + s_one + ':zdiff:' + s_two;
    var finish = 'final:' + user + ':' + s_one + ':zdiff:' + s_two;
    var w1 = {}; w1[s_one] = '-inf'; w1[s_two] = 1;
    var w2 = {}; w2[inter] = 1; w2[s_two] = 1;
    redis.zunionstore(inter, w1, 'sum', function(e, s) {
        if (e) { throw(e); }
        redis.zremrangebyscore(inter, '-inf', 0, function(e, s) {
            if (e) { throw(e); }
            redis.zinterstore(finish, w2, 'max', function(e, s) {
                if (e) { throw(e); }
                if (just_count === true) {
                    redis.zcard(finish, callback);
                } else {
                    redis.zrange(finish, 0, -1, callback);
                }
            });
        });
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
    return username.toLowerCase().replace(/[^-a-z0-9]/, '_');
}

function k_user(username, subkey) {
    return 'user:'+canon_user(username)+':'+subkey;
}

function canon_folder(foldername) {
    return foldername.toLowerCase().replace(/[^-a-z0-9]/, '_');
}

function k_folder(foldername) {
    return 'folder:'+canon_folder(foldername);
}

function k_thread(thread) {
    return 'thread:'+parseInt(thread, 10);
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

function success(req, res, message) {
    res.writeHead(200, {'Content-Type':'application/json'});
    res.end(JSON.stringify(message));
}

// work out unread count for a folder for a user
function get_folder_unread(folder, user, callback) {
    var c;
    var k_fold = k_folder(folder);
    var k_read = k_user(user, 'read');
    var unread_edit = 0;

    redis.sismember(k_user(user, 'subs'), canon_folder(folder), function(e, s){
        redis.zcard(k_fold, function(e, c){
            if (e) { throw(e); }
            var t = 'zcard:'+k_read+':'+k_fold;

            var f = zdiffstore_noscores;
            if (unread_edit) { f = zdiffstore_withscores; }
            f(user, k_read, k_fold, true, function(e,v){
                callback(undefined,
                {folder:folder, unread:v, count: c, subscribed: s?1:0});
            });
        });
    });
}

function json_folder(req, res, auth) {
    var folder = req.params.name;
    var unread_edit = req.params.extra;
    var retval = {};
    var fetcher = get_headers;
    var f_all = false;

    if (unread_edit === 'full') { fetcher = get_full; }
    if (unread_edit && unread_edit.match(/\ball\b/)) { f_all = true; }

    redis.exists(k_folder(folder), function(e, v){
        if(!v) {
            error(req, res, "No such folder:"+folder, 404);
            return;
        }
        var k_subs = k_user(auth, 'subs');
        var k_read = k_user(auth, 'read');
        var k_fold = k_folder(folder);
        redis.sismember(k_subs, canon_folder(folder), function(e, s){
            if (e) { throw(e); }
            retval['subscribed'] = s ? 'true' : 'false';
            var f = zdiffstore_noscores;
            if (unread_edit) { f = zdiffstore_withscores; }

            // f_all signifies we should ignore the read list and return all
//            if (f_all) { f = zunionstore; }
            f(auth, k_read, k_fold, false, function(e,s){
                retval['ids'] = s;
                map(s, function(f,i,c) {
                    fetcher(f, c);
                }, function(e, newlist) {
                    retval['messages'] = newlist;
                    res.writeHead(200, {'Content-Type':'application/json'});
                    res.end(JSON.stringify(newlist));
                });
            });
        });
    });
}

function json_folders(req, res, auth) {
    var k_subs = k_user(auth, 'subs');
    var k_read = k_user(auth, 'read');

    var filter = req.params.extra;
    if (filter === undefined) { filter = ""; }

    /* default filtering is all folders */
    var filters = ["true"];
    var filter_callback = function(a,f,r,c) { c(true, r); };

    /* how to create stackable filters? */
    if (filter.match(/\bsubscribed\b/)) { filters.push("d.sub"); }
    if (filter.match(/\bunread\b/))     { filters.push("d.unread > 0"); }
    if (filter.match(/\ball\b/))        { filters.push("1"); }

    var make_func = "ffilter=function(a,f,d,c){if("+filters.join(' && ')+"){c(true,d);}else{c(false,undefined);}}";
    eval(make_func);

    redis.keys("folder:*", function(err, subs) {
        var r = [];
        if(err) { throw(err); } // TODO fix this up
        buffer_to_strings(subs);
        /* redis returns the full keyname, remove the folder: ourselves */
        for (var i in subs) {
            if (subs.hasOwnProperty(i)) { subs[i] = subs[i].substr(7); }
        }
        map(subs, function(f, i, c) {
                get_folder_unread(f, auth, function(e, r) {
                    ffilter(auth, f, r, function(e, t){
                        if (e == true) { c(undefined, t); }
                        else           { c(undefined, undefined); }
                    });
                });
            }, function(e, newlist) {
                var outlist = remove_undef(newlist);
                outlist.sort(function(a,b){
                    if (a.folder < b.folder) return -1;
                    if (a.folder > b.folder) return 1;
                    return 0;
                });
                res.writeHead(200, {'Content-Type':'application/json'});
                res.end(JSON.stringify(outlist));
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

function json_folderinfo(req, res, auth) {
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

function read_list(req, res, auth, list) {
    map(list, function(f,i,c){
        redis.hget(k_message(f), 'epoch', function(e, v){
            redis.zadd(k_user(auth, 'read'), v, f, c);
        });
    }, function(e, newlist) {
        var outlist = remove_undef(newlist);
        redis.zrangebyscore(k_user(auth,'read'), -1, -1, function(e, v){
            redis.hset('userinfo:'+auth, 'lastread', v, function(){});
            success(req, res, {count:outlist.length});
        });
    });
}

function unread_list(req, res, auth, list) {
    map(list, function(f,i,c){
        redis.zrem(k_user(auth, 'read'), f, c);
    }, function(e, newlist) {
        var outlist = remove_undef(newlist);
        success(req, res, {count:outlist.length});
    });
}

function read_messages(req, res, auth) {
    var messages = req.body;
    read_list(req, res, auth, messages);
}

function read_thread(req, res, auth) {
    var thread = req.body.thread;
    redis.zrange(k_thread(thread), 0, -1, function(e,l){
        read_list(req, res, auth, l);
    });
}

function unread_messages(req, res, auth) {
    var messages = req.body.messages;
    unread_list(req, res, auth, messages);
}

function unread_thread(req, res, auth) {
    var thread = req.body.thread;
    redis.zrange(k_thread(thread), 0, -1, function(e,l){
        unread_list(req, res, auth, l);
    });
}


function get_headers(f, c) {
    redis.hgetall(k_message(f), c);
}

function get_full(f, c) {
    redis.get(k_body(f), function(e, b){
        redis.hgetall(k_message(f), function(e, v){
            if (v === null) {
                c(undefined, undefined);
            } else {
                if (b === null) { b = ''; }
                v.body = b;
                c(undefined, v);
            }
        });
    });
}

function json_thread(req, res, auth) {
    var id = req.params.id;
    var extra = req.params.extra;
    var fetcher = get_headers;
    if (extra === 'full') { fetcher = get_full; }

    redis.zrange(k_thread(id), 0, -1, function(e, v){
        if (e) { throw(e); }
        if (v === null) {
            error(req, res, "no such thread", 404);
        } else {
            map(v, function(f,i,c) {
                fetcher(f, c);
            }, function(e, newlist) {
                var outlist = remove_undef(newlist);
                outlist.sort(function(a,b){
                    return a.id - b.id;
                });
                success(req, res, outlist);
            });
        }
    });
}

function json_message(req, res, auth) {
    var id = req.params.id;
    var k_mid = k_message(id);
    var k_bid = k_body(id);

    redis.hgetall(k_mid, function(e, v){
        if (e) { error(req, res, "Exception:"+e, 500); }
        if (v === null) {
            error(req, res, "Message "+id+" not found", 404);
        } else {
            redis.get(k_bid, function(e, b) {
                if (e) { error(req, res, "Exception:"+e, 500); }
                if (v.id === undefined || v.id !== id) {
                    error(req, res, "No such message:"+id, 404);
                }
                v.body = b;
                redis.zscore(k_user(auth,'read'), id, function(e,s){
                    if (s != undefined && s <= v.epoch) {
                        v.read = true;
                    }
                    redis.sort('parents:'+id, {order:'desc', get:['#','message:*->folder']}, function(e,s){
                        var x = [];
                        while (s.length > 0) {
                           var y = s.splice(0,2);
                           x.push({id:y[0], folder:y[1]});
                        }
                        v.inReplyToHierarchy = x;
                        res.writeHead(200, {'Content-Type':'application/json'});
                        res.end(JSON.stringify(v));
                    });
                });
            });
        }
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
                    if(e) { error(req, res, "could not store body", 500); }
                    redis.zadd(k_folder(folder), h_message.epoch, message_id, function(e,v){
                        if(e) { error(req, res, "could not add folder", 500); }
                        redis.zadd(k_thread(thread_id), h_message.epoch, message_id, function(e, v){
                            if(e) { error(req, res, "could not add thread", 500); }
                            var retval = {
                                id: message_id, thread: thread_id,
                                folder: folder, epoch: epoch
                            };
                            log.info("new body stored "+message_id);
                            res.writeHead(200, {'Content-Type':'application/json'});
                            res.end(JSON.stringify(retval));
                        });
                    });
                });
            });
        });
    });
}

function ar(req, res, code, data) {
    if (code == 200) {
        success(req, res, data);
    } else {
        error(req, res, data, code);
    }
}

function annotate_message(req, res, auth) {
    var id = req.params.id;
    var annotate = req.body.annotate;
    var epoch = parseInt(new Date().getTime() / 1000, 10);

    if (annotate.length == 0) {
        error(req, res, "Annotation is zero length", 500);
        return;
    }

    if (annotate.length > 80) {
        error(req, res, "Annotation is >80 characters", 500);
        return;
    }

    redis.hgetall(k_message(id), function(e,h) {
        if (h.from != auth && h.to != auth) {
            ar(req, res, 401, "Cannot annotate "+id+" by "+auth);
        }
        /* already annotated by from */
        if (h.from == auth) {
            if (h.anno_from != undefined) {
                ar(req, res, 401, "Cannot double-annotate "+id);
            } else {
                redis.hmset(k_message(id), {'epoch':epoch,'anno_from':annotate}, function(e,s){
                    if (e) { throw(e); }
                    redis.zadd(k_folder(h.folder), epoch, id, function(e,s){
                        if (e) { throw(e); }
                        ar(req, res, 200, {"annotated":id,"anno_from":true,"by":auth});
                    });
                });
            }
        }

        /* already annotated by to */
        if (h.to == auth) {
            if (h.anno_to != undefined) {
                ar(req, res, 401, "Cannot double-annotate "+id);
            } else {
                redis.hmset(k_message(id), {'epoch':epoch,'anno_to':annotate}, function(e,s){
                    if (e) { throw(e); }
                    redis.zadd(k_folder(h.folder), epoch, id, function(e,s){
                        if (e) { throw(e); }
                        ar(req, res, 200, {"annotated":id,"anno_to":true,"by":auth});
                    });
                });
            }
        }
    });
}

// finally, our actual routing tables

function folderinfo_private(app) {
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

function folderinfo(app) {
    // GET
    app.get('/:name', function(req, res, next){
        json_folderinfo(req, res, req.remoteUser);
    });
    app.get('/:name/:extra', function(req, res, next){
        json_folderinfo(req, res, req.remoteUser);
    });
}

function folder(app) {
    // POST
    app.post('/private/subscribe', function(req, res, next) {
        error(req, res, "cannot resubscribe to private", 500);
    });
    app.post('/private/unsubscribe', function(req, res, next) {
        error(req, res, "cannot unsubscribe from private", 500);
    });
    app.post('/:name/subscribe', function(req, res, next){
        subscribe_folder(req, res, req.remoteUser);
    });
    app.post('/:name/unsubscribe', function(req, res, next){
        unsubscribe_folder(req, res, req.remoteUser);
    });
    // GET
    app.get('/:name', function(req, res, next){
        json_folder(req, res, req.remoteUser);
    });
    app.get('/:name/:extra', function(req, res, next){
        json_folder(req, res, req.remoteUser);
    });
    // POST
    app.post('/:name', function(req, res, next){
        post_folder(req, res, req.remoteUser);
    });
}

function folders(app) {
    app.get('/', function(req, res, next){
        json_folders(req, res, req.remoteUser);
    });
    app.get('/:extra', function(req, res, next){
        json_folders(req, res, req.remoteUser);
    });
}

function thread(app) {
    // GET
    app.get('/:id/:extra', function(req, res, next) {
        json_thread(req, res, req.remoteUser);
    });
    app.get('/:id', function(req, res, next) {
        json_thread(req, res, req.remoteUser);
    });
    // POST
    app.post('/read', function(req, res, next) {
        read_thread(req, res, req.remoteUser);
    });
    app.post('/unread', function(req, res, next) {
        unread_thread(req, res, req.remoteUser);
    });
}

function message(app) {
    // GET
    app.get('/:id', function(req, res, next) {
        json_message(req, res, req.remoteUser);
    });
    // POST
    app.post('/read', function(req, res, next) {
        read_messages(req, res, req.remoteUser);
    });
    app.post('/unread', function(req, res, next) {
        unread_messages(req, res, req.remoteUser);
    });
    app.post('/:id', function(req, res, next) {
        reply_message(req, res, req.remoteUser);
    });
}

function annotate(app) {
    app.post('/:id', function(req, res, next) {
        annotate_message(req, res, req.remoteUser);
    });
}

// create a bogstandard authenticating connect server
var server = connect.createServer( connect.logger({buffer:true}), connect.bodyDecoder() );
server.use(connect.basicAuth(authenticate, 'ua3'));

exports.startup = function() {
    server.use('/folders', connect.router(folders));
//    server.use('/folder/private', connect.router(folder_private));
    server.use('/folderinfo/private', connect.router(folderinfo_private));
    server.use('/folderinfo', connect.router(folderinfo));
    server.use('/folder', connect.router(folder));
    server.use('/message', connect.router(message));
    server.use('/annotate', connect.router(annotate));
    server.use('/thread', connect.router(thread));

    // TODO should make the next two lines depend on this one
    redis.select(config.redisdb,function(){});
    server.listen(config.port);
    log.info('Connect server listening on port '+config.port);
};

