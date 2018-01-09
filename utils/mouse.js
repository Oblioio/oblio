'use strict';

var instance,
    removeListener;

function init () {
    removeListener = addListener(onMouseMove.bind(this));
}

function addListener (mouseHandler) {
    window.addEventListener('mousemove', mouseHandler);

    return function () {
        window.removeEventListener('mousemove', mouseHandler);
    }
}

function onMouseMove (e) {
    this.x = e.pageX;
    this.y = e.pageY;
}

function destroy () {
    if (removeListener) removeListener();
}

var prototype = {
    init: init,
    destroy: destroy
};

export var Mouse = {
    getInstance: function () {
        if (typeof instance === 'undefined') {
            instance = Object.create(prototype);
            instance.init();
        }

        return instance;
    }
}