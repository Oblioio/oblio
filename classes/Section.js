import { SectionLoader } from 'OblioUtils/utils/SectionLoader';
// import Mustache from 'mustache';

'use strict';

var Section = function () {}

Section.prototype = {
    init: function (callback) {

    },
    resize: function (w, h) {
        if (this.backplate) {
            this.backplate.resize();
        }
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
}

export { Section }
