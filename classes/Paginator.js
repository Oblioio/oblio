define([
        'greensock/TweenLite.min',
        'greensock/easing/EasePack.min',
        'greensock/plugins/CSSPlugin.min'
    ], function () {

    var Paginator = function (data) {

        var that = this;

        this.maxThumbs = data.maxThumbs || false;
        this.thumbs = data.thumbs || false;
        this.rotate = data.rotate || false;
        this.rotation_delay = data.rotation_delay || 3000;

        if (this.maxThumbs) {
            this.currThumbs = Math.min(this.maxThumbs, this.currThumbs);
        }

        this.elements = {
            el: document.createElement('div'),
            prev: document.createElement('a'),
            next: document.createElement('a'),
            count: document.createElement('span')
        };

        this.settings = {
            paginator_max_width: 0.9, // max width of paginator as percentage of its container
            thumb_max_width: 200, // thumb max width in pixels
            thumb_min_width: 150, // thumb min width in pixels
            prev_next_button_width: 80, // amount of space taken up by prev/next buttons in pixels
            thumb_ratio: 0.7 // ratio of the thumbnail height/width
        }

        this.elements.count.className = 'count';
        this.elements.el.className = 'paginator';
        this.elements.prev.innerHTML = 'Previous';
        this.elements.prev.href = '#';
        this.elements.prev.className = 'prev_page';
        this.elements.next.innerHTML = 'Next';
        this.elements.next.href = '#';
        this.elements.next.className = 'next_page';

        this.elements.el.appendChild(this.elements.prev);
        this.elements.el.appendChild(this.elements.count);
        this.elements.el.appendChild(this.elements.next);

        if (this.thumbs) {
            this._buildThumbs();
        }

        $(this.elements.el).on('click', 'a', clickHandler.bind(this));

    }

    function clickHandler (e) {
        var clicked = e.currentTarget;

        if (clicked.getAttribute('data-type') === 'external') {
            return;
        } else if (clicked.getAttribute('data-type') === 'overlay') {
            oblio.functions.showOverlay(clicked.getAttribute('href'));
            return false;
        } else if (clicked.getAttribute('data-type') === 'internal') {
            oblio.functions.internalLink(clicked.getAttribute('href'));
        }

        if (clicked.className.match(/(selected|disabled)/)) {
            return false;
        } else if (clicked.className.match('thumb')) {
            if (this.goToIndex) {
                this.goToIndex(parseInt(clicked.getAttribute('href')));
            }
        } else {
            switch (clicked.className) {
                case 'prev':
                    if (this.prev) {
                        this.prev();
                    }
                    break;
                case 'next':
                    if (this.next) {
                        this.next();
                    }
                    break;
                case 'prev_page':
                    this._prevThumbs();
                    break;
                case 'next_page':
                    this._nextThumbs('click');
                    break;
                default:
                    return;
            }
        }

        // e.preventDefault();
        return false;
    }

    function buildThumbs () {
        var thumbs_html = '';

        this.elements.thumb_wrapper = document.createElement('div');
        this.elements.thumb_wrapper.className = 'thumb_wrapper';

        this.elements.thumb_list = document.createElement('ul');

        for (var i = 0; i < this.thumbs.length; i++) {

            // ticketing widget doesn't work for ie8
            if (document.documentElement.className.match('lt-ie9')) {
                if (this.thumbs[i].link === '#ticketing' || this.thumbs[i].link === '#soundtrack') {
                    continue;
                }
            }
            

            thumbs_html += '<li>';

            if (this.thumbs[i].link) {
                thumbs_html += '<a class="thumb" href="' + this.thumbs[i].link + '"';
            } else {
                thumbs_html += '<a class="thumb" href="' + this.thumbs[i].index + '"';
            }
            
            if (this.thumbs[i].type) {
                thumbs_html += ' data-type="' + this.thumbs[i].type + '"';
                if (this.thumbs[i].type === 'external') {
                    thumbs_html += ' target="_blank"';
                }
            }
            thumbs_html += ' ><img src="' + this.thumbs[i].src + '" />';
            if (this.thumbs[i].caption) {
                var fontSize = '';
                if (this.thumbs[i].fontSize) {
                    fontSize = ' style="font-size:' + this.thumbs[i].fontSize + '"';
                }
                thumbs_html += '<p' + fontSize + '>' + this.thumbs[i].caption + '</p>';
            }
            thumbs_html += '</a>';
            thumbs_html += '</li>';
        };

        this.elements.thumb_list.innerHTML = thumbs_html;
        this.elements.thumb_wrapper.appendChild(this.elements.thumb_list);
        this.elements.el.appendChild(this.elements.thumb_wrapper);
        this.elements.thumbs = $(this.elements.thumb_list).find('.thumb'); //this.elements.thumb_list.getElementsByClassName('thumb');

        this.resize(oblio.settings.windowDimensions.width, oblio.settings.windowDimensions.height);
        window.setTimeout(this._resizeThumbHolder.bind(this), 10); // not sure why this needs to be in a settimeout, but if it's not, the features are positioned partially off the screen to the right
    
        if (this.rotate) {
            if (this.timer) {
                window.clearInterval(this.timer);
            }
            this.timer = window.setInterval(this._nextThumbs.bind(this), this.rotation_delay);
        }
    }

    function prevThumbs () {
        var lpos = Math.min(0, this.elements.thumb_list.offsetLeft + this.elements.thumb_wrapper.offsetWidth),
            that = this;

        this.elements.next.className = 'next_page';

        if (lpos >= 0) {
            lpos = 0;
            this.elements.prev.className = 'prev_page disabled';
        } else {
            this.elements.prev.className = 'prev_page';
        }

        if (this.timer) {
            window.clearInterval(this.timer);
        }

        TweenLite.to(this.elements.thumb_list, 0.5, {left:lpos + 'px', ease:Power3.easeInOut, onComplete: function () {
            if (that.rotate) {
                if (that.timer) {
                    window.clearInterval(that.timer);
                }
                that.timer = window.setInterval(that._nextThumbs.bind(that), that.rotation_delay);
            }
        }});
    }

    function nextThumbs (click) {

        var lpos = Math.max(this.elements.thumb_wrapper.offsetWidth - this.thumbWidth * this.thumbs.length, this.elements.thumb_list.offsetLeft - this.elements.thumb_wrapper.offsetWidth),
            that = this;

        this.elements.prev.className = 'prev_page';

        if (this.elements.next.className.match('disabled') && this.rotate) {
            this.elements.next.className = 'next_page';
            this.elements.prev.className = 'prev_page disabled';
            lpos = 0;
        } else if (lpos <= this.elements.thumb_wrapper.offsetWidth - this.thumbWidth * this.thumbs.length) {
            // lpos = this.elements.thumb_wrapper.offsetWidth - this.elements.thumb_list.offsetWidth;
            this.elements.next.className = 'next_page disabled';
        } else {
            this.elements.next.className = 'next_page';
        }

        if (this.timer) {
            window.clearInterval(this.timer);
        }

        TweenLite.to(this.elements.thumb_list, 0.5, {left:lpos + 'px', ease:Power3.easeInOut, onComplete: function () {
            if (that.rotate) {
                if (that.timer) {
                    window.clearInterval(that.timer);
                }
                that.timer = window.setInterval(that._nextThumbs.bind(that), that.rotation_delay);
            }
        }});
    }

    function update (current, total) {

        var selected_thumbs = this.elements.thumb_list.getElementsByClassName('selected');

        for (var i = selected_thumbs.length - 1; i >= 0; i--) {
            selected_thumbs[i].className = selected_thumbs[i].className.replace('selected', '');
        };

        this.elements.thumbs[current - 1].className = this.elements.thumbs[current - 1].className + ' selected';

        this.elements.count.innerHTML = current + '/' + total;
    }

    function resizeThumbHolder () {

        var list_width = Math.round(this.thumbWidth * this.thumbs.length),
            wrapper_width = this.elements.thumb_wrapper.offsetWidth;

        // if all of the thumbs fit in the thumb_wrapper
        if (wrapper_width >= list_width) {
            this.elements.next.className = 'next_page disabled';
            this.elements.prev.className = 'prev_page disabled';
            this.elements.thumb_list.style.left = '0px';
        } else {
            this.elements.next.className = 'next_page';
            this.elements.prev.className = 'prev_page';

            if (this.elements.thumb_list.offsetLeft >= 0) {
                this.elements.prev.className = 'prev_page disabled';
            }

            if (this.elements.thumb_list.offsetLeft <= wrapper_width - list_width) {
                this.elements.thumb_list.style.left = (wrapper_width - list_width) + 'px';
                this.elements.next.className = 'next_page disabled';
            } else {

                if (Math.abs(this.elements.thumb_list.offsetLeft) > 0) {
                    var remainder = Math.max(Math.abs(this.elements.thumb_list.offsetLeft), this.thumbWidth) % Math.min(Math.abs(this.elements.thumb_list.offsetLeft), this.thumbWidth);

                    if (Math.abs(this.elements.thumb_list.offsetLeft) < this.thumbWidth) {
                        remainder *= -1;
                    }

                    this.elements.thumb_list.style.left = (this.elements.thumb_list.offsetLeft + remainder) + 'px';
                }

            }

        }

    }

    function enter () {
        if (this.rotate) {
            if (this.timer) {
                window.clearInterval(this.timer);
            }
            this.timer = window.setInterval(this._nextThumbs.bind(this), this.rotation_delay);
        }
    }

    function exit () {
        if (this.timer) {
            window.clearInterval(this.timer);
        }
    }

    // set number of visible thumbs
    function resize (w,h) {

        var available_space = Math.min(this.settings.thumb_min_width * this.thumbs.length, (this.settings.paginator_max_width * w) - (2 * this.settings.prev_next_button_width)),
            num_visible_thumbs = Math.min(this.thumbs.length, Math.floor(available_space / this.settings.thumb_min_width)),
            num_pages = Math.ceil(this.thumbs.length / num_visible_thumbs);

        
        this.elements.thumb_wrapper.style.width = available_space + 'px';
        this.elements.thumb_list.style.width = (available_space * num_pages) + 'px';
        this.elements.thumb_list.className = 'num_thumbs_' + num_visible_thumbs * num_pages;
        this.elements.el.style.marginLeft = -(this.elements.el.offsetWidth / 2) + 'px';
        
        if (this.elements.el.offsetWidth === 0) {
            var el = this.elements.el;

            window.setTimeout(function () {
                el.style.marginLeft = -(el.offsetWidth / 2) + 'px';
            }, 100);    
        }
        
        this.thumbWidth = 1 / num_visible_thumbs * available_space;

        this.elements.thumb_wrapper.style.height = this.elements.thumb_list.style.height = (this.thumbWidth * this.settings.thumb_ratio + 4) + 'px';

        this._resizeThumbHolder();
    }

    Paginator.prototype._resizeThumbHolder = resizeThumbHolder;
    Paginator.prototype._prevThumbs = prevThumbs;
    Paginator.prototype._nextThumbs = nextThumbs;
    Paginator.prototype._buildThumbs = buildThumbs;

    Paginator.prototype.enter = enter;
    Paginator.prototype.exit = exit;

    Paginator.prototype.update = update;
    Paginator.prototype.resize = resize;

    window.oblio = window.oblio || {};
    oblio.classes = oblio.classes || {};
    oblio.classes.Paginator = Paginator;

    return oblio.classes.Paginator;
});