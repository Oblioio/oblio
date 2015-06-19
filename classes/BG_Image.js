// UMD (Universal Module Definition) patterns for JavaScript modules that work everywhere.
// https://github.com/umdjs/umd/blob/master/amdWebGlobal.js

;(function (root, factory) {
    // Browser globals
    root.classes = root.classes || {};

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
                'jquery'
            ], function ($) {
            return (root.classes.BG_Image = factory($));
        });
    } else {
        root.classes.BG_Image = factory($);
    }
}(window.oblio = window.oblio || {}, function ($) {

    'use strict';

    var BG_Image = function (imgObj, onReady) {
        for (var param in imgObj) {
            if (imgObj.hasOwnProperty(param)) {
                this[param] = imgObj[param];
            }
        }
        
        this.img = new Image();
        this.el = this.img;

        this.img.style.position = 'absolute';
        this.img.alt = 'Background';
        $(this.img).on('load', function () {
            onReady();
        });
        this.img.src = imgObj.url;
    }

    function place (wrapper) {
        wrapper.appendChild(this.img);

        return this.img;
    }

    // override base class functions
    BG_Image.prototype.place = place;

    return BG_Image;
}));