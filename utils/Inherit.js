oblio = oblio || {};
oblio.utils = oblio.utils || {};

/**
* 'Holy Grail' classical inheritance pattern from Javascript Patterns by Stoyan Stefanov
*/
oblio.utils.inherit = (function () {
    var proxy = function () {};
    return function (child, parent) {
        proxy.prototype = parent.prototype;
        child.prototype = new proxy();
        child.prototype._super = parent;
        child.prototype.constructor = child;
    };
}());
