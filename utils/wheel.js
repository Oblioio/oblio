import { wheelEvent } from '../polyfills/wheelEvent.js';
import { events } from '../utils/pubsub.js';
import { clock } from '../utils/MasterClock.js';

var masterclock = clock.getInstance();

var prototype =  {
    start: function () {
        this.updateID = masterclock.registerCallback(update.bind(this));
        masterclock.play();
    },
    stop: function () {
        masterclock.unregisterCallback(this.updateID);
    },
    events: Object.create(events.getInstance()),
    destroy: function () {
        this.stop();
        this.removeWheelEvent();
        delete this.events;
    }
}

var properties = {
    delta: 1,
    deltas: [null, null, null, null, null, null, null, null, null],
    lastPeak: 0,
    center: null,
    x: 0
}

function hasPeak () {
    if (this.deltas[0] == null) return false;

    let flat = this.deltas.map(function (delta) {
        return Math.abs(delta);
    });

    if (
        Math.abs(this.x - this.lastPeak) > 10 &&
        flat[0] <  flat[4] &&
        flat[1] <= flat[4] &&
        flat[2] <= flat[4] &&
        flat[3] <= flat[4] &&
        flat[5] <= flat[4] &&
        flat[6] <= flat[4] &&
        flat[7] <= flat[4] &&
        flat[8] <  flat[4]
    ) {
        this.lastPeak = this.x;
        return true;
    }
    return false;
}

function update () {

    if (this.lastDelta === this.delta || this.delta === 0) {
        this.delta = 
        this.lastDelta = 0;
        return;
    }

    if (hasPeak.call(this)) {
        this.events.publish('peak', {});
    }

    this.deltas.shift();
    this.deltas.push(this.delta);

    this.lastDelta = this.delta;

    this.x++;
}

// console.time('wheel');
function onMouseWheel (e) {
    this.delta = e.deltaY;
}

export var wheel = {
    create: function (element) {
        var instance = Object.assign(Object.create(prototype), properties);

        instance.removeWheelEvent = wheelEvent.addWheelListener(element, onMouseWheel.bind(instance), {passive: true});

        return instance;
    }
}