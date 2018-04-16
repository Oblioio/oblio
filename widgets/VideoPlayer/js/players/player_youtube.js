import { clock } from 'OblioUtils/utils/MasterClock.js';

var masterclock = clock.getInstance();

var player_proto = {
    play: function () {
        this.isPaused = false;
        this.player.playVideo();
    },
    pause: function (resume) {
        if (!resume) this.isPaused = true;
        this.player.pauseVideo();
    },
    paused: function () {
        return this.isPaused;
    },
    setVolume: function (v) {
        this.volume = v;
        this.player.setVolume(this.volume * 100);
        this.onStateChange.call(this, {data: 'volumechange'});
    },
    getVolume: function () {
        return this.volume;
    },
    getCurrentTime: function () {
        return this.player.getCurrentTime();
    },
    setCurrentTime: function (t) {
        this.player.seekTo(t * this.getDuration());
    },
    getDuration: function () {
        return this.player.getDuration();
    },
    fullscreen: function () {
        var iframe = this.player.getIframe();

        var fullscreenFn = iframe.requestFullscreen ||
            iframe.webkitRequestFullscreen || 
            iframe.mozRequestFullscreen || 
            iframe.msRequestFullscreen || function () {
                console.warning('This browser does not support fullscreen');
            };

        fullscreenFn.call(iframe);
    },
    hideCover: function () {
        this.cover.style.display = 'none';
    },
    showCover: function () {
        this.cover.style.display = 'block';
    },
    onStateChange: function (state) {
        switch (state.data) {
            case YT.PlayerState.PLAYING:
                this.start();
                this.events.publish('durationchange', {duration: this.getDuration()});
                this.events.publish('play', {playing: true});
                break;
            case YT.PlayerState.PAUSED:
                this.stop();
                this.events.publish('pause', {paused: true});
                break;
            case YT.PlayerState.ENDED:
                this.stop();
                this.events.publish('ended', {ended: true});
                break;
            case YT.PlayerState.BUFFERING:
                this.events.publish('durationchange', {duration: this.getDuration()});
                this.events.publish('buffering');
                break;
            case YT.PlayerState.CUED:
                this.events.publish('durationchange', {duration: this.getDuration()});
                this.events.publish('cued');
                break;
            case 'timeupdate':
                this.events.publish('timeupdate', {currentTime: this.getCurrentTime(), duration: this.getDuration()});
                break;
            case 'volumechange':
                this.events.publish('volumechange', {volume: this.getVolume()});
                break;
            default:
                // console.log('YOUTUBE STATE', state);
                this.events.publish('durationchange', {duration: this.getDuration()});
        }
    },
    loadVideoById: function (yt_id) {
        this.player.loadVideoById({ videoId: yt_id });
    },
    cuePlaylist: function (playlist, index) {
        index = index || 0;

        if (typeof playlist === 'string') {
            this.player.cuePlaylist({
                listType: 'playlist',
                list: playlist,
                index: index
            });
        } else {
            this.player.cuePlaylist(playlist, index);
        }
    },
    playVideoAt: function (i) {
        this.player.playVideoAt(i);
    },
    initStart: function (updateFn) {
        return function () {
            if (this.updateID !== undefined) this.stop();
            this.updateID = masterclock.registerCallback(updateFn);
        };
    },
    stop: function () {
        if (this.updateID) masterclock.unregisterCallback(this.updateID);
        this.updateID = undefined;
    }
};

function onError (e) {
    console.log('YOUTUBE ERROR', e);
}

function loadScript( url, callback ) {
    var script = document.createElement( "script" )
    script.type = "text/javascript";
    if(script.readyState) {  //IE
        script.onreadystatechange = function() {
            if ( script.readyState === "loaded" || script.readyState === "complete" ) {
                script.onreadystatechange = null;
                if (callback) callback();
            }
        };
    } else {  //Others
        script.onload = function() {
            if (callback) callback();
        };
    }

    script.src = url;
    document.getElementsByTagName( "head" )[0].appendChild( script );
}

function resize (w, h) {
    var ratio = h / w;

    return function (w, h) {
        if (!w || !h) {
            w = this.wrapper.offsetWidth;
            h = Math.floor(w * ratio);
        }

        this.player.iframe.style.width = w + 'px';
        this.player.iframe.style.height = h + 'px';
    };
}

function update () {
    this.onStateChange.call(this, {data: 'timeupdate'});
}

function load () {
    return new Promise (function (resolve, reject) {

        var ytScript = document.createElement('script');
        ytScript.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(ytScript);

        var playerID = this.video_el.id;

        window.onYouTubeIframeAPIReady = function () {
            this.isPaused = false;
            this.player = new YT.Player(playerID, {
                videoId: this.options.videoSrc,
                playerVars: { 
                    'autoplay': this.options.autoplay,
                    'enablejsapi': this.options.enablejsapi,
                    'color': this.options.color, // this is red or white -- turning it to white disables modestbranding:1
                    'showinfo': this.options.showinfo, // this.showinfo,
                    'controls': this.options.controls,
                    'wmode': 'transparent', // fixes z-index problem in ie8
                    'rel': this.options.rel, // hide end screen of related videos,
                    'modestbranding': this.options.modestbranding
                },
                events: {
                    'onReady': function () {
                        this.start = this.initStart(update.bind(this));
                        resolve(this);
                        var iframe = this.player.iframe = document.getElementById(playerID);
                        this.hideCover();
                        this.resize = resize(iframe.width, iframe.height);
                    }.bind(this),
                    'onStateChange': this.onStateChange.bind(this),
                    'onError': onError.bind(this)
                }
            });

        }.bind(this);

    }.bind(this));
}

export var player = {
    proto: player_proto,
    resize: resize,
    load: load
};