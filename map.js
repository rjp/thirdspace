var sys = require('sys');

// perform asynchronous callbacks for each item in a list and then
// pass the new list off to a final callback
exports.map = function(list, each_callback, final_callback) {
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
};
