import { SectionLoader } from 'OblioUtils/utils/SectionLoader';
import { Section } from 'OblioUtils/classes/Section';

/* Home.widgets */

'use strict';

var myName = "Home",
    instance,
    sectionLoader = SectionLoader.getInstance(),
    quotesModule;

function prepareLoad () {
    var files = [];

    if (files.length > 0) {
        sectionLoader.addFiles(myName, files);
    }
}

function init (callback) {
    this.elements = {
        sectionWrapper: document.getElementById(myName.toLowerCase())
    };

    quotesModule = initQuotes();

    if (callback) callback();
}

function initQuotes () {
    let quotes = (typeof Quotes !== 'undefined') ? Quotes.getNew(this.elements.sectionWrapper) : false;
    if (quotes) {
        quotes.init({
            wrapper: this.elements.sectionWrapper
        });
    }
    return quotes;
}

function show (callback) {
    if (quotesModule) {
        quotesModule.start();
    }

    TweenMax.to(this.elements.sectionWrapper, 0.75, {autoAlpha: 1, ease: Power3.easeInOut, onComplete: function () {
        if (callback) callback();
    }});
}

var props = {
        id: myName,
        prepareLoad: prepareLoad,
        init: init,
        show: show
    };

export var Home = {
    getInstance: function () {
        instance = instance || Object.assign(Object.create(Section.prototype), props);
        return instance;
    }
};