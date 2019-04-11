var player_proto = {
    play: function (time) {
        if (typeof time !== 'undefined') {
            this.video_el.currentTime = 0;
        }
        this.video_el.play();
        this.isPaused = false;
    },
    pause: function (resume) {
        if (!resume) this.isPaused = true;
        this.video_el.pause();
    },
    paused: function () {
        return this.isPaused;
    },
    mute: function () {
        this.video_el.volume = 0;
    },
    setVolume: function (v) {
        this.video_el.volume = v;
    },
    getVolume: function () {
        return this.video_el.volume;
    },
    getCurrentTime: function () {
        return this.video_el.currentTime;
    },
    setCurrentTime: function (t) {
        this.video_el.currentTime = t * this.video_el.duration;
    },
    getDuration: function () {
        return this.video_el.duration;
    },
    fullscreen: function () {
        var fullscreenFn = this.video_el.requestFullscreen ||
            this.video_el.webkitRequestFullscreen || 
            this.video_el.mozRequestFullscreen || 
            this.video_el.msRequestFullscreen || function () {
                console.warning('This browser does not support fullscreen');
            };
        fullscreenFn.call(this.video_el);
    },
    loadVideoById: function (src, poster) {
        return new Promise((resolve, reject) => {

            var onLoadedMetadata = () => {
                resolve();
                this.video_el.removeEventListener('loadedmetadata', onLoadedMetadata);
            }
    
            if (poster) {
                this.video_el.setAttribute('poster', poster);
            }

            this.video_el.addEventListener('loadedmetadata', onLoadedMetadata);
            this.video_el.src = src;
        });
    },
    onStateChange: function (eventName) {
        return function (e) {
            switch (eventName) {
                case 'play':
                    this.events.publish('play', {playing: true});
                    break;
                case 'pause':
                    this.events.publish('pause', {paused: true});
                    break;
                case 'ended':
                    this.events.publish('ended', {ended: true});
                    break;
                case 'timeupdate':
                    this.events.publish('timeupdate', {currentTime: this.getCurrentTime(), duration: this.getDuration()});
                    break;
                case 'durationchange':
                    this.events.publish('durationchange', {duration: this.getDuration()});
                    break;
                case 'volumechange':
                    this.events.publish('volumechange', {volume: this.getVolume()});
                default:
                    console.log(eventName);
            }
        }
    },
    destroy: function () {
        // this.stop();
        // this.player.destroy();
    },
    getPlayerState: function () {
        // TODO return player state (paused playing ended)
        /*
           -1 – unstarted
            0 – ended
            1 – playing
            2 – paused
            3 – buffering
            5 – video cued
        */
        return new Promise((resolve, reject) => {
            resolve();
        });
    }
}

function resize (w, h) {
    var ratio = h / w;

    return function () {
        var w = this.wrapper.offsetWidth;
        this.video_el.style.width = w + 'px';
        this.video_el.style.height = (w * ratio) + 'px';
    }
}

function addEvents () {
    var events = [
        'play',
        'pause',
        'ended',
        'timeupdate',
        'durationchange',
        // 'progress',
        // 'seeked',
        // 'texttrackchange',
        // 'cuechange',
        // 'cuepoint',
        'volumechange',
        // 'error',
        // 'loaded'
    ];

    events.forEach(function (eventName) {
        this.video_el.addEventListener(eventName, this.onStateChange(eventName).bind(this));
    }.bind(this));
}

function load () {
    console.log('LOAD HTML PLAYER, ', this.options.videoSrc);

    return new Promise ((resolve, reject) => {
        this.isPaused = false;
        this.loadVideoById(this.options.videoSrc, this.options.poster).then(() => {
            this.resize = resize(this.video_el.videoWidth, this.video_el.videoHeight);
            addEvents.call(this);
            resolve(this);
        });
    });
}

export var player = {
    proto: player_proto,
    resize: resize,
    load: load
}