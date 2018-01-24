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
                sectionObj = sectionLoader.getSectionData(that.id),
                // template = sectionObj.template,
                content = sectionObj.data;

            content.slugify = function () {
                return function (text, render) {
                    return render(text)
                        .toLowerCase()
                        .replace(/[^\w ]+/g,'')
                        .replace(/ +/g,'_')
                        ;
                };
            };

            let partials = {};
            for (var i = sectionObj.partials.length - 1; i >= 0; i--) {
                partials[sectionObj.partials[i]] = oblio.templates[sectionObj.partials[i]];
            }
            let template = oblio.templates[sectionObj.template];
            let html = template.render(content, partials);

            wrapper.insertAdjacentHTML('beforeend', html);

            window.requestAnimationFrame(function () {
                resolve();
            });
        });
    }
}

export { Section }
