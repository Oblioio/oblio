define([
        'oblio/classes/BG_Image',
        'oblio/classes/BG_Video',
        'oblio/classes/Backplate',
        'greensock/TweenLite.min',
        'greensock/easing/EasePack.min',
        'greensock/plugins/CSSPlugin.min'
    ], function (BG_Image, BG_Video, Backplate) {

    var cantransform3d = Modernizr.csstransforms3d,
        transformPrefixed = cantransform3d ? Modernizr.prefixed('transform') : '',
        isMobile,
        useFallbackImage,
        slide_ids = {};

    var SlideShow = function (data) {

        var el = data.el || data;

        this.close_fn = data.close_fn || false;
        this.axis = data.axis || 'x'; // direction to animate
        this.duration = data.duration || 0.75; // speed of animation
        this.rotate = data.rotate || false;
        this.rotation_delay = data.rotation_delay || 3000; // switch slide every 3 seconds
        this.activeSlides = [];

        this.dragPosition = {};
        this.dragOffset = {};
        this.state = {};

        isMobile = oblio.settings.isMobile;
        useFallbackImage = isMobile || oblio.settings.isIOS;

        this.slides = [];

        this.nextSlideshow = data.nextSlideshow || false;
        this.previousSlideshow = data.previousSlideshow || false;

        this.elements = {
            wrapper: el,
            resizeContainer: data.resizeContainer || document.body,
            paginator_container: data.paginator_container || el
        };

        this.slideDimensions = {
            w: $(this.elements.resizeContainer).width(),
            h: $(this.elements.resizeContainer).height()
        };

        var prev_btn = document.getElementsByClassName('prev_slide');
        if (prev_btn.length > 0) {
            this.elements.prev = prev_btn[0];
        } else {
            this.elements.prev = document.createElement('a');
            this.elements.prev.href = '#';
            this.elements.prev.className = 'prev_slide';
            this.elements.paginator_container.appendChild(this.elements.prev);
        }

        var next_btn = document.getElementsByClassName('next_slide');
        if (next_btn.length > 0) {
            this.elements.next = next_btn[0];
        } else {
            this.elements.next = document.createElement('a');
            this.elements.next.href = '#';
            this.elements.next.className = 'next_slide';
            this.elements.paginator_container.appendChild(this.elements.next);
        }

        var headerHeight = data.fullBleed || data.ignoreHeader ? 0 : oblio.settings.headerHeight,
            footerHeight = data.fullBleed || data.ignoreFooter ? 0 : oblio.settings.footerHeight;

        this.settings = {
            headerHeight: headerHeight,
            footerHeight: footerHeight,
            mode: data.mode || 'cover'
        };

        this.animationState = {};

        this.buildSlideshow(data.slides);
    };

    function addEventHandlers () {
        var _wrapper = $(this.elements.wrapper),
            _paginator_container = $(this.elements.paginator_container),
            _window = $(window);

        if (this.slides.length > 1) {
            _paginator_container.on('click', 'a', clickHandler.bind(this));

            _wrapper.on('mousedown', mouseDown.bind(this));
            _wrapper.on('mousemove', mouseMove.bind(this));
            _window.on('mouseup', mouseUp.bind(this));

            _wrapper.on('touchstart', touchStart.bind(this));
            _wrapper.on('touchmove', touchMove.bind(this));
            _wrapper.on('touchend', touchEnd.bind(this));
        } else {
            _wrapper.addClass('disabled');
        }

    }

    function startDrag (pageX, pageY) {
        if (this.dragging || this.state.animating) {
            return false;
        }

        this.dragging = true;
        this.moved = false;

        // currently dragOffset is the same as the mouse position on the screen
        // will need to fix this for slideshows that are not full-browser
        this.dragOffset.x = this.dragPosition.x = pageX;
        this.dragOffset.y = this.dragPosition.y = pageY;

        /*
        * Call drag once to get slides into position before setting display
        * to block to avoid flash of slides that are supposed to be offscreen
        */
        this.drag(pageX, pageY);

        activate.call(this, this.state.previous_index);

        activate.call(this, this.state.next_index);
    }

    function drag (pageX, pageY) {
        if (!this.dragging) {
            return false;
        }

        if (this.dragPosition.lastX) {
            this.moved = true;
        }

        this.dragPosition.x = pageX;
        this.dragPosition.y = pageY;

        var targetLeft = (this.dragPosition.x - this.dragOffset.x),
            leftSlide = this.slides[this.state.previous_index],
            currSlide = this.slides[this.state.current_index],
            rightSlide = this.slides[this.state.next_index];

        this.dragPosition.velocity = this.dragPosition.x - this.dragPosition.lastX;
        this.dragPosition.lastX = this.dragPosition.x;

        positionSlides([
            {
                slide: currSlide,
                targetLeft: targetLeft
            },
            {
                slide: leftSlide,
                targetLeft: targetLeft - currSlide.elements.outer.offsetWidth
            },
            {
                slide: rightSlide,
                targetLeft: targetLeft + currSlide.elements.outer.offsetWidth
            }
        ]);

    }

    /**
    * For some reason Firefox has some weird rendering issues with translate3d 
    * where the bottom half of the image won't show up, so use 'left' for now
    * Seems like a FF bug -- that will be fixed in the next release
    */
    function positionSlides (slides) {
        for (var i = slides.length - 1; i >= 0; i--) {
            slides[i].slide.elements.outer.style.left = slides[i].targetLeft.toFixed(2) + 'px';
        }
    }

    function stopDrag (pageX, pageY) {
        if (!this.dragging) {
            return false;
        }

        this.dragPosition.lastX = null;

        if (!this.moved) {
            this.dragging = false;
            return false;
        }

        this.dragPosition.x = pageX;
        this.dragPosition.y = pageY;

        this.dragging = false;

        var change = this.dragPosition.x - this.dragOffset.x,
            velocity = this.dragPosition.velocity,
            direction;

        this.animationState = {
            currX: this.dragPosition.x,
            currVelocity: Math.abs(this.dragPosition.velocity) < 5 ? change / Math.abs(change) : this.dragPosition.velocity
        };

        if (change > 20) {
            // last drag velocity can override the overall change in position
            if (this.dragPosition.velocity < -5) {
                this.animationState.otherSlide = this.slides[this.state.previous_index];
                this.animationState.otherSlideX = -this.slides[this.state.current_index].elements.outer.offsetWidth;
                direction = 'next';
            } else {
                direction = 'previous';
            }
        } else if (change < -20) {
            // last drag velocity can override the overall change in position
            if (this.dragPosition.velocity > 5) {
                this.animationState.otherSlide = this.slides[this.state.next_index];
                this.animationState.otherSlideX = this.slides[this.state.current_index].elements.outer.offsetWidth;
                direction = 'previous';
            } else {
                direction = 'next';
            }
        } else {
            this.animationState.currVelocity = change > 0 ? -1 : 1;
            this.animationState.currSlide = this.slides[this.state.current_index];
            this.animationState.lastSlide = change > 0 ? this.slides[this.state.previous_index] : this.slides[this.state.next_index];
            this.animationState.lastSlideX = change > 0 ? this.dragPosition.x - this.dragOffset.x + this.animationState.currSlide.elements.outer.offsetWidth : this.dragPosition.x - this.dragOffset.x + this.animationState.currSlide.elements.outer.offsetWidth;
            this.animationState.currSlideX = this.dragPosition.x - this.dragOffset.x;
            window.requestAnimationFrame(animate.bind(this));
            return;
        }

        if (direction === 'next') {
            this.next();
        } else if (direction === 'previous') {
            this.previous();
        }
    }

    function mouseDown (e) {
        if (!this.dragging) {
            this.elements.wrapper.className = this.elements.wrapper.className + ' dragging';
        }
        this.startDrag(e.pageX, e.pageY);
        return false;
    }

    function mouseMove (e) {
        this.drag(e.pageX, e.pageY);
        return false;
    }

    function mouseUp (e) {
        this.elements.wrapper.className = this.elements.wrapper.className.replace(/dragging|\s/g, '');
        this.stopDrag(e.pageX, e.pageY);
        return false;
    }

    function touchStart (e) {
        var touch = e.originalEvent.touches[0];
        this.startDrag(touch.pageX, touch.pageY);
        return false;
    }

    function touchMove (e) {
        var touch = e.originalEvent.touches[0];
        this.drag(touch.pageX, touch.pageY);
        return false;
    }

    function touchEnd (e) {
        var touch = e.originalEvent.changedTouches[0];
        this.stopDrag(touch.pageX, touch.pageY);
        return false;
    }

    function bgImgReady () {
        console.log('imgready');
    }

    function bgVidReady (vid) {
        console.log('vidready');
    }

    function buildSlideshow (slides) {

        var bg,
            slidesFrag = document.createDocumentFragment(),
            slide,
            i;

        for (i = 0; i < slides.length; i++) {
            if (slides[i].visible === false) {
                continue;
            }
            switch (slides[i].type) {
                case 'image':
                    bg = new BG_Image(slides[i], bgImgReady);
                    break;
                case 'htmlVideo':
                case 'youtube':
                    if (oblio.utils.DeviceDetect.isMobile || oblio.utils.DeviceDetect.isAndroid || oblio.utils.DeviceDetect.isIpad || !document.createElement('video').canPlayType) {
                        slides[i].url = slides[i].fallback;
                        bg = new BG_Image(slides[i], bgImgReady);
                    } else {
                        bg = new BG_Video(slides[i], bgVidReady);
                    }
                    break;
                default:
                    bg = new BG_Image(slides[i], bgImgReady.bind(this));
                    break;
            }

            slide = new Backplate(bg, false, this.elements.wrapper, this.settings.mode);

            /*
            * TODO: i'm just adding these classes because they were there before, 
            * prob won't need them once i go through the css and js and clean up
            */
            slide.elements.outer.className = slide.elements.outer.className + ' slide';
            slide.elements.inner.className = slide.elements.inner.className + ' backplate_wrapper';
            bg.el.className = bg.el.className + ' backplate';

            slidesFrag.appendChild(slide.elements.outer);

            this.slides.push(slide);
        }

        this.elements.wrapper.appendChild(slidesFrag);

        if (slides.length <= 1) {
            this.elements.prev.parentNode.removeChild(this.elements.prev);
            this.elements.next.parentNode.removeChild(this.elements.next);
        }

        this.state = {
            current_index: 0,
            last_index: this.slides.length - 1,
            direction: 'left',
            animating: false
        };

        // previous and next index keep track of the slides to the left and right of current slide for touch
        this.state.previous_index = this.state.last_index;
        this.state.next_index = Math.min(1, this.state.previous_index);

        this.elements.wrapper.style.top = this.settings.headerHeight + 'px';

        if (this.close_fn) {
            this.close = close_fn;

            this.elements.close_btn = document.createElement('a');
            this.elements.close_btn.href = '#';
            this.elements.close_btn.className = 'close';

            this.elements.wrapper.appendChild(this.elements.close_btn);


            $(this.elements.close_btn).on('click', this.close);
        }

        if (this.slides.length > 0) {
            this.slides[this.state.current_index].onScreen = true;
            activate.call(this, this.state.current_index);
            // this.slides[this.state.current_index].elements.outer.style.display = 'block';

            positionSlides([
                {
                    slide: this.slides[this.state.current_index],
                    targetLeft: 0
                },
                {
                    slide: this.slides[this.state.last_index],
                    targetLeft: -this.slides[this.state.last_index].elements.outer.offsetWidth
                }
            ]);

        }

        if (this.rotate) {
            if (this.timer) {
                window.clearInterval(this.timer);
            }
            this.timer = window.setInterval(this.next.bind(this), this.rotation_delay);
        }

        this.addEventHandlers();
        this.resize();
    }

    function go (instant) {
        this.state.animating = true;

        if (instant) {
            this.animationState.currSlideX = 0;
            this.animationState.lastSlideX = this.animationState.currSlide.elements.outer.offsetWidth;
        }
        window.requestAnimationFrame(animate.bind(this));
    }

    function next () {
        if (this.state.animating) {
            return;
        }

        if (this.nextSlideshow) {
            if (this.state.current_index + 1 >= this.slides.length) {
                this.nextSlideshow();
                return;
            }
        }

        this.animationState.currSlide = this.slides[this.state.next_index];
        this.animationState.lastSlide = this.slides[this.state.current_index];
        this.animationState.lastSlideX = this.dragPosition.x - this.dragOffset.x;
        this.animationState.currSlideX = this.dragPosition.x - this.dragOffset.x + this.animationState.currSlide.elements.outer.offsetWidth;

        this.state.last_index = this.state.current_index;

        if (this.state.current_index + 1 < this.slides.length) {
            this.state.current_index = this.state.current_index + 1;
        } else {
            this.state.current_index = 0;
        }

        this._updateState();

        this.state.direction = 'left';
        this._go();
    }

    function previous () {
        if (this.state.animating) {
            return;
        }

        if (this.previousSlideshow) {
            if (this.state.current_index - 1 < 0) {
                this.previousSlideshow();
                return;
            }
        }

        this.animationState.lastSlide = this.slides[this.state.current_index];
        this.animationState.currSlide = this.slides[this.state.previous_index];
        this.animationState.lastSlideX = this.dragPosition.x - this.dragOffset.x;
        this.animationState.currSlideX = this.dragPosition.x - this.dragOffset.x - this.animationState.currSlide.elements.outer.offsetWidth;

        this.state.last_index = this.state.current_index;

        if (this.state.current_index - 1 >= 0) {
            this.state.current_index = this.state.current_index - 1;
        } else {
            this.state.current_index = this.slides.length - 1;
        }

        this._updateState();

        this.state.direction = 'right';
        this._go();
    }

    function animate () {

        var direction = this.animationState.currVelocity > 0 ? 1 : -1,
            change = Math.min(Math.abs(this.animationState.currVelocity), Math.abs(this.animationState.currSlideX) / 5) * direction,
            slides = [
                {
                    slide: this.animationState.lastSlide,
                    targetLeft: this.animationState.lastSlideX
                },
                {
                    slide: this.animationState.currSlide,
                    targetLeft: this.animationState.currSlideX
                }
            ];

        this.animationState.lastSlideX += change;
        this.animationState.currSlideX += change;

        this.animationState.currVelocity *= 1.25;

        if (this.animationState.otherSlide) {
            slides.push({
                            slide: this.animationState.otherSlide,
                            targetLeft: this.animationState.otherSlideX
                        });
        }
        positionSlides(slides);

        if (direction === -1 && this.animationState.currSlideX > 1 || direction === 1 && this.animationState.currSlideX < -1) {
            window.requestAnimationFrame(animate.bind(this));
        } else {
            if (this.animationState.currSlideX === 0) {
                this.animationState.otherSlide = null;
                this.state.animating = false;
                onTransitionComplete.call(this);
            } else {
                this.animationState.currSlideX = 0;
                this.animationState.currVelocity = 0;
                window.requestAnimationFrame(animate.bind(this));
            }
        }

    }

    function goToIndex (i) {
        if (this.state.animating) {
            return;
        }

        this.state.direction = i > this.state.current_index ? 'left' : 'right';

        if (this.state.direction === 'left') {
            this.animationState.currVelocity = -1;
            this.animationState.lastSlide = this.slides[this.state.current_index];
            this.animationState.lastSlideX = 0;
            this.animationState.currSlide = this.slides[i];
            this.animationState.currSlideX = this.animationState.lastSlide.elements.outer.offsetWidth;
        } else if (this.state.direction === 'right') {
            this.animationState.currVelocity = 1;
            this.animationState.lastSlide = this.slides[this.state.current_index];
            this.animationState.lastSlideX = 0;
            this.animationState.currSlide = this.slides[i];
            this.animationState.currSlideX = -this.animationState.lastSlide.elements.outer.offsetWidth;
        }

        // this.animationState.currSlide.elements.outer.style.display = 'block';
        activate.call(this, this.state.current_index);

        this.state.last_index = this.state.current_index;
        this.state.current_index = i;
        this._updateState();

        this._go();
    }

    function goToId (id, instant) {

        if (this.state.animating) {
            return;
        }

        var i = slide_ids[id];

        this.state.direction = 'left';
        this.state.last_index = this.state.current_index;
        this.state.current_index = i;
        this._updateState();

        this._go(instant);
    }

    function resize (width, height) {

        if (this.slides.length === 0) {
            return;
        }

        var w = width,
            h = height,
            wrapper = this.elements.wrapper,
            currSlide = this.slides[this.state.current_index];

        if (w === undefined || h === undefined) {
            if (this.elements.resizeContainer) {
                w = this.elements.resizeContainer.offsetWidth;
                h = this.elements.resizeContainer.offsetHeight;
            } else {
                w = oblio.settings.windowDimensions.width;
                h = oblio.settings.windowDimensions.height - (this.settings.headerHeight + this.settings.footerHeight);
            }
        }

        this.slideDimensions = {
            w: w,
            h: h
        };

        wrapper.style.height = h + 'px';

        for (var i = this.slides.length - 1; i >= 0; i--) {
            if (i !== this.state.current_index) {
                this.slides[i].needsUpdate = true;
            }
        }

        currSlide.resize(w,h);
    }

    function updateState () {
        this.state.previous_index = this.state.current_index - 1;
        if (this.state.previous_index < 0) {
            this.state.previous_index = this.slides.length - 1;
        }

        this.state.next_index = this.state.current_index + 1;
        if (this.state.next_index > this.slides.length - 1) {
            this.state.next_index = 0;
        }

        var w = oblio.settings.windowDimensions.width,
            h = oblio.settings.windowDimensions.height;

        this.slides[this.state.current_index].resize();
        this.slides[this.state.previous_index].resize();
        this.slides[this.state.next_index].resize();
    }

    function reset (go) {

        for (var i = this.slides.length - 1; i >= 0; i--) {
            if (this.slides[i].video_player) {
                this.slides[i].video_player.reset();
            }
        }

        this.state.current_index = 0;

        this.state.last_index = this.slides.length - 1;
        this.state.previous_index = this.state.last_index;
        this.state.next_index = Math.min(1, this.state.previous_index);

        if (go) {
            this._go('instant');
        }

        this.resize();
    }

    function onTransitionComplete () {
        var i;
        while (this.activeSlides.length) {
            i = this.activeSlides.pop();
            if (i !== this.state.current_index) {
                this.slides[i].elements.outer.className = this.slides[i].elements.outer.className.replace(' active', '');
                if (this.slides[i].obj.el.pause) {
                    this.slides[i].obj.el.pause();
                }
            }
        }
        this.activeSlides.push(this.state.current_index);
    }

    function clickHandler (e) {
        var clicked = e.currentTarget;

        switch (clicked.className) {
        case 'prev_slide': // left arrow
            if (this.state.animating) {
                return false;
            }
            this.dragPosition.x = 0;
            this.dragOffset.x = 0;
            this.animationState.currVelocity = 1;
            this.slides[this.state.next_index].elements.outer.style.left = '4000px'; // the 4000px is a hack to workaround firefox bug that causes slide to flash before animating
            activate.call(this, this.state.previous_index);
            
            this.previous();
            return false;
        case 'next_slide': // right arrow
            if (this.state.animating) {
                return false;
            }
            this.dragPosition.x = 0;
            this.dragOffset.x = 0;
            this.animationState.currVelocity = -1;
            this.slides[this.state.next_index].elements.outer.style.left = '4000px'; // the 4000px is a hack to workaround firefox bug that causes slide to flash before animating
            activate.call(this, this.state.next_index);
            this.next();
            return false;
        default:
            // nothin'
        }
    }

    function activate (slideIndex) {
        var slide = this.slides[slideIndex],
            slideEl = slide.elements.outer;

        if (!slideEl.className.match('active')) {
            slideEl.className = slideEl.className + ' active';
            if (slide.needsUpdate) {
                slide.resize(this.slideDimensions.w, this.slideDimensions.h);
                slide.needsUpdate = false;
            }
            if (slide.obj.el.play) {
                slide.obj.el.play();
            }
        }

        if (this.activeSlides.indexOf(slideIndex) === -1) {
            this.activeSlides.push(slideIndex);
        }
    }

    function keyHandler (e) {
        switch (e.keyCode) {
        case 37: // left arrow
            if (this.state.animating) {
                return;
            }
            this.dragPosition.x = 0;
            this.dragOffset.x = 0;
            this.animationState.currVelocity = 1;
            this.slides[this.state.next_index].elements.outer.style.left = '4000px'; // the 4000px is a hack to workaround firefox bug that causes slide to flash before animating
            activate.call(this, this.state.previous_index);
            this.previous();
            break;
        case 39: // right arrow
            if (this.state.animating) {
                return;
            }
            this.dragPosition.x = 0;
            this.dragOffset.x = 0;
            this.animationState.currVelocity = -1;

            this.slides[this.state.next_index].elements.outer.style.left = '4000px'; // the 4000px is a hack to workaround firefox bug that causes slide to flash before animating
            activate.call(this, this.state.next_index);
            this.next();
            break;
        default:
            // nothin'
        }
    }

    function enter () {
        if (this.rotate) {
            if (this.timer) {
                window.clearInterval(this.timer);
            }
            this.timer = window.setInterval(this.next.bind(this), this.rotation_delay);
        }
    }

    function exit () {
        if (this.timer) {
            window.clearInterval(this.timer);
        }
    }

    SlideShow.prototype._go = go;
    SlideShow.prototype._updateState = updateState;

    SlideShow.prototype.buildSlideshow = buildSlideshow;
    SlideShow.prototype.reset = reset;
    SlideShow.prototype.keyHandler = keyHandler;
    SlideShow.prototype.next = next;
    SlideShow.prototype.previous = previous;
    SlideShow.prototype.goToId = goToId;
    SlideShow.prototype.goToIndex = goToIndex;
    SlideShow.prototype.resize = resize;
    SlideShow.prototype.onTransitionComplete = onTransitionComplete;

    SlideShow.prototype.enter = enter;
    SlideShow.prototype.exit = exit;

    SlideShow.prototype.addEventHandlers = addEventHandlers;
    SlideShow.prototype.mouseDown = mouseDown;
    SlideShow.prototype.mouseMove = mouseMove;
    SlideShow.prototype.mouseUp = mouseUp;
    SlideShow.prototype.touchStart = touchStart;
    SlideShow.prototype.touchMove = touchMove;
    SlideShow.prototype.touchEnd = touchEnd;
    SlideShow.prototype.startDrag = startDrag;
    SlideShow.prototype.drag = drag;
    SlideShow.prototype.stopDrag = stopDrag;

    window.oblio = window.oblio || {};
    oblio.classes = oblio.classes || {};
    oblio.classes.SlideShow = SlideShow;

    return oblio.classes.SlideShow;
});
