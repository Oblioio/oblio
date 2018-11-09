import { Sound } from 'OblioUtils/classes/Sound';
import { events } from 'OblioUtils/utils/pubsub.js';

'use strict';

var sound = Sound.getInstance();

// Test via a getter in the options object to see if the passive property is accessed
var supportsPassive = false;
try {
  var opts = Object.defineProperty({}, 'passive', {
    get: function() {
      supportsPassive = true;
    }
  });
  window.addEventListener("test", null, opts);
} catch (e) {}

var prototype = {
    init: function (el, callback) {
        this.btn = el;

        if (!this.btn) return;

        this.btn.className = this.btn.className.replace(' off', '') + ' on';
        this.btn.addEventListener('click', this.toggleSound.bind(this), false);
        this.btn.addEventListener('touchstart', this.toggleSound.bind(this) , supportsPassive ? { passive: true } : false);

        sound.events.subscribe('unmute', this.on.bind(this));
        sound.events.subscribe('mute', this.off.bind(this));

        sound.addButton(this);

        // // Set the name of the hidden property and the change event for visibility
        // var hidden, visibilityChange; 
        // if (typeof document.hidden !== 'undefined') { // Opera 12.10 and Firefox 18 and later support 
        //     hidden = 'hidden';
        //     visibilityChange = 'visibilitychange';
        // } else if (typeof document.mozHidden !== 'undefined') {
        //     hidden = 'mozHidden';
        //     visibilityChange = 'mozvisibilitychange';
        // } else if (typeof document.msHidden !== 'undefined') {
        //     hidden = 'msHidden';
        //     visibilityChange = 'msvisibilitychange';
        // } else if (typeof document.webkitHidden !== 'undefined') {
        //     hidden = 'webkitHidden';
        //     visibilityChange = 'webkitvisibilitychange';
        // }

        // document.addEventListener(visibilityChange, function (e) {
        //     if (e.target.hidden === true) {
        //         muteAll.apply(this);
        //     } else if (e.target.hidden === false) {
        //         unmuteAll.apply(this);
        //     } else {
        //         console.log('unknown page visibility status');
        //     }
        // }.bind(this), false);

        if (callback) callback();
    },
    toggleSound: function (e) {
        console.log('TOGGLING SOUND!!', this.btn.classList.contains('on'))
        e.preventDefault();
        if (this.btn.classList.contains('on')) {
            this.off();
            this.events.publish('mute', {});
        } else {
            this.on();
            this.events.publish('unmute', {});
        }
    },
    on: function () {
        this.btn.classList.replace('off', 'on');
    },
    off: function () {
        this.btn.classList.replace('on', 'off');
    },
    events: Object.create(events.getInstance())
};

export var SoundButton = {
    getNew: function () {
        return Object.assign(Object.create(prototype), {
            shown: false
        });
    }
};