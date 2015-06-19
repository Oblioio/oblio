// UMD (Universal Module Definition) patterns for JavaScript modules that work everywhere.
// https://github.com/umdjs/umd/blob/master/amdWebGlobal.js

;(function (root, factory) {
    // Browser globals
    root.classes = root.classes || {};

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
                'jquery',
                'oblio/utils/DeviceDetect',
                'oblio/classes/Menu',
                'greensock/TweenLite.min',
                'greensock/easing/EasePack.min',
                'greensock/plugins/CSSPlugin.min'
            ], function () {
            return (root.classes.Shell = factory());
        });
    } else {
        root.classes.Shell = factory();
    }
}(window.oblio = window.oblio || {}, function () {

    'use strict';

    var Shell = function (el) {
        this.elements = {
            shell: $('#shell'),
            window: $(window)
        }
    }

    function init(callbackFn) {
        console.log('Shell Init');
        var sectionOBJ = oblio.utils.SectionLoader.returnSectionOBJ('main');

        // add html to page
        $('#shell').append($(sectionOBJ.htmlData));

        window.requestAnimationFrame(function(){
            this.ready(callbackFn);
        }.bind(this));
    }

    function ready(callbackFn){
        console.log('Shell ready');
        this.initialized = true;


        oblio.app.Footer.init(document.getElementById('footer'));

        if (oblio.app.navigation.current_section !== 'videos') {
            oblio.app.Footer.show();
        }

        this.setupMenu();
        this.resize();

        callbackFn();
    }

    function setupMenu(){

        // create menu
        var menuData = {
            menuID: 'menu',
            wrapperID: 'mainHeader',
            paginatorElID: 'mainNav',
            menuStyle: oblio.app.dataSrc.sections.main.data.menu.menuStyle,
            menuList: oblio.app.dataSrc.sections.main.data.menu.links
        };
        var menuTemplate = document.getElementById('menuTemplate');
        if(menuTemplate)menuData.template = menuTemplate.innerHTML;
        oblio.app.mainMenu = new oblio.classes.Menu(menuData);

        oblio.app.mainMenu.init(oblio.app.navigation.current_section);

        // setup menu clicks
        $('#menu').on('click', 'a', function (e) {

            // for links defined as external in json
            if (this.getAttribute('target') === '_blank') {
                return;
            }

            var section_name = $(this).data('section');

            if (this.getAttribute('data-type') === 'overlay') {
                oblio.functions.showOverlay(section_name);
            } else {
                // oblio.app.main.changeSection(section_name);
                oblio.app.navigation.changeSection(section_name);
            }

            // e.preventDefault();
            return false;
        });
    }

    function resize(){
        if(!this.initialized)return;

        var w, h;

        oblio.settings.window_dimensions = {
            width: this.elements.window.width(),
            height: this.elements.window.height()
        }

        w = Math.max(oblio.settings.min_width, oblio.settings.window_dimensions.width),
        h = Math.max(oblio.settings.min_height, oblio.settings.window_dimensions.height);

        this.elements.shell[0].style.width = w + 'px';

        if (!document.documentElement.className.match(/^(?=.*\bipad\b)(?=.*\bios7\b)/)) {
            this.elements.shell[0].style.height = h + 'px';
        }

        if (oblio.app.mainMenu && oblio.app.mainMenu.elements) {
            oblio.settings.menu_width = oblio.app.mainMenu.elements.el.offsetWidth;
        }

        /**
        * Portrait messaging
        */
        if (oblio.settings.isAndroid || oblio.settings.isMobile || oblio.settings.isIOS){
            var main_mobileHorizontal = (w>h)?true:false;
            var portraitDiv = document.getElementById('portraitTest');
            // alert(portraitDiv);
            // alert(main_mobileHorizontal);

            if (portraitDiv) {
                // alert(main_mobileHorizontal);
                if(!main_mobileHorizontal){
                    portraitDiv.style.display = 'block';
                } else {
                    portraitDiv.style.display = 'none';
                    if (oblio.settings.isIpad) {
                        h = oblio.settings.window_dimensions.height = 672;
                    }
                }
            }

            //double check that zooming hasn't messup dimensions, if so correct the dimensions
            if(w != 1000){
                h = h*(1000/w);
                w = 1000;
            }
        }

        oblio.settings.sectionWidth = w;

        if (oblio.app.BGRenderer) {
            oblio.app.BGRenderer.resize();
        }

        if (oblio.sections[oblio.app.navigation.current_section]) {
            if (oblio.sections[oblio.app.navigation.current_section].initialized) {
                oblio.sections[oblio.app.navigation.current_section].resize(w, h);
            }
        }

        if (oblio.app.mainMenu) {
            oblio.settings.menu_width = oblio.app.mainMenu.resize();
        }

        if (oblio.settings.window_dimensions.width < oblio.settings.min_width || oblio.settings.window_dimensions.height < oblio.settings.min_height) {
            this.elements.shell[0].style.position = 'absolute';
        } else {
            this.elements.shell[0].style.position = 'fixed';
        }

    }

    Shell.prototype.init = init;
    Shell.prototype.ready = ready;
    Shell.prototype.setupMenu = setupMenu;
    Shell.prototype.resize = resize;

    return Shell;
}));
