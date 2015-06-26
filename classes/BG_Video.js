define([
        'jquery',
        'oblio/classes/BG',
        'oblio/utils/videoPlayerYT',
        'oblio/utils/videoPlayerHTML5'
    ], function ($, BG, VideoPlayerYT, VideoPlayerHTML5) {

    'use strict';
    /*jshint validthis:true*/

    var BG_Video = function (vidObj, onReady, resize) {
        for (var param in vidObj) {
            if (vidObj.hasOwnProperty(param)) {
                this[param] = vidObj[param];
            }
        }

        var playerVars = {
                videoSrc: String(this.videoSrc),
                autoplay: 1,
                loop: 1,
                controls: false
            };

        if (this.type === 'youTube'){
            this.playerObj = new VideoPlayerYT(wrapper, playerVars);
        } else if (this.type === 'htmlVideo'){
            this.playerObj = new VideoPlayerHTML5(wrapper, playerVars);
            this.playerObj.player.width = 'auto';
            this.playerObj.player.height = 'auto';
            this.playerObj.player.style.position = 'absolute';
            this.playerObj.player.style.width = 'auto';
            this.playerObj.player.style.height = 'auto';
        } else {
            return false;
        }

        this.el = this.playerObj.player;

        this.playerObj.onPlaying = function () {
            this.onReady();
        }.bind(this);

        BG.apply(this, [this.el, onReady]);
    };

    BG_Video.prototype = Object.create(BG.prototype);
    BG_Video.prototype.constructor = BG_Video;
    
    return BG_Video;
});