'use strict';

var prototype = {
    init: function (el, callback) {
        this.el = el;
        callback();
    },
    open: function () {
        if (this.shown) return;

        var data = oblio.app.dataSrc.widgets.main.data;

        if (this.el) {
            oblio.settings.mpaaShown = true;
            TweenLite.fromTo(this.el, 1, {y: '0%'}, {y: '-100%', ease: Power4.easeInOut});

            window.setTimeout(function () {
                this.close();
            }.bind(this), 6000);
        }

        this.shown = true;
    },
    close: function () {
        TweenLite.to(this.el, 1, {y: '100%', ease:Power4.easeInOut});
    }
}

export var MpaaPopup = {
    getNew: function () {
        return Object.assign(Object.create(prototype), {
            shown: false
        });
    }
}