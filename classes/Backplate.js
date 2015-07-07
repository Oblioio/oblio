define([
        'jquery'
    ], function ($) {

    var Backplate = function (bg, loaded, resizeContainer, mode) {

        this.data = bg;

        this.elements = {
            outer: document.createElement('div'),
            inner: document.createElement('div'),
            backplate: bg.el,
            resizeContainer: resizeContainer || false
        };

        this.container = this.elements.outer;

        this.settings = {
            h: bg.h,
            v: bg.v,
            ratio: this._getRatio(),
            mode: 'cover'
        };

        this.elements.inner.appendChild(this.elements.backplate);
        this.elements.outer.appendChild(this.elements.inner);

        // set loaded to true by default because most backplates will be preloaded with the section
        this.loaded = loaded === undefined ? true : loaded;
        this.onScreen = true;

        if (!this.loaded) {
            // this.elements.wrapper.className += ' loading';
            // this.elements.wrapper.style.display = 'none';

            $(this.elements.backplate).addClass('loading').on('load', this._onImageLoaded.bind(this));
        }

    };

    function getRatio () {
        var ratio = this.elements.backplate.height / this.elements.backplate.width;

        return ratio;
    }

    function onImageLoaded (e) {

        // this.elements.wrapper.className = this.elements.wrapper.className.replace('loading', '');
        
        this.resize();
        window.setTimeout(this.resize.bind(this), 100);

        // Only tween images that are visible and weren't preloaded, so we aren't tweening gallery images that are off screen
        if (this.onScreen && !this.loaded) {
            TweenLite.fromTo(this.elements.backplate, 0.5, {alpha: 0}, {alpha: 1});
        }
    }

    function resize(w, h){
        /*jshint validthis:true*/
        if(!w)w = this.container.offsetWidth;
        if(!h)h = this.container.offsetHeight;
        this.width = w;
        this.height = h;

        var imgWidth,
            imgHeight;

        if (this.data.dimensions) {
            imgWidth = this.data.dimensions.width;
            imgHeight = this.data.dimensions.height;
        } else {
            imgWidth = this.elements.backplate ? this.elements.backplate.offsetWidth : 0;
            imgHeight = this.elements.backplate ? this.elements.backplate.offsetHeight : 0;
        }

        var imgDimensions = {
            w: imgWidth,
            h: imgHeight
        },
        bg1Ratio = Math.max(w/imgDimensions.w, h/imgDimensions.h),
        bg1AdjustedWidth = (imgDimensions.w*bg1Ratio),
        bg1AdjustedHeight = (imgDimensions.h*bg1Ratio),

        paddingW = 0,
        paddingH = 0,

        bgOffsetLeftMin = -paddingW/2,
        bg1OffsetLeftMax = ((w-bg1AdjustedWidth)+(paddingW/2))-bgOffsetLeftMin,

        bgOffsetTopMin = -paddingH/2,
        bg1OffsetTopMax = ((h-bg1AdjustedHeight)+(paddingH/2))-bgOffsetTopMin;

        if(this.elements.backplate){
            this.elements.backplate.style.top = (bgOffsetTopMin+(bg1OffsetTopMax*this.data.v)).toFixed() + 'px';
            this.elements.backplate.style.left = (bgOffsetLeftMin+(bg1OffsetLeftMax*this.data.h)).toFixed() + 'px';
            this.elements.backplate.style.width = bg1AdjustedWidth+'px';
            this.elements.backplate.style.height = bg1AdjustedHeight+'px';
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