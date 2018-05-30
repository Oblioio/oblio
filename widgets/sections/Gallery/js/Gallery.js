import { SectionLoader } from 'OblioUtils/utils/SectionLoader';
import { Section } from 'OblioUtils/classes/Section';

/* Gallery.widgets */

'use strict';

var myName = "Gallery",
    data,
    instance,
    sectionLoader = SectionLoader.getInstance(),
    elements,
    mobile = false,
    winHeight = 0,
    winWidth = 0;

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

    elements = this.elements = {
        sectionWrapper: document.getElementById(myName.toLowerCase()),
        footer: document.getElementById('footer')
    };

    elements.wrapper = elements.sectionWrapper.querySelector('.wrapper');

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

function show (callback) {
    TweenMax.to(elements.sectionWrapper, 0.75, {autoAlpha: 1, ease: Power3.easeInOut, onComplete: function () {
        if (callback) callback();
    }});
}

function hide (callback) {
    TweenMax.to(elements.sectionWrapper, 0.75, {autoAlpha: 0, ease: Power3.easeInOut, onComplete: function () {
        elements.sectionWrapper.style.display = 'none';
        if (callback) callback();
    }});
}

function resize (w, h, top) {
    let footerHeight = elements.footer.offsetHeight;
    let minPadding = 75;

    elements.sectionWrapper.style.top = top + 'px';
    elements.sectionWrapper.style.width = w + 'px';
    elements.sectionWrapper.style.height = (h - (top + footerHeight)) + 'px';

    if (elements.wrapper) {
        let wrapperHeight = elements.wrapper.offsetHeight;

        // elements.wrapper.style.marginTop = elements.wrapper.style.marginBottom = Math.max(minPadding, (h - top - wrapperHeight) / 2) + 'px';   

        if (this.slideshow) this.slideshow.resize(w, h - (top + footerHeight));
    }
}

var props = {
        id: myName,
        prepareLoad: prepareLoad,
        init: init,
        resize: resize,
        show: show,
        hide: hide
    };

export var Gallery = {
    getInstance: function () {
        instance = instance || Object.assign(Object.create(Section.prototype), props);
        return instance;
    }
};