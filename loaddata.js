var testdata = require('./testdata.js');
var redisFactory = require('./redis-node/lib/redis');
var sys = require('sys');
var map = require('./map');
var fs = require('fs');

var extra_data = testdata.json;

var redis = redisFactory.createClient(9736, 'localhost');

// we only care about errors
function null_cb(e, v) {
    if (e) { throw(e); }
}

var folders = {};
var last_mid = -1;
var last_tid = -1;

function cb_message(message, key, next) {
    var body = message.body;
    delete message.body; // this lives elsewhere
    redis.set('body:'+message.id, body, function(e,v) {
        redis.hmset('message:'+message.id, message, function(e,v) {
           redis.sadd('folder:'+message.folder, message.id, next);
        });
    });
}

function load_data() { // actually load the data
    var folders = {};
    var messages = [];
    for(var i in extra_data.preload) {
        if (extra_data.preload.hasOwnProperty(i)) {
            var m = extra_data.preload[i];
            if (folders[m.folder] === undefined) {
                folders[m.folder] = [];
            }
            folders[m.folder][m.id] = m.id;
            if (m.id > last_mid) { last_mid = m.id; }
            if (m.thread > last_tid) { last_tid = m.thread; }
            messages.push(extra_data.preload[i]);
        }
    }
    map.map(messages, cb_message, finished);

    var user_subs = {};
	for(var i in extra_data.subs) {
	    if (extra_data.subs.hasOwnProperty(i)) {
            if (user_subs[i] === undefined) { user_subs[i] = {}; }
	        var l = extra_data.subs[i];
	        for (var j in l) {
	            if (l.hasOwnProperty(j)) {
	                redis.sadd('user:'+i+':subs', l[j], null_cb);
	            }
	        }
	    }
	}

	for(var i in extra_data.read) {
	    if (extra_data.read.hasOwnProperty(i)) {
	        var l = extra_data.read[i];
	        for (var j in l) {
	            if (l.hasOwnProperty(j)) {
	                redis.sadd('user:'+i+':read', l[j], null_cb);
                    delete user_subs[i][l[j]];
	            }
	        }
	    }
	}

    // load authentication data
    for(var i in extra_data.auth) {
        if (extra_data.auth.hasOwnProperty(i)) {
            redis.set('auth:'+i, extra_data.auth[i], null_cb);
        }
    }

    redis.set('c_message', last_mid, null_cb);
    redis.set('c_thread', last_tid, null_cb);
}

function finished(e, v) {
    process.exit(0);
}

// only proceed if we select db 2 and flush it
redis.select(2, function(){
    redis.flushdb(function(){
        load_data();
    });
});
