var sys = require('sys');

exports.allfolders = JSON.parse('[{"folder":"chat","unread":3,"count":5,"sub":1},{"folder":"mine","unread":1,"count":2, "sub":1},{"folder":"test","unread":3,"count":3,"sub":0}]');
exports.h_allfolders = [];
exports.l_myfolders = [];
exports.h_myfolders = {};
for(var i in exports.allfolders) {
    var f = exports.allfolders[i];
    exports.h_allfolders[f.folder] = f;
    // subscribed to everything but test
    if (f.folder !== 'test') {
        exports.l_myfolders.push(f);
        exports.h_myfolders[f.folder] = f;
    }
}

var test_messages = {
    "m_one": {
        "folder":"chat", "id":1, "epoch":1289914759,
        "from":"rjp", "subject":"UA3", "threadId":1,
        "body":"UA3 is alive! Let there be rejoicing!"
    },
    "m_two": {
        "folder":"chat", "id":2, "epoch":1289914769,
        "from":"techno", "to":"rjp", "subject":"UA3",
        "body":"Bring on the dancing horses!", "threadId":1,
    },
    "m_three": {
        "folder":"test", "id":3, "epoch":1289914759,
        "from":"otama", "subject":"The taste of Dolphins",
        "body":"Apparently they taste like fish.", "threadId":2
    },
    "m_four": {
        "folder":"chat", "id":4, "epoch":1289914759,
        "from":"parm", "subject":"FIRST!",
        "body":"", "threadId":3
    }
};
exports.messages = test_messages;

// we leave out epoch and ignore it in the tests
var test_replies = {
    "r_one": {
        "folder":"chat", "id":11, "to":"rjp",
        "from":"rjp", "subject":"UA3", "threadId":1,
        "body":"Testings"
    }
};
exports.replies = test_replies;
