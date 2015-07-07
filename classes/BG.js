define([], function () {

    'use strict';

    var BG = function (el, onReady) {
        this.el = el;
        this.onReady = onReady;
    };

    BG.prototype.place = function (wrapper) {
        wrapper.appendChild(this.el);

        return this.el;
    };

    BG.prototype.destroy = function () {
        for (var prop in this) {
            if (this.hasOwnProperty(prop)) {
                this[prop] = null;
            }
        }
    };

    return BG;
});