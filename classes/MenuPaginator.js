// UMD (Universal Module Definition) patterns for JavaScript modules that work everywhere.
// https://github.com/umdjs/umd/blob/master/amdWebGlobal.js

;(function (root, factory) {
    // Browser globals
    root.classes = root.classes || {};

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
                'jquery',
                'greensock/TweenLite.min',
                'greensock/easing/EasePack.min',
                'greensock/plugins/CSSPlugin.min'
            ], function () {
            return (root.classes.MenuPaginator = factory());
        });
    } else {
        root.classes.MenuPaginator = factory();
    }
}(window.oblio = window.oblio || {}, function () {

    var MenuPaginator = function (params) {
        var listWidth = 0,
            that = this;

        this.elements = {
            wrapper: params.wrapper,
            masker: $(params.wrapper).find('.paginatorMasker'),
            list: $(params.wrapper).find('ul'),
            prev: $('<p class="prev"></p>').appendTo(params.wrapper), // for some reason, there was a huge delay when I used an anchor tag instead of a p
            next: $('<p class="next"></p>').appendTo(params.wrapper)
        };

        this.elements.list.children('li').each(function () {
            if (this.style.display !== 'none') {
                listWidth += $(this).outerWidth(true) + 1;
            }
        });

        this.listWidth = listWidth;

        this.elements.list[0].style.width = listWidth + 'px';

        $(this.elements.wrapper).on('click', '.prev, .next',function (e) {
            e.preventDefault();

            switch (this.className) {
                case 'prev on':
                    that.previous();
                    break;
                case 'next on':
                    that.next();
                    break;
                default:
                    // trace('why is this not prev or next?');
                    // trace(this);
            }
        });

        this.paginated = false;
        this.currentPage = 1;
        this.numPages = 1;
        this.resize();
    }

    MenuPaginator.prototype = {
        /**
        * display pagination arrows
        */
        paginate: function () {

            if (this.paginated === false) {
                this.currentPage = 1;
                this.elements.prev[0].className = 'prev off';
                this.elements.next[0].className = 'next on';
                this.paginated = true;
            }
        },
        /**
        * hide pagination arrows
        */
        unpaginate: function () {

            if (this.paginated === true) {
                this.currentPage = 1;
                this.elements.prev[0].className = 'prev off';
                this.elements.next[0].className = 'next off';
                this.elements.list[0].style.left = '0px';
                this.paginated = false;
            }
        },
        /**
        * Next page
        */
        next: function () {
            var change,
                newleft;

            if (this.currentPage + 1 <= this.numPages) {
                this.currentPage += 1;

                if (this.currentPage === this.numPages) {
                    this.elements.next[0].className = 'next off';
                    newleft = (this.elements.masker.width() - this.listWidth) + 'px';

                    TweenLite.to(this.elements.list, 1, {left:newleft, ease:Power4.easeInOut});
                } else {
                    change = -(this.elements.masker.width() - this.listWidth) - (this.elements.masker.width()*(this.currentPage - 1));
                    
                    if (change < 100) {
                        this.next();
                        return;
                    }
                    newleft = -(this.elements.masker.width()*(this.currentPage - 1)) + 'px';
                    TweenLite.to(this.elements.list, 1, {left:newleft, ease:Power4.easeInOut});
                }
            }

            this.elements.prev[0].className = 'prev on';
        },
        /**
        * Previous page
        */
        previous: function () {
            var change;

            if (this.currentPage - 1 >= 1) {
                this.currentPage -= 1;

                if (this.currentPage === 1) {
                    this.elements.prev[0].className = 'prev off';
                    TweenLite.to(this.elements.list, 1, {left:'0px', ease:Power4.easeInOut});
                } else {

                    change = (-parseInt(this.elements.list[0].style.left)) - (this.elements.masker.width()*(this.currentPage - 1));
                    
                    if (change < 100) {
                        this.previous();
                        return;
                    }
                    newleft = -(this.elements.masker.width()*(this.currentPage - 1)) + 'px';
                    TweenLite.to(this.elements.list, 1, {left:newleft, ease:Power4.easeInOut});
                }
            }
            this.elements.next[0].className = 'next on';

        },
        /**
        * called on browser resize
        */
        resize: function () {
            var w = this.elements.masker.width(),
                curpos = -parseInt(this.elements.list[0].style.left) + this.elements.masker.width();

            // subtract 100 because of #homeMenu padding
            if (w < this.listWidth) {
                this.numPages = Math.ceil(this.listWidth / (w));

                if (!isNaN(curpos)) {
                    if (this.listWidth > curpos) {
                        this.currentPage = parseInt(this.elements.list[0].style.left) === 0 ? 1 : (Math.ceil(-parseInt(this.elements.list[0].style.left)/this.elements.masker.width()) + 1);
                        this.elements.next[0].className = 'next on';
                    } else {
                        this.elements.next[0].className = 'next off';
                        this.currentPage = this.numPages;
                        this.elements.list[0].style.left = -(this.listWidth - this.elements.masker.width()) + 'px';
                    }
                }

                this.paginate();
            } else {
                this.unpaginate();
            }
        }
    }

    return MenuPaginator;
}));
