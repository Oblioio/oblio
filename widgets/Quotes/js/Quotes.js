'use strict';

var prototype = {
    init: function (params, callback) {
        this.currentQuote = 0;
        this.now = Date.now();
        this.delay = 2000;
        this.nextTime = this.now + this.delay;
        this.quotes = [].slice.call(this.wrapper.getElementsByTagName('blockquote'));
    },
    start: function () {
        this.paused = false;
        loop.call(this);
    },
    stop: function () {
        this.paused = true;
    }
};

function loop () {
    /* jshint validthis:true */

    if (this.paused) return;

    this.now = Date.now();

    if (this.now > this.nextTime) {
        this.nextTime = this.now + this.delay;
        nextQuote.call(this);
    }

    window.requestAnimationFrame(loop.bind(this));
}

function nextQuote () {
    /* jshint validthis:true */

    this.quotes[this.currentQuote].style.visibility = 'hidden';
    this.currentQuote++; 
    this.currentQuote = this.currentQuote % this.quotes.length;
    this.quotes[this.currentQuote].style.visibility = 'visible';
}

export var Quotes = {
    getNew: function (wrapper) {
        return Object.assign(Object.create(prototype), {
            shown: false,
            wrapper: wrapper
        });
    }
};