import { events } from '../utils/pubsub.js';
// import { clock } from '../utils/MasterClock.js';

// var masterclock = clock.getInstance();

var prototype =  {
    start: function () {
        // this.updateID = masterclock.registerCallback(update.bind(this));
        // masterclock.play();
    },
    stop: function () {
        // masterclock.unregisterCallback(this.updateID);
    },
    events: Object.create(events.getInstance()),
    destroy: function () {
        this.stop();
        this.removeTouchEvents();
        delete this.events;
    },
    newTouch: true,
    getPosition: function () {
        this.newTouch = false;

        return {
            startX: this.startX, 
            startY: this.startY, 
            touchX: this.touchX, 
            touchY: this.touchY
        };
    }
};

var properties = {
    startX: 0,
    startY: 0,
    touchX: 0,
    touchY: 0,
};

function onTouchStart (e) {
    this.touchX = this.startX = e.touches[0].pageX;
    this.touchY = this.startY = e.touches[0].pageY;
    this.events.publish('start', {});
    this.newTouch = true;
}

function onTouchEnd (e) {
    this.events.publish('end', {});
}

function onTouchMove (e) {
    this.touchX = e.touches[0].pageX;
    this.touchY = e.touches[0].pageY;
}

function addListeners (element) {
    let touchstartFn = onTouchStart.bind(this),
        touchendFn = onTouchEnd.bind(this),
        touchmoveFn = onTouchMove.bind(this);

    element.addEventListener('touchstart', touchstartFn, {passive: true});
    element.addEventListener('touchend', touchendFn, {passive: true});
    element.addEventListener('touchmove', touchmoveFn, {passive: true});

    return removeListeners(element, touchstartFn, touchendFn, touchmoveFn)
}

function removeListeners (element, touchstartFn, touchendFn, touchmoveFn) {
    return function () {
        element.removeEventListener('touchstart', touchstartFn, {passive: true});
        element.removeEventListener('touchend', touchendFn, {passive: true});
        element.removeEventListener('touchmove', touchmoveFn, {passive: true});
    };
}

export var touch = {
    create: function (element) {
        var instance = Object.assign(Object.create(prototype), properties);

        instance.removeTouchEvents = addListeners.call(instance, element);

        return instance;
    }
};