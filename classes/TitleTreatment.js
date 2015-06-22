// UMD (Universal Module Definition) patterns for JavaScript modules that work everywhere.
// https://github.com/umdjs/umd/blob/master/amdWebGlobal.js

;(function (root, factory) {
    // Browser globals
    root.classes = root.classes || {};

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], function () {
            return (root.classes.TitleTreatment = factory());
        });
    } else {
        root.classes.TitleTreatment = factory();
    }
}(window.oblio = window.oblio || {}, function () {

    'use strict';

    var TitleTreatment = function (el, initial) {
        var that = this;
    }

    function init (el, initial) {
        this.elements = {
            el: el,
            large: {
                outer: document.getElementById('TT_large')
            },
            small: {
                outer: document.getElementById('TT_small')
            },
            images: el.getElementsByTagName('img')
        };

        this.isHidden = true;

        this.elements.large.inner = $(this.elements.large.outer).find('.inner')[0];
        this.elements.large.release_date = $(this.elements.large.inner).find('.release_date')[0];
        this.elements.large.img = $(this.elements.large.inner).find('img')[0];
        this.elements.large.ratio = this.elements.large.img.offsetHeight / this.elements.large.img.offsetWidth;

        this.elements.small.inner = $(this.elements.small.outer).find('.inner')[0];
        this.elements.small.release_date = $(this.elements.small.inner).find('.release_date')[0];
        this.elements.small.img = $(this.elements.small.inner).find('img')[0];
        this.elements.small.ratio = this.elements.small.img.offsetHeight / this.elements.small.img.offsetWidth;

        this.fullwidth = oblio.settings.windowDimensions.width - 72;
        this.width = initial === 'large' ? this.fullwidth : 500;
        this.height = oblio.settings.windowDimensions.height / 2 - oblio.settings.headerHeight / 2;

        // set the width and height of the title wrappers
        // for (var i = this.elements.images.length - 1; i >= 0; i--) {
        //     this.width = Math.max(this.width, this.elements.images[i].offsetWidth);
        //     this.height = Math.max(this.height, this.elements.images[i].offsetHeight);
        // };

        this.elements.large.inner.style.width = this.width + 'px';
        this.elements.large.inner.style.height = this.height + 'px';

        this.elements.large.outer.style.width = this.width + 'px';
        this.elements.large.outer.style.height = this.height + 'px';

        this.elements.small.inner.style.width = this.elements.small.img.offsetWidth + 'px';
        this.elements.small.inner.style.height = this.elements.small.img.offsetHeight + 'px';

        this.elements.el.style.width = this.width + 'px';
        this.elements.el.style.height = this.height + 'px';
        this.elements.el.style.bottom = ((oblio.settings.windowDimensions.height - (this.height + this.elements.el.offsetTop)) + oblio.settings.footerHeight) + 'px';
        this.elements.el.style.left = -this.width + 'px';

        this.changeTitle(initial, 'right');
        this.update(oblio.settings.windowDimensions.width);
        this.finished = true;

        this.resize(this.height);
        this._prepareReleaseDate();
    }

    function changeTitle (wrapper, direction) {
        var offset = 0;

        if (this.waxingWrapper === wrapper) {
            if (direction === 'complete') {
                direction = 'right';
            } else {
                return;
            }
        }

        this.finished = false;

        this.waxingWrapper = wrapper;
        this.waningWrapper = wrapper === 'large' ? 'small' : 'large';

        // if (wrapper === 'large') {
        //     this.width = oblio.settings.windowDimensions.width - 72;
        //     offset = 0;
        // } else {
        //     offset = oblio.settings.windowDimensions.width - 72 - this.elements.small.img.offsetWidth;
        // }

        switch (direction) {
            case 'left':
                this.leftWrapper = this.waningWrapper;
                this.rightWrapper = this.waxingWrapper;
                break;
            case 'right':
                this.rightWrapper = this.waningWrapper;
                this.leftWrapper = this.waxingWrapper;
                break;
            default:
                console.log('default');
        }

        if (this.rightWrapper === 'large') {
            this.width = this.fullwidth;
            offset = 0;
        } else {
            // this.width = this.elements.small.img.offsetWidth;
            offset = oblio.settings.windowDimensions.width - this.elements.small.img.offsetWidth;
        }

        this.elements.el.style.width = this.fullwidth + 'px';
        this.elements.el.style.height = this.height + 'px';

        this.elements[this.leftWrapper].inner.style.width = this.fullwidth + 'px';
        this.elements[this.rightWrapper].inner.style.width = this.fullwidth + 'px';

        this.elements[this.leftWrapper].outer.style.left = '0px';
        this.elements[this.leftWrapper].inner.style.left = '0px';
        this.elements[this.leftWrapper].outer.style.right = 'auto';
        this.elements[this.leftWrapper].inner.style.right = 'auto';
        
        this.elements[this.rightWrapper].outer.style.right = '0px';
        this.elements[this.rightWrapper].inner.style.right = '0px';

        if (this.rightWrapper === 'small') {
            this.elements[this.rightWrapper].img.style.marginLeft = '0px';
        } else {
            this.elements[this.rightWrapper].img.style.marginLeft = 'auto';
        }
        
        this.elements[this.rightWrapper].outer.style.left = 'auto';
        this.elements[this.rightWrapper].inner.style.left = 'auto';

    }

    function update (x) {
        var percent = Math.min(Math.max(0, (x - this.elements.el.offsetLeft) / this.fullwidth), 1),
            leftWidth = (percent * this.fullwidth),
            rightWidth = (this.fullwidth - percent * this.fullwidth);

        this.elements[this.leftWrapper].outer.style.width = leftWidth + 'px';
        this.elements[this.rightWrapper].outer.style.width = rightWidth + 'px';

        this.elements[this.leftWrapper].inner.style.width = this.fullwidth + 'px';
        this.elements[this.rightWrapper].inner.style.width = this.fullwidth + 'px';
    }

    function complete () {

        var offsetWidth = this.waxingWrapper === 'large' ? this.elements.large.outer.offsetWidth : this.elements.small.img.offsetWidth,
            offsetHeight = this.height;

        if (offsetWidth && offsetHeight) {
            this.changeTitle(this.waxingWrapper, 'complete');
            this.elements.el.style.width = offsetWidth + 'px';
            this.elements.el.style.height = (offsetHeight + 35) + 'px';
            // this.elements.el.style.width = this.width + 'px';
            // this.elements.el.style.height = (this.height + 35) + 'px';
            this.finished = true;
        }
        
    }

    function hide () {
        if (!this.isHidden) {
            this.isHidden = true;
            TweenLite.to(this.elements.el, 0.5, {left: -this.width + 'px', ease:Power3.easeInOut});
        }
    }

    function show () {
        if (this.isHidden) {
            this.isHidden = false;
            TweenLite.to(this.elements.el, 0.5, {left:'36px', ease:Power3.easeInOut});
        }
    }

    /* change height to height available for title */
    function resize (h) {
        h -= (17 + oblio.settings.footerHeight);

        if (isNaN(this.elements.large.ratio)) {
            this.elements.large.ratio = this.elements.large.img.offsetHeight / this.elements.large.img.offsetWidth;
        }

        if (isNaN(this.elements.small.ratio)) {
            this.elements.small.ratio = this.elements.small.img.offsetHeight / this.elements.small.img.offsetWidth;
        }

        this.fullwidth = oblio.settings.windowDimensions.width - 72;

        if (this.waxingWrapper === 'large') {

            var w = h / this.elements.large.ratio;
            
            // set the width to the full width for the large title, 
            // it's being centered with margin 0 auto
            this.width = this.fullwidth;

            this.elements.large.inner.style.width = this.width + 'px';
            this.elements.large.outer.style.width = this.width + 'px';

            if (!isNaN(this.elements.large.ratio)) {
                this.elements.large.outer.style.height = (this.width * this.elements.large.ratio) + 'px';
            }
            
            this.elements.small.release_date.style.left = (0.44 * 315 - this.elements.small.release_date.offsetWidth) + 'px';

        } else {
            var w = h / this.elements.small.ratio,
                max_width = 315;

            if (w > max_width) {
                w = max_width;
                h = w * this.elements.small.ratio;
            }

            this.width = w;

            this.elements.small.release_date.style.left = (0.44 * w - this.elements.small.release_date.offsetWidth) + 'px';

            this.elements.small.inner.style.width = w + 'px';
            this.elements.small.outer.style.width = w + 'px';
            this.elements.small.outer.style.height = h + 'px';
        }

        this.height = h;

        // this.elements.large.inner.style.height = this.height + 'px';
        this.elements.large.inner.style.height = 'auto';
        this.elements.large.inner.style.bottom = '0px';

        // this.elements.small.inner.style.height = this.height + 'px';
        this.elements.small.inner.style.height = 'auto';
        this.elements.small.inner.style.bottom = '0px';

        this.elements.el.style.width = this.width + 'px';
//        this.elements.el.style.height = (this.height + 35) + 'px';
        this.elements.el.style.height = $(this.elements.large.inner).height() + 'px';

    }

    function prepareReleaseDate () {
        var dateSrc = oblio.app.dataSrc.sections.shared.data.dates,
            today = new Date(),
            releaseDate = '',
            landingFontSize = false,
            innerFontSize = false;
        
        for (var i = 0; i< dateSrc.length; i++)
        {
            var dSrc = dateSrc[i];
            if (dSrc.date === 'default') {
                releaseDate = dSrc.label;
                landingFontSize = dSrc.landing_font_size;
                innerFontSize = dSrc.inner_font_size;
            } else {
                var d = new Date(Date.parse(dSrc.date))
                
                if (d <= today) {
                    releaseDate = dSrc.label;
                    landingFontSize = dSrc.landing_font_size;
                    innerFontSize = dSrc.inner_font_size;
                    break;
                }
            }
        }

        this.elements.large.release_date.innerHTML = releaseDate;
        if (landingFontSize) {
            this.elements.large.release_date.style.fontSize = landingFontSize;
        }

        this.elements.small.release_date.innerHTML = releaseDate;
        if (innerFontSize) {
            this.elements.small.release_date.style.fontSize = innerFontSize;
        }

    }

    TitleTreatment.prototype._prepareReleaseDate = prepareReleaseDate;

    TitleTreatment.prototype.init = init;
    TitleTreatment.prototype.hide = hide;
    TitleTreatment.prototype.show = show;
    TitleTreatment.prototype.changeTitle = changeTitle;
    TitleTreatment.prototype.update = update;
    TitleTreatment.prototype.complete = complete;
    TitleTreatment.prototype.resize = resize;

    return new TitleTreatment();
}));