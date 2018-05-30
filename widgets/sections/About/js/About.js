import { SectionLoader } from 'OblioUtils/utils/SectionLoader';
import { Section } from 'OblioUtils/classes/Section';

/* About.widgets */

'use strict';

var myName = "About",
    instance,
    sectionLoader = SectionLoader.getInstance(),
    elements,
    mobile = false,
    winHeight = 0,
    winWidth = 0;

var t = 0;

function prepareLoad () {
    var files = [];

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

    if (callback) callback();
}

function updateProgress (p, i) {
    // p = (Math.max(0, Math.min(2, p - i))) / 2;
    tl.progress(p);
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
    let sectionHeight = (h - (top + footerHeight));

    elements.sectionWrapper.style.top = top + 'px';
    elements.sectionWrapper.style.width = w + 'px';
    elements.sectionWrapper.style.height = sectionHeight + 'px';  
}

var props = {
        id: myName,
        prepareLoad: prepareLoad,
        init: init,
        resize: resize,
        show: show,
        hide: hide
    };

export var About = {
    getInstance: function () {
        instance = instance || Object.assign(Object.create(Section.prototype), props);
        return instance;
    }
}