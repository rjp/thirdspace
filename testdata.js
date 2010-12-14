var sys = require('sys');

exports.allfolders = JSON.parse('[{"folder":"chat","unread":3,"count":5,"sub":1},{"folder":"mine","unread":1,"count":2, "sub":1},{"folder":"test","unread":3,"count":3,"sub":0}]');

// subscribed to everything but test
exports.myfolders = {};
for(var i in exports.allfolders) {
    var f = exports.allfolders[i];
    exports.myfolders[f.folder] = f;
}
sys.puts(sys.inspect(exports.allfolders));
sys.puts(sys.inspect(exports.myfolders));
