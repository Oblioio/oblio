define([], function () {

    var Backplate = function (bg, loaded, resizeContainer, mode) {

        // set loaded to true by default because most backplates will be preloaded with the section
        this.loaded = loaded === undefined ? true : loaded;

        this.elements = {
            outer: document.createElement('div'),
            inner: document.createElement('div'),
            resizeContainer: resizeContainer || false
        };

        this.container = this.elements.outer;

        if (bg) {
            changeImage.call(this, bg);
        }

        this.elements.outer.appendChild(this.elements.inner);
    };

    function changeImage (bg) {
        if (bg.img === false) {
            return;
        }

        if (this.obj) {
            this.obj.destroy();
        }
        
        this.obj = bg;
        this.elements.backplate = bg.el;

        this.settings = {
            h: bg.h,
            v: bg.v,
            ratio: this._getRatio(),
            mode: bg.mode || 'cover'
        };

        var node = this.elements.inner;
        while (node.lastChild) {
            node.removeChild(node.lastChild);
        }

        this.elements.backplate = bg.el;
        this.elements.inner.appendChild(this.elements.backplate);

        this.onScreen = true;

        if (!this.loaded) {
            // this.elements.wrapper.className += ' loading';
            // this.elements.wrapper.style.display = 'none';

            $(this.elements.backplate).addClass('loading').on('load', this._onImageLoaded.bind(this));
        }
    }

    function getRatio () {
        if (!this.elements.backplate) {
            return 1;
        }
        
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
        if (!this.obj) {
            return;
        }

        /*jshint validthis:true*/
        var rect;
        if (!w || !h) {
            // if width & height are not passed, use the resizeContainer, if resizeContainer is not provided, use container;
            rect = this.elements.resizeContainer ? this.elements.resizeContainer.getBoundingClientRect(): this.elements.container.getBoundingClientRect();
            w = rect.width;
            h = rect.height;
        }

        var imgWidth,
            imgHeight;

        if (this.obj.dimensions) {
            imgWidth = this.obj.dimensions.width;
            imgHeight = this.obj.dimensions.height;
        } else {
            imgWidth = this.elements.backplate ? this.elements.backplate.offsetWidth : 0;
            imgHeight = this.elements.backplate ? this.elements.backplate.offsetHeight : 0;
        }

        var imgDimensions = {
            w: imgWidth,
            h: imgHeight
        },
        bg1Ratio = this.settings.mode === 'contain' ? Math.min(w/imgDimensions.w, h/imgDimensions.h) : Math.max(w/imgDimensions.w, h/imgDimensions.h),
        bg1AdjustedWidth = (imgDimensions.w*bg1Ratio),
        bg1AdjustedHeight = (imgDimensions.h*bg1Ratio),

        paddingW = 0,
        paddingH = 0,

        bgOffsetLeftMin = -paddingW/2,
        bg1OffsetLeftMax = ((w-bg1AdjustedWidth)+(paddingW/2))-bgOffsetLeftMin,

        bgOffsetTopMin = -paddingH/2,
        bg1OffsetTopMax = ((h-bg1AdjustedHeight)+(paddingH/2))-bgOffsetTopMin;

        if(this.elements.backplate){
            this.elements.backplate.style.top = (bgOffsetTopMin+(bg1OffsetTopMax*this.obj.v)).toFixed() + 'px';
            this.elements.backplate.style.left = (bgOffsetLeftMin+(bg1OffsetLeftMax*this.obj.h)).toFixed() + 'px';
            this.elements.backplate.style.width = bg1AdjustedWidth+'px';
            this.elements.backplate.style.height = bg1AdjustedHeight+'px';
        }

    }

    Backplate.prototype._onImageLoaded = onImageLoaded;
    Backplate.prototype._getRatio = getRatio;

    Backplate.prototype.resize = resize;
    Backplate.prototype.changeImage = changeImage;

    window.oblio = window.oblio || {};
    oblio.classes = oblio.classes || {};
    oblio.classes.Backplate = Backplate;

    return oblio.classes.Backplate;
});