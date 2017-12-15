import { BG_Image } from 'OblioUtils/classes/BG_Image';
import { BG_Video } from 'OblioUtils/classes/BG_Video';
import { Backplate } from 'OblioUtils/classes/Backplate';

var isMobile,
    useFallbackImage,
    slide_ids = {};

var slideShow = function (data) {

    var el = data.el || data;

    this.close_fn = data.close_fn || false;
    this.axis = data.axis || 'x'; // direction to animate
    this.duration = data.duration || 0.75; // speed of animation
    this.rotate = data.rotate || false;
    this.rotation_delay = data.rotation_delay || 3000; // switch slide every 3 seconds
    this.activeSlides = [];

    this.enabled = true;

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
        w: this.elements.resizeContainer.offsetWidth,
        h: this.elements.resizeContainer.offsetHeight
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

    if (this.slides.length > 1) {
        this.elements.paginator_container.addEventListener('click', this.clickHandler.bind(this));

        this.elements.wrapper.addEventListener('mousedown', mouseDown.bind(this));
        this.elements.wrapper.addEventListener('mousemove', mouseMove.bind(this));
        window.addEventListener('mouseup', mouseUp.bind(this));

        this.elements.wrapper.addEventListener('touchstart', touchStart.bind(this));
        this.elements.wrapper.addEventListener('touchmove', touchMove.bind(this));
        this.elements.wrapper.addEventListener('touchend', touchEnd.bind(this));
    } else {
        this.elements.wrapper.className = this.elements.wrapper.className + ' disabled';
    }

}

function startDrag (pageX, pageY) {

    if (this.dragging || this.state.animating || !this.enabled) {
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

    if (!this.dragging || !this.enabled) {
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

    this.positionSlides([
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

    if (!this.dragging || !this.enabled) {
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
    e.preventDefault();
    this.startDrag(e.pageX, e.pageY);
}

function mouseMove (e) {
    e.preventDefault();
    this.drag(e.pageX, e.pageY);
}

function mouseUp (e) {
    e.preventDefault();
    this.elements.wrapper.className = this.elements.wrapper.className.replace(/ dragging/g, '');
    this.stopDrag(e.pageX, e.pageY);
}

function touchStart (e) {
    if (!this.enabled) {
        return;
    }
    e.preventDefault();

    var touch = e.touches[0];
    this.startDrag(touch.pageX, touch.pageY);
}

function touchMove (e) {
    if (!this.enabled) {
        return;
    }
    e.preventDefault();

    var touch = e.touches[0];
    this.drag(touch.pageX, touch.pageY);
}

function touchEnd (e) {
    if (!this.enabled) {
        return;
    }
    e.preventDefault();
    
    var touch = e.changedTouches[0];
    this.stopDrag(touch.pageX, touch.pageY);
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
                bg = BG_Image.getNew(slides[i], bgImgReady);
                break;
            case 'htmlVideo':
            case 'youtube':
                if (oblio.utils.DeviceDetect.isMobile || oblio.utils.DeviceDetect.isAndroid || oblio.utils.DeviceDetect.isIpad || !document.createElement('video').canPlayType) {
                    slides[i].url = slides[i].fallback;
                    bg = BG_Image.getNew(slides[i], bgImgReady);
                } else {
                    bg = BG_Video.getNew(slides[i], bgVidReady);
                }
                break;
            default:
                bg = BG_Image.getNew(slides[i], bgImgReady.bind(this));
                break;
        }

        slide = Backplate.getNew(bg, false, this.elements.wrapper, this.settings.mode);

        /*
        * TODO: i'm just adding these classes because they were there before, 
        * prob won't need them once i go through the css and js and clean up
        */
        slide.elements.outer.className = slide.elements.outer.className + ' slide';
        slide.elements.inner.className = slide.elements.inner.className + ' backplate_wrapper';
        console.log(bg)
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


        this.elements.close_btn.addEventListener('click', this.close, false);
    }

    if (this.slides.length > 0) {
        this.slides[this.state.current_index].onScreen = true;
        activate.call(this, this.state.current_index);
        // this.slides[this.state.current_index].elements.outer.style.display = 'block';

        this.positionSlides([
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
    this.positionSlides(slides);

    if (direction === -1 && this.animationState.currSlideX > 1 || direction === 1 && this.animationState.currSlideX < -1) {
        window.requestAnimationFrame(animate.bind(this));
    } else {
        if (this.animationState.currSlideX === 0) {
            this.animationState.otherSlide = null;
            this.state.animating = false;
            this.onTransitionComplete(this);
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
    var clicked = e.target;
    console.log(clicked);
    if (!clicked.matches('a') && !clicked.matches('button')) return;

    e.preventDefault();

    switch (clicked.className) {
    case 'prev_slide': // left arrow
        if (this.state.animating) {
            return;
        }
        this.dragPosition.x = 0;
        this.dragOffset.x = 0;
        this.animationState.currVelocity = 1;
        this.slides[this.state.next_index].elements.outer.style.left = '4000px'; // the 4000px is a hack to workaround firefox bug that causes slide to flash before animating
        activate.call(this, this.state.previous_index);
        
        this.previous();
    case 'next_slide': // right arrow
        if (this.state.animating) {
            return;
        }
        this.dragPosition.x = 0;
        this.dragOffset.x = 0;
        this.animationState.currVelocity = -1;
        this.slides[this.state.next_index].elements.outer.style.left = '4000px'; // the 4000px is a hack to workaround firefox bug that causes slide to flash before animating
        activate.call(this, this.state.next_index);
        this.next();
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
        console.log(slide, slide.obj);
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

slideShow.prototype._go = go;
slideShow.prototype._updateState = updateState;

slideShow.prototype.buildSlideshow = buildSlideshow;
slideShow.prototype.reset = reset;
slideShow.prototype.keyHandler = keyHandler;
slideShow.prototype.clickHandler = clickHandler;
slideShow.prototype.next = next;
slideShow.prototype.previous = previous;
slideShow.prototype.goToId = goToId;
slideShow.prototype.goToIndex = goToIndex;
slideShow.prototype.resize = resize;
slideShow.prototype.onTransitionComplete = onTransitionComplete;

slideShow.prototype.enter = enter;
slideShow.prototype.exit = exit;

slideShow.prototype.addEventHandlers = addEventHandlers;
slideShow.prototype.mouseDown = mouseDown;
slideShow.prototype.mouseMove = mouseMove;
slideShow.prototype.mouseUp = mouseUp;
slideShow.prototype.touchStart = touchStart;
slideShow.prototype.touchMove = touchMove;
slideShow.prototype.touchEnd = touchEnd;
slideShow.prototype.startDrag = startDrag;
slideShow.prototype.drag = drag;
slideShow.prototype.stopDrag = stopDrag;
slideShow.prototype.positionSlides = positionSlides;

export var SlideShow = {
    getNew: function (data) {
        return new slideShow(data);
    }
}
