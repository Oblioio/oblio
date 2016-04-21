define([
        'mustache',
        'oblio/utils/DeviceDetect',
        'oblio/classes/Menu'TweenMax
    ], function (Mustache) {

    'use strict';

    var Shell = function (el) {
        this.elements = {
            shell: document.getElementById('shell')
        };
    };

    function init(callbackFn) {
        console.log('Shell Init');
        var sectionOBJ = oblio.utils.SectionLoader.returnSectionOBJ('main');

        placeHTML.call(this);

        window.requestAnimationFrame(function(){
            this.ready(callbackFn);
        }.bind(this));
    }

    function placeHTML () {
        var wrapper = document.getElementById('shell');

        var content = oblio.app.dataSrc.sections.main.data;

            content.slugify = function () {
                return function (text, render) {
                    return render(text)
                        .toLowerCase()
                        .replace(/[^\w ]+/g,'')
                        .replace(/ +/g,'_')
                        ;
                };
            };

        var template = oblio.utils.SectionLoader.returnSectionOBJ('main').template,
            html = Mustache.render(template, content);

        wrapper.innerHTML = html;
    }

    function ready(callbackFn){
        console.log('Shell ready');
        this.initialized = true;

        oblio.app.Footer.init(oblio.app.Footer.show.bind(oblio.app.Footer));

        this.setupMenu();
        this.resize();

        callbackFn();
    }

    function setLayout () {
        var w = oblio.settings.windowDimensions.width,
            h = oblio.settings.windowDimensions.height;

        if (w <= 414 && h >= w) {
            oblio.settings.layout = 'narrow';
            return;
        }

        if (h <= 414 && w >= h) {
            oblio.settings.layout = 'short';
            return;
        }

        oblio.settings.layout = 'desktop';
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

        oblio.app.mainMenu.init(oblio.app.navigation.currentSection);

        document.getElementById('menu').addEventListener('click', function (e) {
            e.preventDefault();

            var el = e.target;
            if (el.matches('a')) {
                // for links defined as external in json
                if (el.getAttribute('target') === '_blank') {
                    return;
                }

                var section_name = el.getAttribute('data-section');

                if (el.getAttribute('data-type') === 'overlay') {
                    oblio.functions.showOverlay(section_name);
                } else {
                    oblio.app.navigation.changeSection(section_name);
                }

            }
        }, false);
    }

    function resize(){
        if(!this.initialized)return;

        var w, h;

        oblio.settings.windowDimensions = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        setLayout();

        w = Math.max(oblio.settings.minWidth, oblio.settings.windowDimensions.width),
        h = Math.max(oblio.settings.minHeight, oblio.settings.windowDimensions.height);

        this.elements.shell.style.width = w + 'px';

        if (!document.documentElement.className.match(/^(?=.*\bipad\b)(?=.*\bios7\b)/)) {
            this.elements.shell.style.height = h + 'px';
        }

        if (oblio.app.mainMenu && oblio.app.mainMenu.elements) {
            oblio.settings.menuWidth = oblio.app.mainMenu.elements.el.offsetWidth;
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
                        h = oblio.settings.windowDimensions.height = 672;
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

        if (oblio.sections[oblio.app.navigation.currentSection]) {
            if (oblio.sections[oblio.app.navigation.currentSection].initialized) {
                oblio.sections[oblio.app.navigation.currentSection].resize(w, h);
            }
        }

        if (oblio.app.mainMenu) {
            oblio.settings.menuWidth = oblio.app.mainMenu.resize();
        }
        
        if (oblio.app.Footer)oblio.app.Footer.resize();

        if (oblio.settings.windowDimensions.width < oblio.settings.minWidth || oblio.settings.windowDimensions.height < oblio.settings.minHeight) {
            this.elements.shell.style.position = 'absolute';
        } else {
            this.elements.shell.style.position = 'fixed';
        }

    }

    Shell.prototype.init = init;
    Shell.prototype.setLayout = setLayout;
    Shell.prototype.ready = ready;
    Shell.prototype.setupMenu = setupMenu;
    Shell.prototype.resize = resize;

    window.oblio = window.oblio || {};
    oblio.classes = oblio.classes || {};
    oblio.classes.Shell = Shell;

    return oblio.classes.Shell;
});