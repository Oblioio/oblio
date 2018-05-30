import { SectionLoader } from 'OblioUtils/utils/SectionLoader';
import { Section } from 'OblioUtils/classes/Section';

/* About.widgets */

'use strict';

var myName = "About",
    instance,
    sectionLoader = SectionLoader.getInstance();

var t = 0;

function prepareLoad () {
    var files = [];

    if (files.length > 0) {
        sectionLoader.addFiles(myName, files);
    }
}

function init (callback) {
    console.log('init ' + myName);

    let wrapper = document.getElementById(myName.toLowerCase());
    this.elements = {
        sectionWrapper: wrapper,
        footer: document.getElementById('footer'),
        wrapper: wrapper.querySelector('.wrapper')
    };

    if (callback) callback();
}

var props = {
        id: myName,
        prepareLoad: prepareLoad,
        init: init
    };

export var About = {
    getInstance: function () {
        instance = instance || Object.assign(Object.create(Section.prototype), props);
        return instance;
    }
};