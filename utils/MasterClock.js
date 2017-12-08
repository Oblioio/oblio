import { uniqueId } from './uniqueId.js';

'use strict';

// singleton
var instance = null;

var MasterClock = function () {
    if (instance !== null) {
        throw new Error("Cannot instantiate more than one MasterClock");
    } else {
        initialize.call(this);
    }
};

function getInstance () {
    return instance || new MasterClock();
}

function initialize () {

    instance = this;

    this._started = Date.now();

    this._timeScale = 1.0;
    
    this.time = this._started;
    
    this._desiredFps = 60;

    this._desiredFrameDurationMS = 1000 / this._desiredFps;

    this._updates = {};

    this.eventObj = {};

    update.call(this);
}


function play () {
    this.playing = true;
}


function pause () {
    this.playing = false;
}


function timeScale (rate) {

    if (rate) {
        this._timeScale = rate;
    }

    return this._timeScale;
}


function registerCallback (callback) {
    let id = uniqueId();
    this._updates[id] = callback;

    return id;
}


function unregisterCallback (id) {
    if (this._updates[id]) {
        delete this._updates[id];
    } else {
        throw new Error("Cannot get location of given callback ID.");
    }
}

var last = Date.now();
function update () {

    window.requestAnimationFrame(update.bind(this));

    this.lastTime = this.time;

    this.time = Date.now();

    this.elapsedMS = this.time - this.lastTime;

    this.now = this.time;

    if (this.playing) {
        this.eventObj.now = this.now;
        this.eventObj.elapsed = this.elapsedMS;

        let keys = Object.keys(this._updates);

        for (var i = keys.length - 1; i >= 0; i--) {
            if (typeof this._updates[keys[i]] !== 'function') {
                console.warn(this._updates[keys[i]]);
                continue;
            }
            this._updates[keys[i]](this.eventObj, keys[i]);
        }
    }
}

MasterClock.prototype.initialize = initialize;
MasterClock.prototype.pause = pause;
MasterClock.prototype.play = play;
MasterClock.prototype.timeScale = timeScale;
MasterClock.prototype.registerCallback = registerCallback;
MasterClock.prototype.unregisterCallback = unregisterCallback;

export var clock = {
    getInstance: getInstance
}