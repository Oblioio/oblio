'use strict';

var prototype = {
    init: function (el, callback) {
        this.el = el;
        callback();
    },
    open: function () {
        if (this.isOpen) return;

        var that = this;
        let credits = this.el;

        var mousedownHandler = function (e) {
            that.close();
            window.removeEventListener('mousedown', mousedownHandler);
        }

        window.addEventListener('mousedown', mousedownHandler);

        this.isOpen = true;
        credits.style.zIndex = 9;
        TweenLite.to(credits, 0.5, {y: '0px', ease:Power4.easeInOut});
    },
    close: function () {
        if (!this.isOpen) return;

        let credits = this.el;
        let credits_height = credits.offsetHeight;

        this.isOpen = false;

        TweenLite.to(credits, 0.5, {y: credits_height + 'px', ease:Power4.easeInOut, onComplete: function () {
            credits.style.zIndex = 0;
        }.bind(this)});
    }
}

function clickHandler () {
    return function () {

    }
}

export var CreditsDrawer = {
    getNew: function () {
        return Object.assign(Object.create(prototype), {
            isOpen: false
        });
    }
}