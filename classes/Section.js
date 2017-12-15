import { SectionLoader } from 'OblioUtils/utils/SectionLoader';
import Mustache from 'mustache';

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
                sectionObj = sectionLoader.getSectionTemplates(that.id),
                template = sectionObj.template,
                content = sectionObj.data.data;

            content.slugify = function () {
                return function (text, render) {
                    return render(text)
                        .toLowerCase()
                        .replace(/[^\w ]+/g,'')
                        .replace(/ +/g,'_')
                        ;
                };
            };

            let html = Mustache.render(sectionObj.template, content, sectionObj.partials);
            console.log(content);
            wrapper.insertAdjacentHTML('beforeend', html);

            window.requestAnimationFrame(function () {
                resolve();
            });
        });
    }
}

export { Section }
