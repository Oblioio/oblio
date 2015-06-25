define([
        'jquery',
        'oblio/utils/videoPlayerYT',
        'oblio/utils/videoPlayerHTML5'
    ], function ($) {

    'use strict';
    /*jshint validthis:true*/

    var BG_Video = function (vidObj, onReady, resize) {
        for (var param in vidObj) {
            if (vidObj.hasOwnProperty(param)) {
                this[param] = vidObj[param];
            }
        }
        this.loaded = true;
        this.resizeFn = resize;

        if(this.verbose)console.log("BGManager | image loaded: "+vidObj.videoSrc);
        onReady.apply(this);
    };

    function place (wrapper) {
        var playerVars = {
                videoSrc: String(this.videoSrc),
                autoplay: 1,
                loop: 1,
                controls: false
            };

        if (this.type === 'youTube'){
            this.playerObj = new oblio.utils.VideoPlayerYT(wrapper, playerVars);
        } else if (this.type === 'htmlVideo'){
            this.playerObj = new oblio.utils.videoPlayerHTML5(wrapper, playerVars);
            this.playerObj.player.width = 'auto';
            this.playerObj.player.height = 'auto';
            this.playerObj.player.style.position = 'absolute';
            this.playerObj.player.style.width = 'auto';
            this.playerObj.player.style.height = 'auto';
        } else {
            return false;
        }

        var that = this;
        this.playerObj.onPlaying = function () {
            oblio.app.Shell.resize();
        };

        return this.playerObj.player;
    }

    // override base class functions
    BG_Video.prototype.place = place;

    window.oblio = window.oblio || {};
    oblio.classes = oblio.classes || {};
    oblio.classes.BG_Video = BG_Video;

    return oblio.classes.BG_Video;
});