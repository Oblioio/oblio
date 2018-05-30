import { SectionLoader } from 'OblioUtils/utils/SectionLoader';
import { Section } from 'OblioUtils/classes/Section';

/* Gallery.widgets */

'use strict';

var myName = "Gallery",
    data,
    instance,
    sectionLoader = SectionLoader.getInstance();

var t = 0;

function prepareLoad () {
    var files = [];

    data = oblio.app.dataSrc.widgets.Gallery.data;

    if (files.length > 0) {
        sectionLoader.addFiles(myName, files);
    }
}

function init (callback) {
    console.log('init ' + myName);

    this.elements = {
        sectionWrapper: document.getElementById(myName.toLowerCase()),
        footer: document.getElementById('footer')
    };

    this.elements.wrapper = this.elements.sectionWrapper.querySelector('.wrapper');

    if (typeof Slideshow !== 'undefined') buildGallery.call(this);

    if (callback) callback();
}

function buildGallery () {
    var images = data.images;

    var slideshow_params = {
        el: document.getElementById('gallery_slideshow'),
        slides: images,
        fullBleed: true,
        resizeContainer: this.elements.sectionWrapper,
        paginator_container: this.elements.sectionWrapper
    };

    this.slideshow = Slideshow.getNew(slideshow_params);
}

function resize (w, h) {
    let top = oblio.settings.headerHeight;
    let minPadding = 75;
    let height = h - top;

    this.elements.sectionWrapper.style.top = top + 'px';
    this.elements.sectionWrapper.style.width = w + 'px';
    this.elements.sectionWrapper.style.height = height + 'px';

    if (this.slideshow) this.slideshow.resize(w, height);
}

var props = {
        id: myName,
        prepareLoad: prepareLoad,
        init: init,
        resize: resize
    };

export var Gallery = {
    getInstance: function () {
        instance = instance || Object.assign(Object.create(Section.prototype), props);
        return instance;
    }
};