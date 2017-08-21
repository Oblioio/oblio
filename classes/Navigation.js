import { ArrayExecuter } from '../../../app/js/oblio/utils/ArrayExecuter.js';
import 'OblioUtils/utils/SectionLoader';
import 'OblioUtils/classes/Menu';

// define([
//         'oblio/utils/SectionLoader',
//         'oblio/utils/ArrayExecuter',
//         'oblio/classes/Menu'
//     ], function () {

    'use strict';
/*jshint validthis:true */

    var Navigation = function (sectionContainerID) {
        this.shellID = sectionContainerID || 'shell';
        this.shell = document.getElementById(this.shellID);
        this.verbose = false;
        this.currentSection = '';
        this.previous_section = '';
        this.forceChange = false;
        this.loadlist = [];
        this.arrayExecuter = ArrayExecuter(null, 'Navigation');
        this.active = true;

        this.changeOrder = [
            'load',
            'section_add_next',
            'section_init_next',
            'section_hide_prev',
            'section_shutdown_prev',
            'section_startup_next',
            'section_show_next'
        ];

        window.onpopstate = onPopState.bind(this);
    };

    function parseDeepLink(){
        var home = oblio.settings.homeSection || 'home';

        var base = oblio.settings.baseUrl,
            url_arr,
            path_arr,
            curr_url = window.location.href.split('?')[0]; // drop query string
        if (oblio.settings.baseUrl && oblio.settings.baseUrl !== '') {
            path_arr = curr_url.replace(oblio.settings.baseUrl, '').split('/');
            this.currentSection = path_arr[0] !== '' ? path_arr[0] : oblio.settings.homeSection;
            this.currentSubsection = path_arr[1];
        } else {
            var hash = window.location.hash;
            if (hash.match('#/')) {
                path_arr = hash.replace('#/', '').split('/');
                this.currentSection = path_arr.length > 0 ? path_arr[0] : oblio.settings.homeSection;
                this.currentSubsection = path_arr[1];
            } else {
                this.currentSection = oblio.settings.homeSection;
            }
        }

    }

    // function changeSection(sectionID, subSectionID, completeFn, pop){
    function changeSection(sectionID, completeFn){

        var subSectionID = null;
        var pop = false;

        if (this.verbose) {
            console.log('Navigation | changeSection: ' + sectionID + ' | ' + subSectionID);
        }

        var hash = window.location.hash;
        if (sectionID.match(/^#/)) sectionID = 'home';

        // if the user clicked the back or forward button while section is changing, tack the change on to arrayExecuter
        if (!this.active) {
            if (pop) {
                this.arrayExecuter.tackOn([{fn: this.changeSection, scope: this, vars: [sectionID, subSectionID, null, true]}]);
            }
            return;
        }

        if (this.currentSection === sectionID && !this.forceChange) {
            // go to subsection if defined
            if (subSectionID && oblio.sections[sectionID].enterSubSection) {
                oblio.sections[sectionID].enterSubSection(subSectionID);
            }
            return;
        }

        if (oblio.app.mainMenu) {
            oblio.app.mainMenu.selectMenuItem(sectionID);
        }

        if (this.currentSection !== sectionID) {
            this.previous_section = this.currentSection;
        }

        this.currentSection = sectionID;
        this.currentSubsection = subSectionID || '';

        if (!pop && oblio.settings.deepLinking !== false && window.history && window.history.pushState && this.previous_section !== '' ) {

            var data = {
                currentSection: this.currentSection,
                currentSubsection: this.currentSubsection
            };

            // if base element exists, make sure we're using that for our pushstate stuff
            if (oblio.settings.baseUrl && oblio.settings.baseUrl !== '' && oblio.settings.htaccess !== false) {
                // pushState breaks fullscreen in chrome, so check if fullscreen first
                if( window.innerHeight !== screen.height) {
                    history.pushState(data, '', (this.currentSection == 'home' ? oblio.settings.baseUrl + hash : oblio.settings.baseUrl + this.currentSection + '/' + this.currentSubsection + hash ));
                }
            } else {
                // pushState breaks fullscreen in chrome, so check if fullscreen first
                if( window.innerHeight !== screen.height) {
                    history.pushState(data, '', (this.currentSection == 'home' ? oblio.settings.baseUrl + hash : oblio.settings.baseUrl + '#/' + this.currentSection + '/' + this.currentSubsection ));
                }
            }
        }

        this.loadQueue(sectionID);

        this.arrayExecuter.execute(this.assembleChangeFunction(completeFn));

        this.forceChange = false;
    }

    function onPopState (event) {
        if (!event.state) return;
        this.changeSection(event.state.currentSection, event.state.currentSubSection, null, true);
    }

    function assembleChangeFunction (completeFn) {

        var function_arr = [{fn: this.disable, vars: null}];
        console.log(this.changeOrder);
        for (var i = 0; i < this.changeOrder.length; i++) {
            switch (this.changeOrder[i]) {
                case 'load':
                    function_arr.push({fn: this.load, scope: this, vars: null});
                    break;
                case 'section_add_next':
                    function_arr.push({fn: this.section_add, scope: this, vars: [this.currentSection]});
                    break;
                case 'section_init_next':
                    function_arr.push({fn: this.section_init, scope: this, vars: [this.currentSection]});
                    break;
                case 'section_startup_next':
                    function_arr.push({fn: this.section_startup, scope: this, vars: [this.currentSection]});
                    break;
                case 'section_show_next':
                    function_arr.push({fn: this.section_show, scope: this, vars: [this.currentSection]});
                    break;
                case 'section_hide_prev':
                    function_arr.push({fn: this.section_hide, scope: this, vars: [this.previous_section]});
                    break;
                case 'section_shutdown_prev':
                    function_arr.push({fn: this.section_shutdown, scope: this, vars: [this.previous_section]});
                    break;
                case 'section_remove_prev':
                    function_arr.push({fn: this.section_remove, scope: this, vars: [this.previous_section]});
                    break;
                default:
                    if(typeof this.changeOrder[i] === 'function'){
                        function_arr.push({fn: this.changeOrder[i], scope: this, vars: [this.currentSection, this.previous_section]});
                    } else {
                        console.log('assembleChangeFunction cannot add: ' + this.changeOrder[i]);
                    }
                    break;
            }
        }

        function_arr.push({fn: this.enable, scope: this, vars: null});
        if(completeFn)function_arr.push({fn: completeFn, vars: null});

        return function_arr;
    }

    /*
    --------------------------------------------------------------------------------------------------------------------
    Load Functions
    --------------------------------------------------------------------------------------------------------------------
    */

    function loadQueue(...args){

        for (var i = 0; i < args.length; i++) {
            if(this.verbose)console.log('Navigation | loadQueue: '+args[i]);
            if(oblio.utils.SectionLoader.sectionExists(args[i]))
                this.loadlist.push(args[i]);
            if(oblio.sections[args[i]])
                this.section_prepareLoad(args[i]);
        }
    }

    function load(...args){
        // if(this.verbose)console.log('Navigation | load', args);

        var reject;
        var resolve;

        // if the last 2 arguments are functions, they should be the resolve and reject functions passed by array executer
        if (args.length > 1) {
            if (typeof args[args.length - 2] === 'function') {
                var reject = args.pop();
                var resolve = args.pop();
                // this.loadlist.push(resolve);
            }
        }

        if (args.length) this.loadQueue(args);

        for (var i = 0; i < args.length; i++) {
            if (oblio.sections[this.currentSection].prepare) {
                oblio.sections[this.currentSection].prepare();
            }
        }

        var function_arr =  [
            {fn: oblio.utils.SectionLoader.loadSection, scope:oblio.utils.SectionLoader, vars: this.loadlist},
            {fn: this.load_done, scope: this, vars: [resolve]}
        ];

        this.arrayExecuter.execute(function_arr);
    }

    function load_done(callback){
        console.log('Navigation | load_done', callback);
        this.loadlist = [];
        if (callback) callback();
    }

    /*
    --------------------------------------------------------------------------------------------------------------------
    Section Functions
    --------------------------------------------------------------------------------------------------------------------
    */

    // prepare section
    function section_prepareLoad(sectionID){
        if(this.verbose)console.log('Navigation | section_prepareLoad: '+sectionID);

        if (oblio.sections[sectionID].prepare) {
            console.log('section ' + sectionID + ' has prepare function');
        }
        if (!oblio.sections[sectionID].prepared) {
            if (oblio.sections[sectionID].prepareLoad) {
                oblio.sections[sectionID].prepareLoad();
            }
            oblio.sections[sectionID].prepared = true;
        }
    }

    // adding htmlData to DOM
    function section_add(sectionID, callbackFn){

        if(this.verbose)console.log('Navigation | section_add: '+sectionID);
        this.shell = this.shell || document.getElementById(this.shellID);
        if(oblio.sections[sectionID] && !oblio.sections[sectionID].added){
            oblio.sections[sectionID].added = true;
            this.shell.insertAdjacentHTML('beforeend', oblio.utils.SectionLoader.returnSectionOBJ(sectionID).htmlData);
        }

        callbackFn();
    }

    // init section
    function section_init(sectionID, callbackFn){
        if(this.verbose)console.log('Navigation | section_init: '+sectionID);

        // lets auto add the section is not added

        if(!oblio.sections[sectionID].initialized){
            oblio.sections[sectionID].initialized = true;

            if (oblio.sections[sectionID].init) {
                oblio.sections[sectionID].init(callbackFn);
                return;
            }
        }

        // only called if section init function wasn't called
        callbackFn();
    }

    function section_startup(sectionID, callbackFn){
        if(this.verbose)console.log('Navigation | section_startup: '+sectionID);

        if (oblio.sections[sectionID]) {
            if(oblio.sections[sectionID].startup){
                oblio.sections[sectionID].startup(callbackFn);
            } else {
                var container = document.getElementById(sectionID);
                if (container) {
                    container.style.display = 'block';
                }
                callbackFn();
            }
        } else{
            callbackFn();
        }
    }

    function section_show(sectionID, callbackFn){
        if(this.verbose)console.log('Navigation | section_show: '+sectionID);

        if (oblio.sections[sectionID] && oblio.sections[sectionID].show) {
            oblio.sections[sectionID].show(callbackFn);
        } else{
            callbackFn();
        }
    }

    function section_hide(sectionID, callbackFn){
        if(this.verbose)console.log('Navigation | section_hide '+sectionID);

        if(oblio.sections[sectionID]){
            if (oblio.sections[sectionID].hide) {
                oblio.sections[sectionID].hide(callbackFn);
            } else {
                var container = document.getElementById(sectionID);
                if(container)container.style.display = 'none';
                callbackFn();
            }
        } else{
            callbackFn();
        }

    }

    function section_shutdown(sectionID, callbackFn){
        if(this.verbose)console.log('Navigation | section_shutdown: '+sectionID);

        if (oblio.sections[sectionID] && oblio.sections[sectionID].shutdown) {
            oblio.sections[sectionID].shutdown(callbackFn);
        } else {
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

        if (oblio.sections[sectionID].destroy) {
            oblio.sections[sectionID].destroy();
            oblio.sections[sectionID].initialized = false;
        }

        if(oblio.sections[sectionID].added){
            oblio.sections[sectionID].added = false;
            document.getElementById(sectionID).remove();
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

        if (oblio.sections[sectionID].freeze) {
            oblio.sections[sectionID].freeze();
        }
    }

    // un-freeze site when returning from external link
    function unFreezeSite(){
        if(this.verbose)console.log('navigation_unFreezeSite');

        if (oblio.sections[sectionID].unfreeze) {
            oblio.sections[sectionID].unfreeze();
        }
    }

    function unFreezeSiteDone(){
        if(this.verbose)console.log('navigation_unFreezeSiteDone');
    }


    Navigation.prototype.parseDeepLink = parseDeepLink;
    Navigation.prototype.changeSection = changeSection;
    Navigation.prototype.assembleChangeFunction = assembleChangeFunction;

    Navigation.prototype.loadQueue = loadQueue;
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

    window.oblio = window.oblio || {};
    oblio.classes = oblio.classes || {};
    oblio.classes.Navigation = Navigation;

    // return oblio.classes.Navigation;
// });