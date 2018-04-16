import {play_pause_control} from './control_components/play_pause';
import {progress_control} from './control_components/progress';
import {volume_control} from './control_components/volume';
import {mute_control} from './control_components/mute';
import {fullscreen_control} from './control_components/fullscreen';
import {events} from 'OblioUtils/utils/pubsub.js';

var availableControls = {
    play_pause: play_pause_control,
    progress: progress_control,
    volume: volume_control,
    mute: mute_control,
    fullscreen: fullscreen_control
};

const findAncestor = (el, className) => {
    while (!el.classList.contains(className) && (el = el.parentElement));
    return el;
}

var prototype = {
    resize: function () {
        this.resizables.map(resizable => resizable.resize());
    },
    mute: function (saveVolume) {

        // if saveVolume, save the volume in the mute control to return to when unmuting
        if (saveVolume && this.components.mute) {
            this.components.mute.setVolume(Math.max(0.25, this.components.volume.getVolume()));
            return;
        }

        this.updateVolume(0);
    },
    unmute: function () {
        var volume = this.components.mute ? this.components.mute.getVolume() : 1;

        this.updateVolume(volume);
    },
    resume: function () {
        console.log('RESUME', this.player.paused());
        // console.log(this.player.paused());
        if (this.player.paused()) {
            this.components.play_pause.pause();
        } else {
            this.player.play();
            this.components.play_pause.play();
        }
    },
    updateTime: function (p) {
        this.player.setCurrentTime(p);
    },
    updateVolume: function (v) {
        this.player.setVolume(v);
        if (this.components.mute) {
            this.components.mute.setState(v);
        }
    }
}

function fullscreen () {
    this.player.fullscreen();
}

function callPlayerFunctions (functions) {
    functions.map(function (f_obj) {
        // if the control returns a function obj, 
        // check if function exists in controls, 
        // else check to see if func exists in player
        if (this[f_obj.fname]) {
            this[f_obj.fname].apply(this, f_obj.args);
        } else if (this.player[f_obj.fname]) {
            this.player[f_obj.fname].apply(this.player, f_obj.args);
        } else {
            console.log('Not a function', f_obj);
        }
    }.bind(this));
}

function addListeners () {

    var clickables = this.controls.filter(control => control.click !== undefined),
        clickHandler = (clickables => e => {

            var clicked = findAncestor(e.target, 'video-control');

            if (!clicked) return;

            e.preventDefault();

            var name = clicked.getAttribute('data-name');
            var clickedControl = clickables.reduce((acc, control) => acc && name === acc.getName() ? acc : control && name === control.getName() ? control : false, false);

            if (!clickedControl) return;

            var clickFn = clickedControl.click(e);

            if (!clickFn) return;

            callPlayerFunctions.call(this, clickFn);

        })(clickables);

    var mousemoveables = this.controls.filter(control => control.mousemove !== undefined),
        mouseMoveHandler = (mousemoveables => e => {
            mousemoveables.map(control => control.mousemove(e)).map(mousemoveFn => {
                if (mousemoveFn) {
                    callPlayerFunctions.call(this, mousemoveFn);
                }
            });
        })(mousemoveables);

    var mouseupables = this.controls.filter(control => control.mouseup !== undefined),
        mouseUpHandler = (mouseupables => e => {
            mouseupables.map(control => control.mouseup(e)).map(mouseupFn => {
                if (mouseupFn) {
                    callPlayerFunctions.call(this, mouseupFn);
                }
            });

            if (this.player.hideCover) this.player.hideCover();

            window.removeEventListener('mouseup', mouseUpHandler);
            window.removeEventListener('mousemove', mouseMoveHandler);
        })(mouseupables);

    var mousedownables = this.controls.filter(control => control.mousedown !== undefined),
        mouseDownHandler = ((mousedownables, upHandler, moveHandler) => e => {

            var mousedowned = findAncestor(e.target, 'video-control');

            if (!mousedowned) return;

            var name = mousedowned.getAttribute('data-name');
            var mousedownControl = mousedownables.reduce((acc, control) => acc && name === acc.getName() ? acc : control && name === control.getName() ? control : false, false);

            if (!mousedownControl) return;

            var mousedownFn = mousedownControl.mousedown(e);

            if (!mousedownFn) return;

            e.preventDefault();

            if (this.player.hideCover) this.player.showCover();

            window.addEventListener('mousemove', moveHandler);
            window.addEventListener('mouseup', upHandler);

            callPlayerFunctions.call(this, mousedownFn);

        })(mousedownables, mouseUpHandler, mouseMoveHandler);


    this.elements.el.parentElement.addEventListener('mouseenter', show.bind(this));
    this.elements.el.parentElement.addEventListener('mouseleave', hide.bind(this));

    this.elements.el.parentElement.addEventListener('click', clickHandler);
    this.elements.el.addEventListener('mousedown', mouseDownHandler);
    
    this.player.events.subscribe('play', function (e) {
        this.components.play_pause.play();
    }.bind(this));

    this.player.events.subscribe('pause', function (e) {
        if (!this.components.progress.scrubbing) {
            this.components.play_pause.pause();
            this.events.publish('pause');
        }
    }.bind(this));

    this.player.events.subscribe('timeupdate', function (e) {
        if (!this.components.progress.scrubbing) {
            this.components.progress.setProgress(e.currentTime / e.duration);
        }
    }.bind(this));

    this.player.events.subscribe('durationchange', function (e) {
        this.components.progress.setDuration(e.duration);
        this.resize();
    }.bind(this));

    this.player.events.subscribe('ended', function (e) {
        console.log('ended!');
    }.bind(this));

    this.player.events.subscribe('volumechange', function (e) {
        this.components.volume.setVolume(e.volume);
        this.components.mute.setState(e.volume);
    }.bind(this));

    this.destroy = destroy.call(this, removeListeners.call(this, clickHandler, mouseDownHandler));
}

function show () {
    this.elements.el.style.opacity = 1;
}

function hide () {
    this.elements.el.style.opacity = 0;
}

function removeListeners (clickHandler, mouseDownHandler) {
    return function () {
        this.elements.el.removeEventListener('click', clickHandler);
        this.elements.el.removeEventListener('mousedown', mouseDownHandler);
    }.bind(this);
}

function init (options) {

    this.elements = {
        el: this.wrapper
    }

    this.resizables = [];

    this.controls = options.map(function (control) {
        return this.components[control] = ((control) => availableControls[control].create(this.elements.el, this.player))(control);
    }.bind(this));

    this.resizables = this.controls.filter(control => control.resize !== undefined);

    addListeners.call(this);

    window.requestAnimationFrame(function () {
        this.resize();
    }.bind(this));
}

function destroy (removeListeners) {
    return function () {
        removeListeners.call(this);
    }.bind(this);
}

export var controls = {
    create: function (player, wrapper, options) {
        var instance = Object.assign(Object.create(prototype), {
            player: player,
            wrapper: wrapper,
            components: {},
            events: Object.create(events.getInstance())
        });

        player.cover.classList.add('playpause', 'video-control');
        player.cover.setAttribute('data-name', 'playpause');
        init.call(instance, options);

        return instance;
    }
}