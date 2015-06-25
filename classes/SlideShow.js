// UMD (Universal Module Definition) patterns for JavaScript modules that work everywhere.
// https://github.com/umdjs/umd/blob/master/amdWebGlobal.js

;(function (root, factory) {
    // Browser globals
    root.classes = root.classes || {};

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
                'jquery',
                'oblio/classes/Paginator',
                'oblio/classes/Backplate',
                // 'oblio/classes/VideoBackplate',
                'greensock/TweenLite.min',
                'greensock/easing/EasePack.min',
                'greensock/plugins/CSSPlugin.min'
            ], function ($) {
            return (root.classes.SlideShow = factory($));
        });
    } else {
        root.classes.SlideShow = factory($);
    }
}(window.oblio = window.oblio || {}, function ($) {

    var cantransform3d = Modernizr.csstransforms3d,
        transformPrefixed = cantransform3d ? Modernizr.prefixed('transform') : '',
        isMobile,
        useFallbackImage,
        slide_ids = {};

    var SlideShow = function (data) {

        var el = data.el || data;

        this.close_fn = data.close_fn || false;
        this.paginator = data.paginator;
        this.axis = data.axis || 'x'; // direction to animate
        this.duration = data.duration || 0.75; // speed of animation
        this.rotate = data.rotate || false;
        this.rotation_delay = data.rotation_delay || 3000; // switch slide every 3 seconds

        this.dragPosition = {};
        this.dragOffset = {};

        isMobile = oblio.settings.isMobile;
        useFallbackImage = isMobile || oblio.settings.isIOS;

        this.slides = [];

        this.nextSlideshow = data.nextSlideshow || false;
        this.previousSlideshow = data.previousSlideshow || false;

        this.elements = {
            wrapper: el,
            resizeContainer: data.resizeContainer || false,
            paginator_container: data.paginator_container || el
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
        }

        this.animationState = {};

        this.buildSlideshow(data.slides);
    }

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

        var leftSlide = this.slides[this.state.previous_index],
            rightSlide = this.slides[this.state.next_index];

        /*
        * Call drag once to get slides into position before setting display
        * to block to avoid flash of slides that are supposed to be offscreen
        */
        this.drag(pageX, pageY);

        leftSlide.el.style.display = 'block';
        leftSlide.backplate.elements.wrapper.style.display = 'block';

        rightSlide.el.style.display = 'block';
        rightSlide.backplate.elements.wrapper.style.display = 'block';

        // leftSlide.backplate.resize(w, h);
        // rightSlide.backplate.resize(w, h);
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
                targetLeft: targetLeft - currSlide.el.offsetWidth
            },
            {
                slide: rightSlide,
                targetLeft: targetLeft + currSlide.el.offsetWidth
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
            // if (cantransform3d) {
            //     slides[i].slide.el.style.backfaceVisibility = 'hidden';
            //     slides[i].slide.el.style[transformPrefixed] = 'translate3d(' + slides[i].targetLeft.toFixed(4) + 'px,0,0)';
            // } else {
                slides[i].slide.el.style.left = slides[i].targetLeft.toFixed(2) + 'px';
            //}
        };
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
        }

        if (change > 20) {
            // last drag velocity can override the overall change in position
            if (this.dragPosition.velocity < -5) {
                this.animationState.otherSlide = this.slides[this.state.previous_index];
                this.animationState.otherSlideX = -this.slides[this.state.current_index].el.offsetWidth;
                direction = 'next';
            } else {
                direction = 'previous';
            }
        } else if (change < -20) {
            // last drag velocity can override the overall change in position
            if (this.dragPosition.velocity > 5) {
                this.animationState.otherSlide = this.slides[this.state.next_index];
                this.animationState.otherSlideX = this.slides[this.state.current_index].el.offsetWidth;
                direction = 'previous';
            } else {
                direction = 'next';
            }
        } else {
            this.animationState.currVelocity = change > 0 ? -1 : 1;
            this.animationState.currSlide = this.slides[this.state.current_index];
            this.animationState.lastSlide = change > 0 ? this.slides[this.state.previous_index] : this.slides[this.state.next_index];
            this.animationState.lastSlideX = change > 0 ? this.dragPosition.x - this.dragOffset.x + this.animationState.currSlide.el.offsetWidth : this.dragPosition.x - this.dragOffset.x + this.animationState.currSlide.el.offsetWidth;
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

    function buildSlideshow (slides) {

        var slide = '<div class="slide"><div class="backplate_wrapper"><img alt="Slideshow Image" class="backplate" data-thumb="{{backplate.thumb}}" data-mode="{{backplate.mode}}" data-anchor="{{backplate.anchor}}" src="' + oblio.settings.basePath + '{{backplate.img}}"></div></div>',
            slides_html = '';

        for (var i = 0; i < slides.length; i++) {
            if (slides[i].visible === 'false') {
                continue;
            }
            slides_html += slide.replace('{{backplate.anchor}}', slides[i].anchor)
                                .replace('{{backplate.mode}}', slides[i].mode)
                                .replace('{{backplate.img}}', slides[i].img)
                                .replace('{{backplate.thumb}}', slides[i].thumb);
        };
        this.elements.wrapper.innerHTML = slides_html;

        if (slides.length <= 1) {
            this.elements.prev.parentNode.removeChild(this.elements.prev);
            this.elements.next.parentNode.removeChild(this.elements.next);
        }

        var slideElements = this.elements.wrapper.getElementsByClassName('slide');
        for (var i = 0; i < slideElements.length; i++) {
            var loaded = i === 0 ? true : false; // TODO: this won't apply in all cases, need to determine if a backplate has been preloaded rather than just assuming the first one always is

            this.addSlide({
                el: slideElements[i],
                loaded: loaded
            });
        };

        $(this.elements.wrapper).on('click', '.internal', function (e) {
            oblio.functions.internalLink($(this).attr('href'));

            // e.preventDefault();
            return false;
        });

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

        var thumbs = [];
        for (var i = 0; i < this.slides.length; i++) {
            if (this.slides[i].thumb && this.slides[i].thumb !== 'false' && this.slides[i].thumb !== 'undefined' && this.slides[i].thumb !== '') {
                thumbs.push({
                    src: this.slides[i].thumb,
                    index: i
                });
            }
        };

        if (thumbs.length === 0) {
            this.paginator = false;
        }

        if (this.paginator !== false) {
            this.paginator = new oblio.classes.Paginator({
                thumbs: thumbs
            });

            this.paginator.prev = this.previous.bind(this);
            this.paginator.next = this.next.bind(this);
            this.paginator.goToIndex = this.goToIndex.bind(this);
        }


        if (this.close_fn) {
            this.close = close_fn;

            this.elements.close_btn = document.createElement('a');
            this.elements.close_btn.href = '#';
            this.elements.close_btn.className = 'close';

            if (this.paginator) {
                this.paginator.elements.el.appendChild(this.elements.close_btn);
            } else {
                this.elements.wrapper.appendChild(this.elements.close_btn);
            }

            $(this.elements.close_btn).on('click', this.close);
        }

        if (this.paginator) {
            this.elements.paginator_container.appendChild(this.paginator.elements.el);
            this.paginator.update(this.state.current_index + 1, this.slides.length);
        }

        if (this.slides.length > 0) {
            this.slides[this.state.current_index].backplate.onScreen = true;
            this.slides[this.state.current_index].el.style.display = 'block';
            this.slides[this.state.current_index].backplate.elements.wrapper.style.display = 'block';

            positionSlides([
                {
                    slide: this.slides[this.state.current_index],
                    targetLeft: 0
                },
                {
                    slide: this.slides[this.state.last_index],
                    targetLeft: -this.slides[this.state.last_index].el.offsetWidth
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

    /**
    * if element exists, el is the only required property
    * if element does not exist, we need src, anchor, and sizing ('contain' or 'cover')
    */
    function addSlide (data) {
        var slide_obj = {},
            slide_element = data.el,
            loaded = data.loaded;

        if (slide_element === undefined) {

            if (slide_ids[data.src]) {
                console.log('ALREADY ADDED');
                return;
            } else {
                slide_ids[data.src] = this.slides.length;
            }

            slide_element = document.createElement('div');
            slide_element.className = 'slide';

            var backplate_wrapper = document.createElement('div'),
                backplate = document.createElement('img');

            backplate_wrapper.className = 'backplate_wrapper';

            backplate.className = 'backplate';
            backplate.src = data.src;

            backplate.anchor = data.anchor;

            backplate_wrapper.appendChild(backplate);

            slide_element.appendChild(backplate_wrapper);

            this.elements.wrapper.appendChild(slide_element);
        }

        slide_obj.el = slide_element;

        slide_obj.backplate = new oblio.classes.Backplate(slide_element.getElementsByClassName('backplate_wrapper')[0], loaded, this.elements.wrapper, this.settings.mode);

        if (slide_obj.backplate.elements.wrapper.className.match('quote')) {
            slide_obj.isQuote = true;
            slide_obj.backplate.settings.mode = 'contain';
        }

        slide_obj.thumb = slide_obj.backplate.elements.backplate.getAttribute('data-thumb');
        slide_obj.backplate.onScreen = false;

        slide_obj.video_wrapper = slide_element.getElementsByClassName('video_backplate')[0];

        if (slide_obj.video_wrapper) {
            // use fallback image instead of background video for mobile devices because the video can't auto-play
            if (useFallbackImage) {
                slide_obj.backplate = document.createElement('img');
                slide_obj.backplate.src = slide_obj.video_wrapper.getAttribute('data-image');
                slide_obj.backplate.className = 'backplate';
                slide_obj.video_wrapper.className = 'backplate_wrapper';
                slide_obj.video_wrapper.appendChild(slide_obj.backplate);
            } else {
                slide_obj.video_player = new oblio.classes.VideoBackplate(slide_obj.video_wrapper);
            }
        }

        if (isMobile) {
            slide_obj.backplate_wrapper = slide_obj.el.getElementsByClassName('backplate_wrapper')[0];
        }

        this.slides.push(slide_obj);

    }

    function go (instant) {
        this.state.animating = true;

        if (instant) {
            this.animationState.currSlideX = 0;
            this.animationState.lastSlideX = this.animationState.currSlide.el.offsetWidth;
        }

        if (this.paginator) {
            this.paginator.update(this.state.current_index + 1, this.slides.length);
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
        this.animationState.currSlideX = this.dragPosition.x - this.dragOffset.x + this.animationState.currSlide.el.offsetWidth;

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
        this.animationState.currSlideX = this.dragPosition.x - this.dragOffset.x - this.animationState.currSlide.el.offsetWidth;

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
                this.animationState.lastSlide.el.style.display = 'none';

                this.animationState.otherSlide = null;
                this.state.animating = false;
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
            this.animationState.currSlideX = this.animationState.lastSlide.el.offsetWidth;
        } else if (this.state.direction === 'right') {
            this.animationState.currVelocity = 1;
            this.animationState.lastSlide = this.slides[this.state.current_index];
            this.animationState.lastSlideX = 0;
            this.animationState.currSlide = this.slides[i];
            this.animationState.currSlideX = -this.animationState.lastSlide.el.offsetWidth;
        }

        //console.log(this.animationState.currSlideX);
        this.animationState.currSlide.el.style.display = 'block';
        this.animationState.currSlide.backplate.elements.wrapper.style.display = 'block';

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
            curr_slide = this.slides[this.state.current_index],
            backplate = curr_slide.backplate,
            video_player = curr_slide.video_player;

        if (w === undefined || h === undefined) {
            if (this.elements.resizeContainer) {
                w = this.elements.resizeContainer.offsetWidth;
                h = this.elements.resizeContainer.offsetHeight;
            } else {
                w = oblio.settings.windowDimensions.width;
                h = oblio.settings.windowDimensions.height - (this.settings.headerHeight + this.settings.footerHeight);
            }
        }

        wrapper.style.height = h + 'px';

        if (curr_slide.isQuote) {
            w -= Math.max(oblio.settings.menu_width, oblio.settings.features_width);
        }

        if (backplate) {
            backplate.resize(w,h);
        } else if (video_player) {
        }

        if (this.paginator) {
            this.paginator.resize(w,h);
        }

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

        this.slides[this.state.current_index].backplate.resize();
        this.slides[this.state.previous_index].backplate.resize();
        this.slides[this.state.next_index].backplate.resize();
    }

    function reset (go) {

        for (var i = this.slides.length - 1; i >= 0; i--) {
            if (this.slides[i].video_player) {
                this.slides[i].video_player.reset();
            }
        };

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
        console.log('onTransitionComplete');
    }

    function clickHandler (e) {
        var clicked = e.currentTarget;

        switch (clicked.className) {
        case 'prev_slide': // left arrow
            if (this.state.animating) {
                return;
            }
            this.dragPosition.x = 0;
            this.dragOffset.x = 0;
            this.animationState.currVelocity = 1;
            this.slides[this.state.next_index].el.style.left = '4000px'; // the 4000px is a hack to workaround firefox bug that causes slide to flash before animating
            this.slides[this.state.previous_index].el.style.display = 'block';
            this.slides[this.state.previous_index].backplate.elements.wrapper.style.display = 'block';
            this.previous();
            return false;
            break;
        case 'next_slide': // right arrow
            if (this.state.animating) {
                return;
            }
            this.dragPosition.x = 0;
            this.dragOffset.x = 0;
            this.animationState.currVelocity = -1;
            this.slides[this.state.next_index].el.style.left = '4000px'; // the 4000px is a hack to workaround firefox bug that causes slide to flash before animating
            this.slides[this.state.next_index].el.style.display = 'block';
            this.slides[this.state.next_index].backplate.elements.wrapper.style.display = 'block';
            this.next();
            return false;
            break;
        default:
            // nothin'
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
            this.slides[this.state.next_index].el.style.left = '4000px'; // the 4000px is a hack to workaround firefox bug that causes slide to flash before animating
            this.slides[this.state.previous_index].el.style.display = 'block';
            this.slides[this.state.previous_index].backplate.elements.wrapper.style.display = 'block';
            this.previous();
            break;
        case 39: // right arrow
            if (this.state.animating) {
                return;
            }
            this.dragPosition.x = 0;
            this.dragOffset.x = 0;
            this.animationState.currVelocity = -1;

            this.slides[this.state.next_index].el.style.left = '4000px'; // the 4000px is a hack to workaround firefox bug that causes slide to flash before animating
            this.slides[this.state.next_index].el.style.display = 'block';
            this.slides[this.state.next_index].backplate.elements.wrapper.style.display = 'block';
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
    SlideShow.prototype.addSlide = addSlide;
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

    return SlideShow;
}));
