// UMD (Universal Module Definition) patterns for JavaScript modules that work everywhere.
// https://github.com/umdjs/umd/blob/master/amdWebGlobal.js

;(function (root, factory) {
    // Browser globals
    root.app = root.app || {};

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
                'howler'
            ], function () {
            return (root.app.Sound = factory());
        });
    } else {
        root.app.Sound = factory();
    }
}(window.oblio = window.oblio || {}, function () {

    'use strict';

    var that;

    var Sound = function (sound) {
        console.log('Sound');
        this.sounds = {}
    }

    function play (soundID, volume, loop) {
        var sound = this.sounds[soundID],
            loop = loop || false;

        if (typeof sound === 'undefined') {
            sound = this.addSound(soundID, {
                urls: [soundID],
                loop: loop
            });
        } else if (typeof sound === 'string') {
            sound = this.sounds[sound];
            if (volume) {
                sound.volume(volume);
                sound.prev_volume = volume;
            }
            sound.play(soundID);
            return sound;;
        }

        if (volume) {
            sound.volume(volume);
            sound.prev_volume = volume;
        }

        sound.play();
        return sound;
    }

    function pause (soundID) {
        var sound = this.sounds[soundID];
        sound.pause();
    }

    function pauseAll () {

    }

    function fadeInAll () {
        var sound,
            targetVolume;
        for (var sound_name in this.sounds) {
            if (this.sounds.hasOwnProperty(sound_name)) {
                sound = this.sounds[sound_name];
                if (typeof sound === 'string') {
                    sound = this.sounds[sound];
                }

                targetVolume = sound.prev_volume || 1;
                // sound.volume(1);
                sound.fade(0, targetVolume, 1000, function () {
                    console.log('fade in complete');
                });
            }
        }
    }

    function fadeOutAll () {
        var sound;

        for (var sound_name in this.sounds) {
            if (this.sounds.hasOwnProperty(sound_name)) {
                sound = this.sounds[sound_name];
                if (typeof sound === 'string') {
                    sound = this.sounds[sound];
                }
                // sound.volume(0);
                sound.prev_volume = sound.volume();
                sound.fade(sound.volume(), 0, 1000, function () {
                    console.log('fade out complete');
                });
            }
        }
    }

    function stop (soundID) {
        var sound = this.sounds[soundID];
        sound.stop();
    }

    function mute (soundID) {
        var sound = this.sounds[soundID];

        if (typeof sound === 'string') {
            sound = this.sounds[sound];
        }

        sound.mute();
    }

    function unmute (soundID) {
        var sound = this.sounds[soundID];
        sound.unmute();
    }

    function muteAll () {
        // Howler.mute(); // mute doesn't do anything for some reason
        Howler.volume(0);
    }

    function unmuteAll () {
        // Howler.unmute(); // mute not working
        Howler.volume(1);
    }

    function volume (soundID, targetVolume) {

    }

    function addSprite (params) {
        var sprite_path = params.path,
            sprite = params.sprite;

        if (this.sounds[sprite_path]) {
            console.log(sprite_path + ' already exists.');
            return false;
        }

        this.addSound(sprite_path, {
            urls: [sprite_path],
            sprite: sprite
        });

        // add each named sound in the sprite to sounds and point them to this.sounds[sprite_path]
        for (var sound_name in sprite) {
            if (sprite.hasOwnProperty(sound_name)) {
                this.sounds[sound_name] = sprite_path;
            }
        }
    }

    function addSound (soundID, options) {
        
        var sound = new Howl(options);

        // add sprite file to this.sounds
        this.sounds[soundID] = sound;

        return sound;
    }

    function events () {
        console.log(this, arguments);
    }

    function on (event, soundID, callbackFn) {

        var sound = this.sounds[soundID];

        if (typeof sound === 'undefined') {
            sound = this.addSound(soundID, {
                urls: soundID
            });
        } else if (typeof sound === 'string') {
            sound = this.sounds[sound];
        }

        sound.on(event, callbackFn);
    }

    function off (event, soundID, callbackFn) {

    }

    Sound.prototype.on = on;
    Sound.prototype.off = off;
    Sound.prototype.addSound = addSound;
    Sound.prototype.addSprite = addSprite;
    Sound.prototype.play = play;
    Sound.prototype.pause = pause;
    Sound.prototype.stop = stop;
    Sound.prototype.mute = mute;
    Sound.prototype.unmute = unmute;
    Sound.prototype.muteAll = muteAll;
    Sound.prototype.unmuteAll = unmuteAll;
    Sound.prototype.fadeInAll = fadeInAll;
    Sound.prototype.fadeOutAll = fadeOutAll;
    Sound.prototype.pauseAll = pauseAll;
    Sound.prototype.volume = volume;

    return new Sound();
}));