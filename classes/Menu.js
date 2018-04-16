import 'OblioUtils/utils/DeviceDetect';
import 'OblioUtils/classes/MenuPaginator';

'use strict';

var isMobile = oblio.utils.DeviceDetect.isMobile;

var menu = function (data) {
    this.menuID = data.menuID || '';
    this.verbose = false;

    var that = this;

    this.elements = {
        el: document.getElementById(data.menuID),
        wrapper: document.getElementById(data.wrapperID),
        paginatorEl: document.getElementById(data.paginatorElID)
    };

    that.elements.burger = this.elements.wrapper.querySelector('.burger');
    if (that.elements.burger) that.elements.burger.addEventListener('touchstart', function () {
        that.elements.wrapper.classList.toggle('open');
    });

    this.menuList = data.menuList;
    this.menuStyle = data.menuStyle;
};

function init (current_section) {
    if(this.verbose)console.log('Main Menu | '+this.menuID+' | init');

    this.isHidden = false;

    this.elements.listItems = this.elements.el.getElementsByTagName('li');

    this.elements.wrapper.classList.add(this.menuStyle);

    this.selectMenuItem(current_section);

    this.hide(true);

    this.resize();

}

function selectMenuItem (section_name) {
    if(this.verbose)console.log('Main Menu | '+this.menuID+' | selectMenuItem: '+section_name);

    var that = this,
        selected = this.elements.el.querySelector('a[data-section="' + section_name + '"]');

    if (!selected) return;

    if (this.elements.selected) {
        this.elements.selected.className = this.elements.selected.className.replace(/\s?selected/ig, '');
    }

    selected.className = selected.className + ' selected';
    this.elements.selected = selected;

    that.elements.wrapper.classList.remove('open');
}

function hide (instant) {
    if(this.verbose)console.log('Main Menu | '+this.menuID+' | hide');

    if (this.isHidden === true) {
        return;
    }

    var duration = 0.5;

    if (instant) {
        duration = 0;
    }

    this.isHidden = true;

    switch (this.menuStyle) {
        case 'horizontal':
            TweenLite.to(this.elements.wrapper, duration, {y: -this.elements.wrapper.offsetHeight + 'px', ease: Power4.easeInOut});
            break;
        case 'vertical':
            TweenLite.to(this.elements.wrapper, duration, {x: -this.elements.wrapper.offsetWidth + 'px', ease: Power4.easeInOut});
            break;
        default:
            console.log('invalid menustyle');
    }
}

function openPopUp(e){
    e.preventDefault();

    let link = e.target;
    let popupSize = link.getAttribute('data-popup');

    var vSplit = String(e.target.rel).split(',');
    window.open(link.getAttribute('href'), "_blank", popupSize);
    return false;
}

function getHeight () {
    return this.menuStyle === 'horizontal' ? this.elements.wrapper.offsetHeight : 0;
}

function show (instant) {
    if(this.verbose)console.log('Main Menu | '+this.menuID+' | show');

    if (this.isHidden === false) {
        return;
    }

    var duration = 0.5;

    if (instant) {
        duration = 0;
    }

    this.isHidden = false;

    document.getElementById('mainHeader').style.visibility = 'visible';

    switch (this.menuStyle) {
        case 'horizontal':
            TweenLite.to(this.elements.wrapper, duration, {y: '0px', ease: Power4.easeInOut});
            break;
        case 'vertical':
            TweenLite.to(this.elements.wrapper, duration, {x: '0px', ease: Power4.easeInOut});
            break;
        default:
            console.log('invalid menustyle');
    }
}

function resize () {
    if (this.menuPaginator) {
        this.menuPaginator.resize(oblio.settings.windowDimensions.width, oblio.settings.windowDimensions.height);
    }

    if (this.elements === undefined) {
        return;
    }
}

menu.prototype.init = init;
menu.prototype.getHeight = getHeight;
menu.prototype.openPopUp = openPopUp;
menu.prototype.hide = hide;
menu.prototype.show = show;
menu.prototype.resize = resize;
menu.prototype.selectMenuItem = selectMenuItem;

export var Menu = {
    getNew: function (data) {
        return new menu(data);
    }
}