// UMD (Universal Module Definition) patterns for JavaScript modules that work everywhere.
// https://github.com/umdjs/umd/blob/master/amdWebGlobal.js

;(function (root, factory) {
    // Browser globals
    root.classes = root.classes || {};

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
                'jquery',
                'oblio/utils/Inherit',
                'oblio/classes/Backplate', 
                'oblio/utils/videoPlayerME'
            ], function ($) {
            return (root.classes.VideoBackplate = factory($));
        });
    } else {
        root.classes.VideoBackplate = factory($);
    }
}(window.oblio = window.oblio || {}, function ($) {
    
    var VideoBackplate = function (div) {

        var that = this,
            default_ratio = 9 / 16,
            playerVars = {
                autoplay: 0,
                tracking: true,
                title: '',
                loop: true,
                controls: false,
                videoSrc: div.getAttribute('data-path')
            },
            ratio = div.getAttribute('data-ratio');

        this.elements = {
            wrapper: div
        };

        this.el = this.elements.wrapper;

        this.player_obj = new oblio.utils.VideoPlayerME(div, playerVars);
        
        this.ratio = ratio || default_ratio;
        // this.resize(oblio.settings.window_dimensions.width, oblio.settings.window_dimensions.height);

        this.player_obj.onLoadedMetadata = function () {
            var vid_width = that.player_obj.player.videoWidth,
                vid_height = that.player_obj.player.videoHeight;

            // if for some reason videoWidth and videoHeight are undefined, set default ratio
            if (vid_width && vid_height && vid_width > 0 && vid_height > 0) {
                that.ratio = vid_height / vid_width;
                console.log('that.ratio');
            }

            console.log(that.ratio);

            // console.log('on loaded metadata ' + that.ratio);

            // that.resize(oblio.settings.window_dimensions.width, oblio.settings.window_dimensions.height);
        }
    }

    // inherit from base class Section
    oblio.utils.inherit(VideoBackplate, oblio.classes.Backplate);

    VideoBackplate.prototype.play = function () {
        console.log('PLAY IT');
        this.player_obj.player.play();
    }

    VideoBackplate.prototype.stop = function () {
        console.log('STOP IT');
        this.player_obj.player.pause();
    }

    VideoBackplate.prototype.reset = function () {

        try {
            this.player_obj.player.currentTime = 0;
        }
        catch (e) {
           console.log(e);
        }
        
        this.stop();
    }

    VideoBackplate.prototype.resize = function (w, h) {
        var vid_width = w > 480 ? h / this.ratio : w,
            vid_height = w > 480 ? h : w * this.ratio;

        this.elements.wrapper.style.width = vid_width + 'px';
        this.elements.wrapper.style.height = vid_height + 'px';
        this.elements.wrapper.style.left = ((w / 2) - (vid_width / 2)) + 'px';
    }

    return VideoBackplate;
}));