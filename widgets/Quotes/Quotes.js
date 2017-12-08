import Mustache from 'mustache';
import template from './quotes.template';

'use strict';

var prototype = {
    init: function (params, callback) {

        let wrapper = params.wrapper || document.body;
        let quotes = params.data.quotes || [];
        let html = Mustache.render(template, { quotes: quotes });
        let tmp = document.createElement('div');
        tmp.innerHTML = html;

        let el = tmp.firstChild;
        let position = params.data.position;

        el.classList.add(position.h);
        el.classList.add(position.v);

        this.quotes = el.getElementsByTagName('blockquote');
        this.quotes[0].classList.add('current');

        wrapper.appendChild(el);

        if (callback) callback();
    },
    start: function () {

    },
    stop: function () {

    }
}

export var Quotes = {
    getNew: function () {
        return Object.assign(Object.create(prototype), {
            shown: false
        });
    }
}