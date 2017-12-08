import { BG } from 'OblioUtils/classes/BG';

'use strict';

var bg_image = function (imgObj, onReady) {
    
    for (var param in imgObj) {
        if (imgObj.hasOwnProperty(param)) {
            this[param] = imgObj[param];
        }
    }
    
    this.el = new Image();

    this.el.style.position = 'absolute';
    this.el.alt = 'Background';

    this.el.addEventListener('load', function () {
        this.onReady();
    }.bind(this));

    this.el.src = imgObj.url;

    BG.apply(this, [this.el, onReady]);
};

bg_image.prototype = Object.create(BG.prototype);
bg_image.prototype.constructor = bg_image;

export var BG_Image = {
    getNew: function (imgObj, onReady) {
        return new bg_image(imgObj, onReady);
    }
}
