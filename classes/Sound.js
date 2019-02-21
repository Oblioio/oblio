import { Howler } from 'howler/dist/howler.js';
import { events } from 'OblioUtils/utils/pubsub.js';

'use strict';

var instance,
    sounds,
    btn;

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

function init () {
    sounds = {};

    return Object.create(prototype);
}

function play (soundID, volume, loop) {
    var sound = sounds[soundID],
        id;

    if (typeof loop === 'undefined') {
        loop = false;
    }

    /*
     * Sound has not been played/added */
    if (typeof sound === 'undefined') {
        sound = this.addSound(soundID, {
            src: [soundID],
            loop: loop
        });
    } 
    /*
     * Sound is a sprite */
    else if (typeof sound === 'string') {
        sound = sounds[sound];

        id = sound.play(soundID);

        if (typeof volume !== 'undefined') {
            sound.volume(volume, id);
            sound.prev_volume = volume;
        }

        sound.loop(loop, id);

        // return id for controlling volume of individual sprite
        return {
            sound: sound,
            id: id
        };
    }
    /*
     * Sound is a single file that has already been played */
    else {
        id = sound.play();

        if (typeof volume !== 'undefined') {
            // sound.volume(volume);
            sound.prev_volume = volume;
            sound.volume(volume);
            sound.loop(loop);
        } else {
            fadeInAll();
        }

        return {
            sound: sound,
            id: id
        };
    }
}

function pause (soundID) {
    var sound = sounds[soundID];
    console.log('sOUND =', sound);
    if (sound) {
        if (typeof sound === 'string') {
            sound = sounds[sound];
        } else {
            sound.pause();
        }
    }
}

function pauseAll () {

}

function fadeInAll () {
    TweenLite.to({volume:0}, 0.5, {volume: 1, onUpdateParams: ['{self}'], onUpdate: function (tween) {
        Howler.volume(tween.target.volume);
    }});
}

function fadeOutAll () {
    TweenLite.to({volume:1}, 0.5, {volume: 0, onUpdateParams: ['{self}'], onUpdate: function (tween) {
        Howler.volume(tween.target.volume);
    }});
}

function stop (soundID) {
    var sound = sounds[soundID];
    if (sound) sound.stop();
}

function mute (soundID) {
    var sound = sounds[soundID];

    if (typeof sound === 'string') {
        sound = sounds[sound];
    }

    sound.mute();
}

function unmute (soundID) {
    var sound = sounds[soundID];
    if (sound) sound.unmute();
}

function muteAll () {
    Howler.volume(0);
    this.events.publish('mute', {});
}

function unmuteAll () {
    fadeInAll.apply(this);
    this.events.publish('unmute', {});
}

function volume (soundID, targetVolume) {

}


function addSprite (spriteId, params) {
    var sprite = params.sprite;

    var audioSprite = this.addSound(spriteId, params);

    // add each named sound in the sprite to sounds and point them to sounds[sprite_path]
    for (var sound_name in sprite) {
        sounds[sound_name] = spriteId;
    }
}

function addSound (soundID, options) {
    console.log(options);
    var sound = new Howl(options);

    // add sprite file to sounds
    sounds[soundID] = sound;

    return sound;
}

// function events () {
//     console.log(this, arguments);
// }

function on (event, soundID, callbackFn) {

    var sound = sounds[soundID];

    if (typeof sound === 'undefined') {
        sound = this.addSound(soundID, {
            src: soundID
        });
    } else if (typeof sound === 'string') {
        sound = sounds[sound];
    }

    sound.on(event, callbackFn);
}

function off (event, soundID, callbackFn) {

}

// function initSoundButton (id) {
//     id = id || 'soundBars';
//     btn = document.getElementById(id);
//     if (!btn) return;

//     btn.className = btn.className.replace(' off', '') + ' on';
//     btn.addEventListener('click', toggleSound.bind(this), false);
//     btn.addEventListener('touchstart', toggleSound.bind(this) , supportsPassive ? { passive: true } : false);

//     // Set the name of the hidden property and the change event for visibility
//     var hidden, visibilityChange; 
//     if (typeof document.hidden !== 'undefined') { // Opera 12.10 and Firefox 18 and later support 
//         hidden = 'hidden';
//         visibilityChange = 'visibilitychange';
//     } else if (typeof document.mozHidden !== 'undefined') {
//         hidden = 'mozHidden';
//         visibilityChange = 'mozvisibilitychange';
//     } else if (typeof document.msHidden !== 'undefined') {
//         hidden = 'msHidden';
//         visibilityChange = 'msvisibilitychange';
//     } else if (typeof document.webkitHidden !== 'undefined') {
//         hidden = 'webkitHidden';
//         visibilityChange = 'webkitvisibilitychange';
//     }

//     document.addEventListener(visibilityChange, function (e) {
//         if (e.target.hidden === true) {
//             muteAll.apply(this);
//         } else if (e.target.hidden === false) {
//             unmuteAll.apply(this);
//         } else {
//             console.log('unknown page visibility status');
//         }
//     }.bind(this), false);
// }

// function toggleSound (e) {
//     e.preventDefault();
//     if (btn.className.match('on')) {
//         btn.className = btn.className.replace(' on', '') + ' off';
//         fadeOutAll.apply(this);
//     } else {
//         btn.className = btn.className.replace(' off', '') + ' on';
//         fadeInAll.apply(this);
//     }
// }

function addButton (btn) {
    console.log('SOUND ADD BUTTON!!');
    btn.events.subscribe('mute', muteAll.bind(this));
    btn.events.subscribe('unmute', unmuteAll.bind(this));
}

var prototype = {
    on: on,
    off: off,
    addSound: addSound,
    addSprite: addSprite,
    play: play,
    pause: pause,
    stop: stop,
    mute: mute,
    unmute: unmute,
    muteAll: muteAll,
    unmuteAll: unmuteAll,
    fadeInAll: fadeInAll,
    fadeOutAll: fadeOutAll,
    pauseAll: pauseAll,
    volume: volume,
    addButton: addButton,
    // initSoundButton: initSoundButton,
    getSounds: () => sounds,
    events: Object.create(events.getInstance())
};

export var Sound = {
    getInstance: function () {
        instance = instance || init();
        return instance;
    }
};