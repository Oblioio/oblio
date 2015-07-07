define([
        'jquery'
    ], function ($) {

    var Backplate = function (el, loaded, resizeContainer, mode) {

        this.elements = {
            wrapper: el,
            backplate: $(el).find('.backplate')[0],
            resizeContainer: resizeContainer || false
        };

        var backplateMode = this.elements.backplate.getAttribute('data-mode');

        if (!backplateMode) {
            backplateMode = mode || 'cover';
        }

        this.settings = {
            anchor: this.elements.backplate.getAttribute('data-anchor'),
            ratio: this._getRatio(),
            mode: backplateMode
        };

        // set loaded to true by default because most backplates will be preloaded with the section
        this.loaded = loaded === undefined ? true : loaded;
        this.onScreen = true;

        if (!this.loaded) {
            this.elements.wrapper.className += ' loading';
            this.elements.wrapper.style.display = 'none';

            $(this.elements.backplate).addClass('loading').on('load', this._onImageLoaded.bind(this));
        }

    };

    function getRatio () {
        var ratio = this.elements.backplate.height / this.elements.backplate.width;

        return ratio;
    }

    function onImageLoaded (e) {

        this.elements.wrapper.className = this.elements.wrapper.className.replace('loading', '');
        
        this.resize();
        window.setTimeout(this.resize.bind(this), 100);

        // Only tween images that are visible and weren't preloaded, so we aren't tweening gallery images that are off screen
        if (this.onScreen && !this.loaded) {
            TweenLite.fromTo(this.elements.backplate, 0.5, {alpha: 0}, {alpha: 1});
        }
    }

    function resize (w, h) {

        var backplate = this.elements.backplate,
            backplate_wrapper = this.elements.wrapper,
            anchor = this.settings.anchor,
            leftpos,
            toppos,
            bw = w,
            bh = h,
            current_ratio = this._getRatio();
        
        // current_ratio = 478/852;
        if (w === undefined || h === undefined) {
            if (this.elements.resizeContainer) {
                console.log('this.elements.resizeContainer ', this.elements.resizeContainer.offsetWidth, this.elements.resizeContainer.offsetHeight);
                w = this.elements.resizeContainer.offsetWidth;
                h = this.elements.resizeContainer.offsetHeight;
            } else {
                console.log('oblio.settings.windowDimensions.width & height ', oblio.settings.windowDimensions.width, oblio.settings.windowDimensions.height);
                w = oblio.settings.windowDimensions.width;
                h = oblio.settings.windowDimensions.height - (oblio.settings.headerHeight + oblio.settings.footerHeight);
                backplate_wrapper.style.top = oblio.settings.headerHeight + 'px';
            }
        }

        if (isNaN(current_ratio) || current_ratio === 0 || w === 0 || h === 0) {
            return;
        }

        backplate_wrapper.style.width = w + 'px';
        backplate_wrapper.style.height = h + 'px';

        /**
        * set height and width based on ratio
        */
        // if tall image
        if (current_ratio > 1) {

            if (this.settings.mode === 'contain') {
                // if wide image
                if (h / w > current_ratio) {
                    // window is tall
                    bw = w;
                    bh = bw * current_ratio;
                } else {
                    // window is wide
                    bh = h;
                    bw = bh / current_ratio;
                }
            } else {
                bh = h;
                bw = bh / current_ratio;
            }

            backplate.style.width = bw + 'px';
            backplate.style.height = bh + 'px';

        } else {
            if (this.settings.mode === 'contain') {
                // if wide image
                if (h / w > current_ratio) {
                    // window is tall
                    bw = w;
                    bh = bw * current_ratio;
                } else {
                    // window is wide
                    bh = h;
                    bw = bh / current_ratio;
                }
            } else {
                // if wide image
                if (h / w > current_ratio) {
                    // window is tall
                    bh = h;
                    bw = bh / current_ratio;
                } else {
                    // window is wide
                    bw = w;
                    bh = bw * current_ratio;
                }
            }

            backplate.style.width = bw + 'px';
            backplate.style.height = bh + 'px';
        }

        switch (anchor) {
            case 't':
                toppos = 0;
                leftpos = (w - bw) / 2;
                break;
            case 'l':
                toppos = (h - bh) / 2;
                leftpos = 0;
                break;
            case 'tl':
                toppos = 0;
                leftpos = 0;
                break;
            case 'r':
                toppos = (h - bh) / 2;
                leftpos = w - bw;
                break;
            case 'tr':
                toppos = 0;
                leftpos = w - bw;
                break;
            case 'b':
                toppos = h - bh;
                leftpos = (w - bw) / 2;
                break;
            case 'bl':
                toppos = h - bh;
                leftpos = 0;
                break;
            case 'br':
                toppos = h - bh;
                leftpos = w - bw;
                break;
            default:
                toppos = (h - bh) / 2;
                leftpos = (w - bw) / 2;
        }

        /**
        * set top and left based on anchor
        */
        backplate.style.left = leftpos + 'px';
        backplate.style.top = toppos + 'px';

        var size_obj = {
            width: bw,
            height: bh,
            left: leftpos,
            top: toppos
        };

        return size_obj;

    }

    function resize2 (w, h) {
        /*jshint validthis:true*/

        w = w || this.container.offsetWidth;
        h = h || this.container.offsetHeight;

        this.width = w;
        this.height = h;

        var imgWidth,
            imgHeight;

        if (this.image1.obj) {
            if (this.image1.obj.dimensions) {
                img1width = this.image1.obj.dimensions.width;
                img1height = this.image1.obj.dimensions.height;
            } else {
                img1width = this.image1.image ? this.image1.image.offsetWidth : 0;
                img1height = this.image1.image ? this.image1.image.offsetHeight : 0;
            }
        }

        if (this.image2.obj) {
            if (this.image2.obj.dimensions) {
                img2width = this.image2.obj.dimensions.width;
                img2height = this.image2.obj.dimensions.height;
            } else {
                img2width = this.image2.image ? this.image2.image.offsetWidth : 0;
                img2height = this.image2.image ? this.image2.image.offsetHeight : 0;
            }
        }

        var img1Dimensions = {
            w: img1width,
            h: img1height
        },
        bg1Ratio = Math.max(w/img1Dimensions.w, h/img1Dimensions.h),
        bg1AdjustedWidth = (img1Dimensions.w*bg1Ratio),
        bg1AdjustedHeight = (img1Dimensions.h*bg1Ratio),

        img2Dimensions = {
            w: img2width,
            h: img2height
        },
        bg2Ratio = Math.max(w/img2Dimensions.w, h/img2Dimensions.h),
        bg2AdjustedWidth = (img2Dimensions.w*bg2Ratio),
        bg2AdjustedHeight = (img2Dimensions.h*bg2Ratio),

        paddingW = 0,
        paddingH = 0,

        bgOffsetLeftMin = -paddingW/2,
        bg1OffsetLeftMax = ((w-bg1AdjustedWidth)+(paddingW/2))-bgOffsetLeftMin,
        bg2OffsetLeftMax = ((w-bg2AdjustedWidth)+(paddingW/2))-bgOffsetLeftMin,

        bgOffsetTopMin = -paddingH/2,
        bg1OffsetTopMax = ((h-bg1AdjustedHeight)+(paddingH/2))-bgOffsetTopMin,
        bg2OffsetTopMax = ((h-bg2AdjustedHeight)+(paddingH/2))-bgOffsetTopMin;

        if(this.image1.image){
            this.image1.image.style.top = (bgOffsetTopMin+(bg1OffsetTopMax*this.image1.obj.v)).toFixed() + 'px';
            this.image1.image.style.left = (bgOffsetLeftMin+(bg1OffsetLeftMax*this.image1.obj.h)).toFixed() + 'px';
            this.image1.image.style.width = bg1AdjustedWidth+'px';
            this.image1.image.style.height = bg1AdjustedHeight+'px';
        }
        if(this.image2.image){
            this.image2.image.style.top = (bgOffsetTopMin+(bg2OffsetTopMax*this.image2.obj.v)).toFixed() + 'px';
            this.image2.image.style.left = (bgOffsetLeftMin+(bg2OffsetLeftMax*this.image2.obj.h)).toFixed() + 'px';
            this.image2.image.style.width = bg2AdjustedWidth+'px';
            this.image2.image.style.height = bg2AdjustedHeight+'px';
        }
    }

    Backplate.prototype._onImageLoaded = onImageLoaded;
    Backplate.prototype._getRatio = getRatio;

    Backplate.prototype.resize = resize;

    window.oblio = window.oblio || {};
    oblio.classes = oblio.classes || {};
    oblio.classes.Backplate = Backplate;

    return oblio.classes.Backplate;
});