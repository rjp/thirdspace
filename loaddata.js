var testdata = require('./testdata.js');
var redisFactory = require('./redis-node/lib/redis');
var sys = require('sys');
var map = require('./map');

var redis = redisFactory.createClient(9736, 'localhost');

// we only care about errors
function null_cb(e, v) {
    sys.puts("CALLBACK");
    if (e) throw(e);
}

// only proceed if we select db 2 and flush it
redis.select(2, function(){
//    redis.flushdb(function(){
        var messages = [];
        for(var i in testdata.messages) {
            messages.push(testdata.messages[i]);
        }
        map.map(messages, cb_message, finished);
//  });
});

function cb_message(message, key, next) {
    var body = message.body;
    delete message.body; // this lives elsewhere
    redis.set('body:'+message.id, body, function(e,v) {
        redis.hmset('message:'+message.id, message, function(e,v) {
           redis.sadd('folder:'+message.folder, message.id, next);
        });
    });
}

function finished(e, v) {
    process.exit(0);
}

