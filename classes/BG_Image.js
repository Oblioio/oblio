define([
        'jquery',
        'oblio/classes/BG'
    ], function ($, BG) {

    'use strict';

    var BG_Image = function (imgObj, onReady) {
        
        for (var param in imgObj) {
            if (imgObj.hasOwnProperty(param)) {
                this[param] = imgObj[param];
            }
        }
        
        this.el = new Image();

        this.el.style.position = 'absolute';
        this.el.alt = 'Background';

        $(this.el).on('load', function () {
            this.onReady();
        }.bind(this));

        this.el.src = imgObj.url;

        BG.apply(this, [this.el, onReady]);
    };

    BG_Image.prototype = Object.create(BG.prototype);
    BG_Image.prototype.constructor = BG_Image;

    return BG_Image;
});