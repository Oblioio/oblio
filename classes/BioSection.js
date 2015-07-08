define([
        'mustache',
        'text!oblio/templates/BioSectionTemplate.mustache',
        'oblio/utils/Inherit',
        'oblio/utils/DeviceDetect',
        'oblio/classes/Navigation',
        'oblio/packages/jquery.tinyscrollbar',
        'oblio/classes/Section',
        'greensock/TweenLite.min',
        'greensock/easing/EasePack.min',
        'greensock/plugins/CSSPlugin.min'
    ], function (Mustache, biosTemplate) {

    var myName = "BioSection",
        that,
        data;

    var BioSection = function () {
        console.log('hey there ' + myName);
        this.name = myName.toLowerCase();
        this.section_scroll = false;
        this.initialized = false;
        this.biosTemplate = biosTemplate;
    }

    function init (callback) {
        console.log('init ' + myName);
        that = this;

        data = oblio.app.dataSrc.sections[this.name].data;

        this.elements = {
            sectionWrapper: document.getElementById(this.name)
        }

        // add slugify helper function to data to be used to add ids to bios in the biosTemplate
        data.slugify = function () {
            return function (text, render) {
                return render(text)
                    .toLowerCase()
                    .replace(/[^\w ]+/g,'')
                    .replace(/ +/g,'_')
                    ;
            }
        }

        // add toUppercase helper to change actor names to uppercase for bio heads
        data.toUppercase = function () {
            return function (text, render) {
                return render(text)
                    .toUpperCase()
                    ;
            }
        }

        data.section = this.name;

        this.elements[this.name + 'Wrapper'] = document.getElementById(this.name + '_wrapper');

        this.buildBioSection(data);

        this.elements.scrollable = $('#' + this.name + ' .scrollable');
        this.elements.viewport = $('#' + this.name + ' .viewport');

        onHideComplete.apply(this);

        if (callback) {
            callback();
        }

    }

    function buildBioSection (data) {
        var bioSection_template = this.biosTemplate.replace(/^\s+|\s+$|\s+(?=\s)/g, ""),
            template_obj = {},
            bioSection_html;

        template_obj[this.name] = bioSection_template;
        bioSection_html = Mustache.render(bioSection_template, data, template_obj);

        document.getElementById(this.name + 'Content').innerHTML = bioSection_html;

        this.bios = {};

        this.elements.list = document.getElementById(this.name + '_list');
        if (data.fontSizes.menu) {
            this.elements.list.style.fontSize = data.fontSizes.menu;
            this.elements.list.style.lineHeight = "1em";
        }

        this.elements.bios = this.elements.sectionWrapper.getElementsByClassName('bio');

        $(this.elements.list).find('li').first().addClass('active');

        this.bios.currId = this.elements.bios[0].id;

        for (var i = this.elements.bios.length - 1; i >= 0; i--) {
            this.bios[this.elements.bios[i].id] = this.elements.bios[i];
        };

        $(this.elements.list).on('click', 'a', this.handleListClick.bind(this));

        var css = '',
            head = document.head || document.getElementsByTagName('head')[0],
            style = document.createElement('style');

        if (data.fontSizes.character) {
            css += '#' + this.name + ' .bio h2 { font-size: ' + data.fontSizes.character + '; }';
        }

        if (data.fontSizes.name) {
            css += '#' + this.name + ' .bio h3 { font-size: ' + data.fontSizes.name + '; }';
        }

        if (data.fontSizes.bio) {
            css += '#' + this.name + ' .bio .overview p { font-size: ' + data.fontSizes.bio + '; }';
        }

        style.type = 'text/css';
        if (style.styleSheet){
          style.styleSheet.cssText = css;
        } else {
          style.appendChild(document.createTextNode(css));
        }

        head.appendChild(style);
    }

    function handleListClick (e) {
        var clicked = e.currentTarget,
            id = clicked.href.split('#')[1];

        console.log('ID', id, this.bios.currId, this);

        $(this.elements.list).find('.active').removeClass('active');
        clicked.parentNode.className = 'active';

        if (this.bios.currId) {
            if (id === this.bios.currId) {
                return false;
            }
            this.switchBio();
        }

        this.bios.currId = id;
        // that.bios[id].slideshow.show();
        // that.resize();

        return false;
    }

    function switchBio () {
        TweenLite.to(this.bios[this.bios.currId], 0.4, {x: "20px", autoAlpha: 0, ease: Expo.easeIn, onComplete: onHideComplete.bind(this)});
        // this.bios[this.bios.currId].slideshow.hide(onHideComplete.bind(this));
    }

    function onHideComplete () {
        // this.bios[this.bios.currId].slideshow.show();
        TweenLite.fromTo(this.bios[this.bios.currId], 1, {x:"-20px", autoAlpha: 0}, {x: "0px", autoAlpha: 1, ease: Expo.easeOut});
        this.resize();
    }

    function startup (callbackFn) {
        this.curr_bg = oblio.app.BGManager.getBg(oblio.classes.Navigation.current_section, true, true);
        switch (this.curr_bg) {
            case 'background_3':
                this.viewportHeightRatio = 3;
                break;
            case 'background_0':
                this.viewportHeightRatio = 4;
                break;
            default:
                this.viewportHeightRatio = 3;
        }
        if (callbackFn)callbackFn();
    }

    function show (callBackFn) {

        this.elements.sectionWrapper.style.display = 'block';

        if(!this.section_scroll){
            this.section_scroll = true;
            this.elements.scrollable.tinyscrollbar({invertscroll: oblio.utils.DeviceDetect.isMobile});
        }
        this.elements.scrollable.tinyscrollbar_update();

        this.resize();

        TweenLite.fromTo(this.elements.sectionWrapper, 0.5, {alpha:0}, {alpha:1});
        TweenLite.fromTo(this.elements[this.name + 'Wrapper'], 0.5, {y: "20px"}, {y: "0px"});

        if(callBackFn)callBackFn();
    }

    function hide (callbackFn) {
        var that = this;
        TweenLite.to(this.elements.sectionWrapper, 0.35, {alpha:0, ease: Expo.easeIn});
        TweenLite.to(this.elements[this.name + 'Wrapper'], 0.35, {y: "-20px", ease: Expo.easeIn, onComplete: function () {
            that.elements.sectionWrapper.style.display = 'none';
            if (callbackFn)callbackFn();
        }});
    }

    function shutdown (callBackFn){
        if(callBackFn)callBackFn();
    }

    function resize () {
        var windowHeight = oblio.settings.windowDimensions.height,
            idealWindowHeight = 1500,
            percentageOfIdealHeight = Math.min(1, windowHeight / idealWindowHeight),
            minPercentage = 0.03,
            maxPercentage = 0.1,
            percentage = minPercentage + ((maxPercentage - minPercentage) * percentageOfIdealHeight),
            wrapperTop = Math.min(percentage * windowHeight, 110),
            viewportHeight = windowHeight / this.viewportHeightRatio;

        this.elements[this.name + 'Wrapper'].style.top = wrapperTop + 'px';

        this.elements.viewport.height(viewportHeight + 'px');
        if (this.section_scroll) {
            this.elements.scrollable.tinyscrollbar_update();
        }

        console.log(this.curr_bg);
    }

    // inherit from base class Section
    oblio.utils.inherit(BioSection, oblio.classes.Section);

    // override base class init function to set up this sections's elements
    BioSection.prototype.startup = startup;
    BioSection.prototype.buildBioSection = buildBioSection;
    BioSection.prototype.show = show;
    BioSection.prototype.hide = hide;
    // BioSection.prototype.shutdown = shutdown;
    BioSection.prototype.init = init;
    BioSection.prototype.handleListClick = handleListClick;
    BioSection.prototype.switchBio = switchBio;
    BioSection.prototype.resize = resize;
    BioSection.prototype.onHideComplete = onHideComplete;

    window.oblio = window.oblio || {};
    oblio.classes = oblio.classes || {};
    oblio.classes.BioSection = BioSection;

    return oblio.classes.BioSection;
});