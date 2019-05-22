'use strict';

var prototype = {
    init: function (el, callback) {
        this.el = el;
        this.firstClick = true;
        this.touch = false;

        var touchlistener = function () {
            this.touch = true;
            window.removeEventListener('touchstart', touchlistener);
        }.bind(this);
        window.addEventListener('touchstart', touchlistener);

        this.isOpen = true;
        this.close(true);

        callback();
    },
    open: function () {
        if (this.isOpen) return;

        var that = this;
        let credits = this.el;

        this.isOpen = true;
        credits.style.zIndex = 9;

        TweenLite.to(credits, 0.5, {y: '0px', ease:Power4.easeInOut});
    
        var clickHandler = function (e) {

            that.close();
            
            if (that.touch) {
                window.removeEventListener('touchstart', clickHandler);
            } else {
                window.removeEventListener('mousedown', clickHandler);
                window.removeEventListener('touchstart', clickHandler);
            }

            return true;
        };

        // wrapping this in an event listener because it seems that the touchstart is registered immediately and just closes the drawer right away
        window.requestAnimationFrame(function () {
            if (this.touch) {
                window.addEventListener('touchstart', clickHandler);
            } else {
                window.addEventListener('mousedown', clickHandler);
                window.addEventListener('touchstart', clickHandler);
            }
        }.bind(this));

    },
    close: function (instant) {
        if (!this.isOpen) return;

        let credits = this.el;
        let credits_height = credits.offsetHeight;

        this.isOpen = false;

        let duration = instant ? 0 : 0.5;
        TweenLite.to(credits, duration, {y: credits_height + 'px', ease:Power4.easeInOut, onComplete: function () {
            credits.style.zIndex = 0;
        }.bind(this)});
    }
};

export var CreditsDrawer = {
    getNew: function () {
        return Object.assign(Object.create(prototype), {
            isOpen: false
        });
    }
}