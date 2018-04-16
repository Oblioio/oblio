import { SectionLoader } from 'OblioUtils/utils/SectionLoader';
import { Section } from 'OblioUtils/classes/Section';
import { Backplate } from 'OblioUtils/classes/Backplate';
import { BG_Image } from 'OblioUtils/classes/BG_Image';

/* About.widgets */

'use strict';

var myName = "About",
    instance,
    sectionLoader = SectionLoader.getInstance(),
    elements,
    mobile = false,
    winHeight = 0,
    winWidth = 0,
    backplate,
    bgRatio = 0.58375;

var t = 0;

function prepareLoad () {
    var files = [
        "assets/images/about/backplate.jpg"
    ];

    if (files.length > 0) {
        sectionLoader.addFiles('about', files);
    }
}

function init (callback) {
    console.log('init ' + myName);

    elements = this.elements = {
        sectionWrapper: document.getElementById(myName.toLowerCase()),
        footer: document.getElementById('footer')
    };

    elements.wrapper = elements.sectionWrapper.querySelector('.wrapper');
    initBackplate();

    if (callback) callback();
}

function initBackplate () {
    backplate = Backplate.getNew(BG_Image.getNew(oblio.app.dataSrc.backgrounds.images.about_desktop, function () {
        console.log('about bg ready');
    }), false, elements.sectionWrapper, 'contain');

    backplate.elements.outer.className = 'backplate desktopBG';
    elements.sectionWrapper.insertBefore(backplate.elements.outer, elements.sectionWrapper.firstChild);
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

    let bgHeight = w * bgRatio;
    let perc = w > 768 ? 0.4239828694 : 0.75;
    let wrapperTop = Math.min(0.5 * sectionHeight, perc * bgHeight);
    // elements.wrapper.style.marginTop = wrapperTop + 'px';

    let minPadding = 75;
    let wrapperHeight = elements.wrapper.offsetHeight;

    backplate.resize(w, sectionHeight);

    elements.wrapper.style.marginTop = wrapperTop + 'px';
    elements.wrapper.style.marginBottom = Math.max(minPadding, (h - top - wrapperTop - wrapperHeight) / 2) + 'px';   
}

var props = {
        id: myName.toLowerCase(),
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