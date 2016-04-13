define([
        'greensock/TweenLite.min',
        'greensock/easing/EasePack.min',
        'greensock/plugins/CSSPlugin.min'
    ], function () {

    var MenuPaginator = function (params) {
        var listWidth = 0,
            that = this;

        this.elements = {
            wrapper: params.wrapper,
            masker: params.wrapper.querySelector('.paginatorMasker'),
            list: params.wrapper.querySelector('ul'),
            prev: document.createElement('p'),
            next: document.createElement('p')
        };
        this.elements.prev.className = 'prev';
        this.elements.next.className = 'next';
        this.elements.wrapper.appendChild(this.elements.prev);
        this.elements.wrapper.appendChild(this.elements.next);

        // get width of element including margins
        function outerWidth (el) {
            var width = el.offsetWidth,
                style = getComputedStyle(el);

            width += parseInt(style.marginLeft) + parseInt(style.marginRight);
            return width;
        }

        var list_items = this.elements.list.getElementsByTagName('li');
        for (var i = list_items.length - 1; i >= 0; i--) {
            listWidth += outerWidth(list_items[i]) + 1;
        }

        this.listWidth = listWidth;

        this.elements.list.style.width = listWidth + 'px';

        this.elements.wrapper.addEventListener('click', function (e) {
            e.preventDefault();

            var el = e.target;
            if (el.matches('.prev, .next')) {
                switch (el.className) {
                    case 'prev on':
                        this.previous();
                        break;
                    case 'next on':
                        this.next();
                        break;
                    default:
                }
            }

        }.bind(this));

        this.paginated = false;
        this.currentPage = 1;
        this.numPages = 1;
        this.resize();
    };

    MenuPaginator.prototype = {
        /**
        * display pagination arrows
        */
        paginate: function () {

            if (this.paginated === false) {
                this.currentPage = 1;
                this.elements.prev.className = 'prev off';
                this.elements.next.className = 'next on';
                this.paginated = true;
            }
        },
        /**
        * hide pagination arrows
        */
        unpaginate: function () {

            if (this.paginated === true) {
                this.currentPage = 1;
                this.elements.prev.className = 'prev off';
                this.elements.next.className = 'next off';
                this.elements.list.style.left = '0px';
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
                    this.elements.next.className = 'next off';
                    newleft = (this.elements.masker.offsetWidth - this.listWidth) + 'px';

                    TweenLite.to(this.elements.list, 1, {left:newleft, ease:Power4.easeInOut});
                } else {
                    change = -(this.elements.masker.offsetWidth - this.listWidth) - (this.elements.masker.offsetWidth*(this.currentPage - 1));
                    
                    if (change < 100) {
                        this.next();
                        return;
                    }
                    newleft = -(this.elements.masker.offsetWidth * (this.currentPage - 1)) + 'px';
                    TweenLite.to(this.elements.list, 1, {left: newleft, ease: Power4.easeInOut});
                }
            }

            this.elements.prev.className = 'prev on';
        },
        /**
        * Previous page
        */
        previous: function () {
            var change;

            if (this.currentPage - 1 >= 1) {
                this.currentPage -= 1;

                if (this.currentPage === 1) {
                    this.elements.prev.className = 'prev off';
                    TweenLite.to(this.elements.list, 1, {left:'0px', ease:Power4.easeInOut});
                } else {

                    change = -this.elements.list.offsetLeft - (this.elements.masker.offsetWidth * (this.currentPage - 1));
                    
                    if (change < 100) {
                        this.previous();
                        return;
                    }
                    newleft = -(this.elements.masker.offsetWidth * (this.currentPage - 1)) + 'px';
                    TweenLite.to(this.elements.list, 1, {left: newleft, ease:Power4.easeInOut});
                }
            }
            this.elements.next.className = 'next on';

        },
        /**
        * called on browser resize
        */
        resize: function () {
            var w = this.elements.masker.offsetWidth,
                curpos = -this.elements.list.offsetLeft + this.elements.masker.offsetWidth;

            // subtract 100 because of #homeMenu padding
            if (w < this.listWidth) {
                this.numPages = Math.ceil(this.listWidth / (w));

                if (!isNaN(curpos)) {
                    if (this.listWidth > curpos) {
                        this.currentPage = this.elements.list.offsetLeft === 0 ? 1 : (Math.ceil(-this.elements.list.offsetLeft/this.elements.masker.offsetWidth) + 1);
                        this.elements.next.className = 'next on';
                    } else {
                        this.elements.next.className = 'next off';
                        this.currentPage = this.numPages;
                        this.elements.list.style.left = -(this.listWidth - this.elements.masker.offsetWidth) + 'px';
                    }
                }

                this.paginate();
            } else {
                this.unpaginate();
            }
        }
    }

    window.oblio = window.oblio || {};
    oblio.classes = oblio.classes || {};
    oblio.classes.MenuPaginator = MenuPaginator;

    return oblio.classes.MenuPaginator;
});
