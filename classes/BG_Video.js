import { BG } from 'OblioUtils/classes/BG';
import { VideoPlayerYT } from 'OblioUtils/utils/videoPlayerYT';
import { VideoPlayerHTML5 } from 'OblioUtils/utils/videoPlayerHTML5';

'use strict';
/*jshint validthis:true*/

var bg_video = function (vidObj, onReady, resize) {
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
    }.bind(this);

    onReady.call(this);
    this.el.play();
    BG.apply(this, [this.el, onReady]);
};

bg_video.prototype = Object.create(BG.prototype);
bg_video.prototype.constructor = bg_video;
    
export var BG_Video = {
    getNew: function (imgObj, onReady) {
        return new bg_video(imgObj, onReady);
    }
}