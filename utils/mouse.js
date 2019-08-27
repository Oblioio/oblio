'use strict';

function Mouse () {}

function init (w = window) {
    this.wrapper = w;
    this.removeListener = addListener.call(this, onMouseMove.bind(this));
}

function addListener (mouseHandler) {
    this.wrapper.addEventListener('mousemove', mouseHandler);

    return function () {
        this.wrapper.removeEventListener('mousemove', mouseHandler);
    }
}

function onMouseMove (e) {
    this.x = e.clientX;
    this.y = e.clientY;
}

function destroy () {
    if (this.removeListener) this.removeListener();
}

Mouse.prototype = {
    init: init,
    destroy: destroy
};

export { Mouse }