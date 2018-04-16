import { SectionLoader } from 'OblioUtils/utils/SectionLoader';
import { Section } from 'OblioUtils/classes/Section';

/* Home.widgets */

'use strict';

var myName = "Home",
    instance,
    sectionLoader = SectionLoader.getInstance(),
    elements,
    mobile = false,
    sectionHeight = 0,
    sectionWidth = 0,
    sectionTop = 0,
    quotesModule;

function prepareLoad () {
    var files = [];

    if (files.length > 0) {
        sectionLoader.addFiles('home', files);
    }
}

function init (callback) {
    elements = {
        sectionWrapper: document.getElementById(myName.toLowerCase())
    };

    quotesModule = initQuotes();

    if (callback) callback();
}

function initQuotes () {
    let quotes = (typeof Quotes !== 'undefined') ? Quotes.getNew() : false;
    if (quotes) {
        quotes.init({
            wrapper: elements.sectionWrapper,
            data: oblio.app.dataSrc.widgets.Quotes.data
        });
    }
    return quotes;
}

function resize (w, h) {
    return new Promise (function (resolve, reject) {

        sectionHeight = h;
        sectionWidth = w;

        elements.sectionWrapper.style.width = sectionWidth + 'px';
        elements.sectionWrapper.style.height = sectionHeight + 'px';

        resolve();
    });
}

function show (callback) {
    resize(sectionWidth, sectionHeight, sectionTop).then(function () {
        TweenMax.to(elements.sectionWrapper, 0.75, {autoAlpha: 1, ease: Power3.easeInOut, onComplete: function () {
            if (callback) callback();
        }});
    });
}

function hide (callback) {
    TweenMax.to(elements.sectionWrapper, 0.75, {autoAlpha: 0, ease: Power3.easeInOut, onComplete: function () {
        elements.sectionWrapper.style.display = 'none';
        if (callback) callback();
    }});
}

var props = {
        id: myName,
        prepareLoad: prepareLoad,
        init: init,
        resize: resize,
        show: show,
        hide: hide
    };

export var Home = {
    getInstance: function () {
        instance = instance || Object.assign(Object.create(Section.prototype), props);
        return instance;
    }
}