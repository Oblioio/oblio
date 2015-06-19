// UMD (Universal Module Definition) patterns for JavaScript modules that work everywhere.
// https://github.com/umdjs/umd/blob/master/amdWebGlobal.js

;(function (root, factory) {
    // Browser globals
    root.classes = root.classes || {};

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
                'jquery',
                'oblio/utils/SectionLoader',
                'oblio/utils/ArrayExecuter',
                'oblio/classes/Menu'
            ], function () {
            return (root.classes.Navigation = factory());
        });
    } else {
        root.classes.Navigation = factory();
    }
}(window.oblio = window.oblio || {}, function () {

    'use strict';

    var Navigation = function (sectionContainerID) {
        this.shell = sectionContainerID || "shell";
        this.verbose = false;
        this.current_section = '';
        this.previous_section = '';
        this.forceChange = false;
        this.loadlist = [];
        this.arrayExecuter = new oblio.utils.ArrayExecuter(this, "navigation");
        this.stepComplete = this.arrayExecuter.stepComplete.bind(this.arrayExecuter);
        this.active = true;

        this.changeOrder = [
                "load",
                "section_add_next",
                "section_init_next",
                "section_hide_prev",
                "section_shutdown_prev",
                "section_startup_next",
                "section_show_next"
            ]

    }

    function parseDeepLink(deeplink){
        // split the deeplink at slash to grab the section name
        this.current_section = typeof(deeplink) === 'undefined' || deeplink === '' ? 'home' : deeplink.split('/')[0];
    }

    function changeSection(sectionID, subSectionID, completeFn){
        if(this.verbose)console.log('Navigation | changeSection: '+sectionID+" | "+subSectionID);
        if(!this.active)return;
        if (this.current_section === sectionID && !this.forceChange) {
            // go to subsection if defined
            if(subSectionID && oblio.sections[sectionID]['enterSubSection'])
                oblio.sections[sectionID]['enterSubSection'](subSectionID);
            return;
        }

        if (oblio.app.mainMenu) {
            oblio.app.mainMenu.selectMenuItem(sectionID);
        }

        if (this.current_section != sectionID)this.previous_section = this.current_section;
        this.current_section = sectionID;

        if (oblio.settings.deepLinking !== false && window.history && window.history.pushState && this.previous_section != '' ){
            // pushState breaks fullscreen in chrome, so check if fullscreen first
            if( window.innerHeight != screen.height) {
                history.pushState('data', '', (this.current_section == 'home' ? oblio.settings.base_path : oblio.settings.base_path + this.current_section + '.php' ));
            }
        }

        this.load_queue(sectionID);

        this.arrayExecuter.execute(this.assembleChangeFunction(completeFn));

        this.forceChange = false;
    }

    function assembleChangeFunction(completeFn){
        var function_arr = [{fn: this.disable, vars: [this.stepComplete]}];
        for(var i=0; i<this.changeOrder.length; i++){
            switch(this.changeOrder[i]){
                case 'load':
                    function_arr.push({fn: this.load, vars: [this.stepComplete]});
                    break;
                case 'section_add_next':
                    function_arr.push({fn: this.section_add, vars: [this.current_section, this.stepComplete]});
                    break;
                case 'section_init_next':
                    function_arr.push({fn: this.section_init, vars: [this.current_section, this.stepComplete]});
                    break;
                case 'section_startup_next':
                    function_arr.push({fn: this.section_startup, vars: [this.current_section, this.stepComplete]});
                    break;
                case 'section_show_next':
                    function_arr.push({fn: this.section_show, vars: [this.current_section, this.stepComplete]});
                    break;
                case 'section_hide_prev':
                    function_arr.push({fn: this.section_hide, vars: [this.previous_section, this.stepComplete]});
                    break;
                case 'section_shutdown_prev':
                    function_arr.push({fn: this.section_shutdown, vars: [this.previous_section, this.stepComplete]});
                    break;
                case 'section_remove_prev':
                    function_arr.push({fn: this.section_remove, vars: [this.previous_section, this.stepComplete]});
                    break;
                default:
                    if(typeof this.changeOrder[i] === 'function'){
                        function_arr.push({fn: this.changeOrder[i], vars: [this.current_section, this.previous_section, this.stepComplete]});
                    } else {
                        console.log("assembleChangeFunction cannot add: "+this.changeOrder[i]);
                    }
                    break;
            }
        }

        function_arr.push({fn: this.enable, vars: [this.stepComplete]});
        if(completeFn)function_arr.push({fn: completeFn, vars: null});

        return function_arr;
    }

    /*
    --------------------------------------------------------------------------------------------------------------------
    Load Functions
    --------------------------------------------------------------------------------------------------------------------
    */

    function load_queue(arr){
        var args = Array.prototype.slice.call(arguments);

        for (var i = 0; i < args.length; i++) {
            if(this.verbose)console.log('Navigation | load_queue: '+args[i]);
            if(oblio.utils.SectionLoader.sectionExists(args[i]))
                this.loadlist.push(args[i]);
            if(oblio.sections[args[i]])
                this.section_prepareLoad(args[i]);
        }
    }

    function load(callbackFn, sectionsToLoad){
        if(this.verbose)console.log('Navigation | load');

        // add any sections to the load list
        var args = Array.prototype.slice.call(arguments);
        args.shift();
        if(args.length)this.load_queue(args);

        for (var i = 0; i < args.length; i++) {
            if(oblio.sections[sectionID]['prepare']){
                oblio.sections[sectionID]['prepare']();
            }
        }

        // add stepComplete
        this.loadlist.push(this.stepComplete);

        var function_arr =  [
            {fn: oblio.utils.SectionLoader.loadSection, scope:oblio.utils.SectionLoader, vars: this.loadlist},
            {fn: this.load_done, vars: null},
            {fn: callbackFn, vars: null}
        ];

        this.arrayExecuter.execute(function_arr);
    }

    function load_done(){
        if(this.verbose)console.log('Navigation | load_done');
        this.loadlist = [];
        this.stepComplete();
    }

    /*
    --------------------------------------------------------------------------------------------------------------------
    Section Functions
    --------------------------------------------------------------------------------------------------------------------
    */

    // prepare section
    function section_prepareLoad(sectionID){
        if(this.verbose)console.log('Navigation | section_prepareLoad: '+sectionID);

        if(oblio.sections[sectionID]['prepare']){
            console.log('section '+sectionID+' has prepare function')
        }
        if(!oblio.sections[sectionID].prepared){
            if(oblio.sections[sectionID]['prepareLoad']){
                oblio.sections[sectionID]['prepareLoad']();
            }
            oblio.sections[sectionID].prepared = true;
        }
    }

    // adding htmlData to DOM
    function section_add(sectionID, callbackFn){
        if(this.verbose)console.log('Navigation | section_add: '+sectionID);
        var shell = (oblio.sections[sectionID] && oblio.sections[sectionID].shell)?oblio.sections[sectionID].shell:"#"+this.shell;

        if(oblio.sections[sectionID] && !oblio.sections[sectionID].added){
            oblio.sections[sectionID].added = true;
            oblio.sections[sectionID].htmlElem = $(oblio.utils.SectionLoader.returnSectionOBJ(sectionID).htmlData);
            $(shell).append(oblio.sections[sectionID].htmlElem);
        }

        callbackFn();
    }

    // init section
    function section_init(sectionID, callbackFn){
        if(this.verbose)console.log('Navigation | section_init: '+sectionID);

        // lets auto add the section is not added

        if(!oblio.sections[sectionID].initialized){
            oblio.sections[sectionID].initialized = true;

            if(oblio.sections[sectionID]['init']){
                oblio.sections[sectionID]['init'](callbackFn);
                return;
            }
        }

        // only called if section init function wasn't called
        callbackFn();
    }

    function section_startup(sectionID, callbackFn){
        if(this.verbose)console.log('Navigation | section_startup: '+sectionID);

        if(oblio.sections[sectionID]){
            if(oblio.sections[sectionID]['startup']){
                oblio.sections[sectionID]['startup'](callbackFn);
            } else {
                var container = document.getElementById(sectionID);
                if(container)container.style.display = "block";
                callbackFn();
            }
        } else{
            callbackFn();
        }
    }

    function section_show(sectionID, callbackFn){
        if(this.verbose)console.log('Navigation | section_show: '+sectionID);

        if(oblio.sections[sectionID] && oblio.sections[sectionID]['show']){
            oblio.sections[sectionID]['show'](callbackFn);
        } else{
            callbackFn();
        }
    }

    function section_hide(sectionID, callbackFn){
        if(this.verbose)console.log('Navigation | section_hide '+sectionID);

        if(oblio.sections[sectionID]){
            if(oblio.sections[sectionID]['hide']){
                oblio.sections[sectionID]['hide'](callbackFn);
            } else {
                var container = document.getElementById(sectionID);
                if(container)container.style.display = "none";
                callbackFn();
            }
        } else{
            callbackFn();
        }

    }

    function section_shutdown(sectionID, callbackFn){
        if(this.verbose)console.log('Navigation | section_shutdown: '+sectionID);

        if(oblio.sections[sectionID] && oblio.sections[sectionID]['shutdown']){
            oblio.sections[sectionID]['shutdown'](callbackFn);
        } else{
            callbackFn();
        }
    }

    // remove htmlData from DOM
    function section_remove(sectionID, callbackFn){
    	if(this.verbose)console.log('Navigation | section_remove '+sectionID);
        if(!oblio.sections[sectionID]){
    		callbackFn();
    		return;
    	}
        var shell = (oblio.sections[sectionID] && oblio.sections[sectionID].shell)?oblio.sections[sectionID].shell:"#"+this.shell;

        if(oblio.sections[sectionID]['destroy']){
            oblio.sections[sectionID]['destroy']();
            oblio.sections[sectionID].initialized = false;
    	}

        if(oblio.sections[sectionID].added){
            oblio.sections[sectionID].added = false;
            $(oblio.sections[sectionID].htmlElem).remove();
            oblio.sections[sectionID].htmlElem = null;
        }

    	callbackFn();
    }

    /*
    --------------------------------------------------------------------------------------------------------------------
    Enable / Disable Functions
    --------------------------------------------------------------------------------------------------------------------
    */

    // enable navigation
    function enable(completeFn){
        if(this.verbose)console.log('/////// navigation_enable /////////');
        this.active = true;
        if(this.cover)this.cover.style.display = 'none';

        if(completeFn)completeFn();
    }

    // disable navigation
    function disable(completeFn){
    	if(this.verbose)console.log('/////// navigation_disable /////////');
    	this.active = false;

        /* turn on cover's display */
    	if(this.cover)this.cover.style.display = 'block';

    	if(completeFn)completeFn();
    }

    // freeze site when external link launched
    function freezeSite(){
    	if(this.verbose)console.log('navigation_freezeSite');

        if(oblio.sections[sectionID]['freeze']){
            oblio.sections[sectionID]['freeze']();
        }

        /* tween in a cover of some sort */

        // TweenLite.to($('#freezeSite'), 0.5, {css: {opacity: 1}});

        /* turn off the sound, and remember if it was off*/

    	// freezeSoundWasOn = soundIsOn;
    	// if(freezeSoundWasOn)soundToggle();
    }

    // un-freeze site when returning from external link
    function unFreezeSite(){
    	if(this.verbose)console.log('navigation_unFreezeSite');

        if(oblio.sections[sectionID]['unfreeze']){
            oblio.sections[sectionID]['unfreeze']();
        }

        /* if the sound was on before the freeze, turn it back on */
    	// if(freezeSoundWasOn)soundToggle();

        /* tween out whatever visuals were added, then call done */

    	// TweenLite.to($('#freezeSite'), 0.5, {css: {opacity: 0}, onComplete:unFreezeSiteDone});
    }

    function unFreezeSiteDone(){
    	if(this.verbose)console.log('navigation_unFreezeSiteDone');

        /* turn of display of any overlays */

    	// $('#darkenContent').css('display', 'none');
    	// $('#freezeSite').css('display', 'none');
    }


    Navigation.prototype.parseDeepLink = parseDeepLink;
    Navigation.prototype.changeSection = changeSection;
    Navigation.prototype.assembleChangeFunction = assembleChangeFunction;

    Navigation.prototype.load_queue = load_queue;
    Navigation.prototype.load = load;
    Navigation.prototype.load_done = load_done;

    Navigation.prototype.section_prepareLoad = section_prepareLoad;
    Navigation.prototype.section_add = section_add;
    Navigation.prototype.section_init = section_init;
    Navigation.prototype.section_startup = section_startup;
    Navigation.prototype.section_show = section_show;
    Navigation.prototype.section_hide = section_hide;
    Navigation.prototype.section_shutdown = section_shutdown;
    Navigation.prototype.section_remove = section_remove;

    Navigation.prototype.enable = enable;
    Navigation.prototype.disable = disable;

    return Navigation;
}));
