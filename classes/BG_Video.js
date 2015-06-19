// UMD (Universal Module Definition) patterns for JavaScript modules that work everywhere.
// https://github.com/umdjs/umd/blob/master/amdWebGlobal.js

;(function (root, factory) {
    // Browser globals
    root.classes = root.classes || {};

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
                'jquery',
                'oblio/utils/videoPlayerYT',
                'oblio/utils/videoPlayerME'
            ], function ($) {
            return (root.classes.BG_Video = factory($));
        });
    } else {
        root.classes.BG_Video = factory($);
    }
}(window.oblio = window.oblio || {}, function ($) {

    'use strict';

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
    }

    function place (wrapper) {
        var playerVars = {
                videoSrc: String(this.videoSrc),
                autoplay: 1,
                loop: true,
                controls: false
            };

        if(this.type == "youTube"){
            this.playerObj = new oblio.utils.VideoPlayerYT(wrapper, playerVars);
        } else if (this.type == "htmlVideo"){
            this.playerObj = new oblio.utils.VideoPlayerME(wrapper, playerVars);
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
        }

        return this.playerObj.player;
    }

    // override base class functions
    BG_Video.prototype.place = place;

    return BG_Video;
}));