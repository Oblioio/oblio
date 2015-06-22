// UMD (Universal Module Definition) patterns for JavaScript modules that work everywhere.
// https://github.com/umdjs/umd/blob/master/amdWebGlobal.js

;(function (root, factory) {
    // Browser globals
    root.classes = root.classes || {};

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
                'jquery',
                'mustache',
                'oblio/utils/DeviceDetect',
                'oblio/classes/MenuPaginator',
                'greensock/TweenLite.min',
                'greensock/TimelineLite.min',
                'greensock/easing/EasePack.min',
                'greensock/plugins/CSSPlugin.min'
            ], function ($, Mustache) {
            return (root.classes.Menu = factory($, Mustache));
        });
    } else {
        root.classes.Menu = factory($, Mustache);
    }
}(window.oblio = window.oblio || {}, function ($, Mustache) {

    'use strict';

    var isMobile = oblio.utils.DeviceDetect.isMobile;
    var that;

    var Menu = function (data) {
        this.menuID = data.menuID || '';
        this.verbose = false;

        that = this;

        this.template = (data.template)?data.template:'<a rel="{{{rel}}}" class="{{{className}}}" data-type="{{{type}}}" data-section="{{{link}}}" href="{{{link}}}" target="{{{target}}}" style="position: {{{position}}}; font-size: {{{font-size}}};">{{{label}}}</a>';

        this.elements = {
            el: document.getElementById(data.menuID),
            wrapper: document.getElementById(data.wrapperID),
            paginatorEl: document.getElementById(data.paginatorElID)
        }

        this.menuList = data.menuList;
        this.menuStyle = data.menuStyle;

        if (data.menuList) {
            this.buildMenu();
        }
    }

    function init (current_section) {
        if(this.verbose)console.log('Main Menu | '+this.menuID+' | init');

        this.isHidden = false;

        this.elements.listItems = this.elements.el.getElementsByTagName('li');
        this.elements.selected = $('#menu a[data-section="' + current_section + '"]').addClass('selected')

        this.selectMenuItem(this.elements.selected.data('section'), false);

        this.hide(true);

        this.resize();

    }

    function buildMenu () {
        if(this.verbose)console.log('Main Menu | '+this.menuID+' | buildMenu');

        switch (this.menuStyle) {
            case 'vertical':
                buildVerticalMenu.call(this, this.menuList);
                break;
            case 'horizontal':
                this.menuStyle = 'horizontal';
                buildHorizontalMenu.call(this, this.menuList);
                break;
            default:
                buildVerticalMenu.call(this, this.menuList);
        }

    }

    function buildVerticalMenu (menuList) {

        for (var i = 0; i < menuList.length; i++)
        {
            var menuItem = menuList[i];
            if (String(menuItem.visible).toLowerCase() == 'false' || menuItem.comingSoon == 'true')
                continue;

            var btnData = {},
                popUp = false;

            menuItem.className = 'mainMenuBtn';

            // btnData.dataType = menuItem.type;
            if (menuItem.type === 'external') {
                menuItem.target = '_blank';
            }else if (menuItem.type === "popup") {
                popUp = true;
                menuItem.rel = menuItem.link+","+menuItem.dimensions[0]+","+menuItem.dimensions[1];
            }

            // btnData.dataSection = menuItem.link;
            // btnData.href = menuItem.link;

            // btnData.fontSize = menuItem["font-size"];

            // btnData.label = menuItem.label;
            for (var j = 0; j < oblio.app.dataSrc.sections.main.html.length; j++) {
                if (oblio.app.dataSrc.sections.main.html[j].ID === menuItem.label) {
                    menuItem.label = oblio.app.dataSrc.sections.main.html[j].VAL;
                }
            };
            // btn.innerHTML = $.grep(oblio.app.dataSrc.sections.main.html, function(e) { return e.ID == menuItem.label; })[0].VAL;

            var btn = $(Mustache.render(this.template, menuItem));
            if(popUp)btn.click(this.openPopUp);

            var li = document.createElement('li');
            li.appendChild(btn.get()[0]);
            this.elements.el.appendChild(li);
        }
    }

    function buildHorizontalMenu (menuList) {
        this.elements.wrapper.className = 'horizontal paginatorWrapper ' + this.elements.wrapper.className;

        this.elements.el.className = 'centeredMenu';

        this.elements.paginatorEl.className = 'paginatorMasker';

        var firstBtn = true;

        for(var i = 0; i < menuList.length; i++){
            if(menuList[i].visible === false)continue;
            if(!firstBtn){
                // var newDot = document.createElement('li');
                // newDot.className = "menu_dot";
                // menuElem.appendChild(newDot);
            } else {firstBtn = false;};
            
            var newMenuEntry = document.createElement('li');
            var newMenuLink = document.createElement('a');
            newMenuLink.innerHTML = menuList[i].label;
            newMenuLink.setAttribute('data-type', menuList[i].type);
            if (menuList[i].type === 'external') {
                newMenuLink.setAttribute('target', '_blank');
            }
            newMenuLink.setAttribute('data-section', menuList[i].link);
            newMenuLink.setAttribute('href', menuList[i].link);
            newMenuLink.style.fontSize = menuList[i]["font-size"];
            if(menuList[i].type === "external"){
                newMenuLink.target = "_blank";
            } else if(menuList[i].type === "popup") {
                newMenuLink.rel = menuList[i].link+","+menuList[i].dimensions[0]+","+menuList[i].dimensions[1];
                $(newMenuLink).click(this.openPopUp);
            }
            
            newMenuEntry.appendChild(newMenuLink);
            this.elements.el.appendChild(newMenuEntry);
        }

        var that = this;
        window.setTimeout(function () {
            that.menuPaginator = new oblio.classes.MenuPaginator({
                wrapper: that.elements.wrapper
            });
        }, 50);        
    }

    function selectMenuItem (section_name, animate) {
        if(this.verbose)console.log('Main Menu | '+this.menuID+' | selectMenuItem: '+section_name);

        var selected = $(this.elements.el).find('a[data-section="' + section_name + '"]');

        if (selected.length === 0) {
            return;
        }

        if (this.elements.selected[0]) {
            this.elements.selected[0].className = '';
        }

        animate = true;

        if (isMobile) {
            // $('#mainNav').removeClass('open');
        }

        this.elements.selectedID = section_name;
        this.elements.selected = selected;
        this.elements.selected[0].className = 'selected';

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
        var vSplit = String(e.target.rel).split(',');
        window.open(vSplit[0], "_blank", "width="+vSplit[1]+", height="+vSplit[2]);
        return false;
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

    Menu.prototype.init = init;
    Menu.prototype.openPopUp = openPopUp;
    Menu.prototype.hide = hide;
    Menu.prototype.show = show;
    Menu.prototype.buildMenu = buildMenu;
    Menu.prototype.resize = resize;
    Menu.prototype.selectMenuItem = selectMenuItem;

    return Menu;
}));
