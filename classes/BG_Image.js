define([
        'jquery'
    ], function ($) {

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
    };

    function place (wrapper) {
        wrapper.appendChild(this.img);

        return this.img;
    }

    // override base class functions
    BG_Image.prototype.place = place;

    window.oblio = window.oblio || {};
    oblio.classes = oblio.classes || {};
    oblio.classes.BG_Image = BG_Image;

    return oblio.classes.BG_Image;
});