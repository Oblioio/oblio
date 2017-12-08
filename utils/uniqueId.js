'use strict';

var lookup = {};

function uniqueId() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    var id = s4();
    // make sure it's not a duplicate
    while (lookup[id] === true) {
        id = s4();
    }

    lookup[id] = true;
    return id;
}

export { uniqueId };