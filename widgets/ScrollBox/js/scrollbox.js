import { Drag } from 'OblioUtils/utils/drag.js';
import { clock } from 'OblioUtils/utils/MasterClock.js';
import { getScrollbarWidth } from 'OblioUtils/utils/getScrollbarWidth.js';

'use strict';

var masterclock = clock.getInstance();

var prototype = {
    init: function () {

        this.elements = {
            scrollbar: this.el.querySelector('.scrollbar'),
            scrollmasker: this.el.querySelector('.scrollmasker'),
            scrollwrapper: this.el.querySelector('.scrollwrapper'),
            scrollcontent: this.el.querySelector('.scrollcontent')
        };

        this.scrollbarWidth = getScrollbarWidth();
        this.elements.scrollmasker.style.width = 'calc(100% - ' + this.scrollbarWidth + 'px)';
        this.elements.scrollwrapper.style.width = 'calc(100% + ' + (this.scrollbarWidth + 1) + 'px)';
        this.scrollListener = this.onScroll.bind(this);

        this.drag = new Drag(this.elements.scrollbar, this.startDrag.bind(this), this.onDrag.bind(this), this.endDrag.bind(this))
    },
    startDrag: function (x, y) {
        let scrollbarBounds = this.elements.scrollbar.getBoundingClientRect();
        let wrapperBounds = this.el.getBoundingClientRect();

        this.offsetY = y - scrollbarBounds.y;
        this.elOffsetY = wrapperBounds.y;

        this.scrollbarHeight = scrollbarBounds.height;
        this.wrapperHeight = wrapperBounds.height;

        this.dragged = true;
        this.scrollTop = (Math.max(0, (y - this.offsetY - this.elOffsetY)) / this.wrapperHeight * 100);

        this.elements.scrollbar.style.top = (Math.max(0, (y - this.offsetY - this.elOffsetY)) / this.wrapperHeight * 100) + '%';
    },
    onDrag: function (x, y) {
        this.scrollTop = Math.min((this.wrapperHeight - this.scrollbarHeight) / this.wrapperHeight * 100, (Math.max(0, (y - this.offsetY - this.elOffsetY)) / this.wrapperHeight * 100));
        this.elements.scrollbar.style.top = this.scrollTop + '%';
        this.dragged = true;
    },
    endDrag: function (x, y) {
        this.dragged = true;
    },
    onScroll: function (e) {
        this.scrolled = true;
    },
    update: function () {
        if (this.scrolled) {
            this.elements.scrollbar.style.top = ((this.elements.scrollwrapper.scrollTop / this.elements.scrollwrapper.scrollHeight) * 100) + '%';
            this.scrolled = false;
        }

        if (this.dragged) {
            this.dragged = false;
            this.elements.scrollwrapper.scrollTop = this.scrollTop / 100 * this.elements.scrollwrapper.scrollHeight;
        }
    },
    start: function () {
        this.updateID = masterclock.registerCallback(this.update.bind(this));
        this.elements.scrollwrapper.addEventListener('scroll', this.scrollListener);
        masterclock.play();
    },
    stop: function () {
        masterclock.unregisterCallback(this.updateID);
        this.elements.scrollwrapper.removeEventListener('scroll', this.scrollListener);
    },
    resize: function (h) {
        let contentHeight = this.elements.scrollcontent.offsetHeight;

        if (h < contentHeight) {
            if (!this.scrollable) {
                this.start();
                this.scrollable = true;
            }
            this.elements.scrollbar.style.height = ((h / contentHeight) * 100) + '%';
            console.log('scrolling');
        } else {
            if (this.scrollable) {
                this.stop();
                this.scrollable = false;
            }
            console.log('not scrolling');
        }

        this.elements.scrollwrapper.style.height = h + 'px';
    }
};

export var scrollbox = {
    getNew: function (el) {
        return Object.assign(Object.create(prototype), {el: el});
    }
};
