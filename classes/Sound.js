define([
        'howler',
        'greensock/TweenLite.min',
        'oblio/utils/PageVisibility'
    ], function () {

    'use strict';
    /*jshint validthis:true*/
    var that;

    var Sound = function (sound) {
        console.log('Sound');
        this.sounds = {};
        this.btn = null;
    };

    function play (soundID, volume, loop) {
        var sound = this.sounds[soundID];

        if (volume === undefined) {
            volume = 1;
        }

        if (loop === undefined) {
            loop = false;
        }

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
            return sound;
        }

        if (volume) {
            sound.volume(volume);
            sound.prev_volume = volume;
            sound.play();
        } else {
            sound.play();
            fadeInAll();
        }

        return sound;
    }

    function pause (soundID) {
        var sound = this.sounds[soundID];
        sound.pause();
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
        var sound = this.sounds[soundID];
        sound.stop();
    }

    function mute (soundID) {
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
        Howler.volume(0);
    }

    function unmuteAll () {
        if (this.btn && this.btn.className.match(' on')) {
            fadeInAll.apply(this);
        }
    }

    function volume (soundID, targetVolume) {

    }


    function addSprite (spriteId, params) {
        var sprite_path = params.urls,
            sprite = params.sprite;

        var audioSprite = this.addSound(spriteId, params);

        // add each named sound in the sprite to sounds and point them to this.sounds[sprite_path]
        for (var sound_name in sprite) {
            this.sounds[sound_name] = spriteId;
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

    function initSoundButton (id) {
        id = id || 'soundBars';
        this.btn = document.getElementById(id);
        this.btn.className = this.btn.className.replace(' off', '') + ' on';
        $(this.btn).on('click', toggleSound.bind(this));

        $(window).on('onPageVisibilityChange', function (e, status) {
            switch (status) {
                case 'hidden':
                    muteAll.apply(this);
                    break;
                case 'visible':
                    unmuteAll.apply(this);
                    break;
                default:
            }
        }.bind(this));
    }

    function toggleSound (e) {
        e.preventDefault();
        if (this.btn.className.match('on')) {
            this.btn.className = this.btn.className.replace(' on', '') + ' off';
            fadeOutAll.apply(this);
        } else {
            this.btn.className = this.btn.className.replace(' off', '') + ' on';
            fadeInAll.apply(this);
        }
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

    Sound.prototype.initSoundButton = initSoundButton;

    window.oblio = window.oblio || {};
    oblio.classes = oblio.classes || {};
    oblio.classes.Sound = Sound;

    return oblio.classes.Sound;
});
