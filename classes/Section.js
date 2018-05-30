import { SectionLoader } from 'OblioUtils/utils/SectionLoader';

'use strict';

var Section = function () {};

Section.prototype = {
    init: function (callback) {

    },
    show: function (callback) {
        TweenMax.to(this.elements.sectionWrapper, 0.75, {autoAlpha: 1, ease: Power3.easeInOut, onComplete: function () {
            if (callback) callback();
        }});
    },
    hide: function (callback) {
        TweenMax.to(this.elements.sectionWrapper, 0.75, {autoAlpha: 0, ease: Power3.easeInOut, onComplete: function () {
            this.elements.sectionWrapper.style.display = 'none';
            if (callback) callback();
        }.bind(this)});
    },
    resize: function (w, h) {
        let top = oblio.settings.headerHeight;

        this.width = w;
        this.height = h - top;

        this.elements.sectionWrapper.style.width = this.width + 'px';
        this.elements.sectionWrapper.style.height = this.height + 'px';
        this.elements.sectionWrapper.style.top = top + 'px';
    },
    insert: function (wrapper) {
        var that = this;

        return new Promise (function (resolve, reject) {
            var sectionLoader = SectionLoader.getInstance(),
                sectionObj = sectionLoader.returnSectionOBJ(that.id);

            wrapper.insertAdjacentHTML('beforeend', sectionObj.html);

            window.requestAnimationFrame(function () {
                resolve();
            });
        });
    }
};

export { Section };
