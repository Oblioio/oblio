'use strict';

import { ArrayExecuter } from 'OblioUtils/utils/ArrayExecuter';

var arrayExecuter = ArrayExecuter(null, 'ShareShelf');

var prototype = {
    init: function (el, callback) {
        this.el = el;
        
        let functionArr =  [
            { fn: googlePlusScript, vars: null },
            { fn: twitterScript, vars: null },
            { fn: facebookScript, vars: null },
            { fn: callback, vars: null }
        ];

        arrayExecuter.execute(functionArr);
    },
    open: function () {
        if (this.isOpen) return;

        var that = this;
        let share = this.el;

        var mousedownHandler = function (e) {
            that.close();
            window.removeEventListener('mousedown', mousedownHandler);
        }

        window.addEventListener('mousedown', mousedownHandler);

        this.isOpen = true;
        share.style.zIndex = 9;
        TweenLite.to(share, 0.5, {y: '0px', ease:Power4.easeInOut});
    },
    close: function () {
        if (!this.isOpen) return;

        let share = this.el;
        let share_height = share.offsetHeight;

        this.isOpen = false;

        TweenLite.to(share, 0.5, {y: share_height + 'px', ease:Power4.easeInOut, onComplete: function () {
            share.style.zIndex = 0;
        }.bind(this)});
    }
}

function twitterScript (callback) {

    window.twttr = (function (d,s,id) {
        var t, js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return; js=d.createElement(s); js.id=id;
        js.src="https://platform.twitter.com/widgets.js"; fjs.parentNode.insertBefore(js, fjs);
        return window.twttr || (t = { _e: [], ready: function(f){ t._e.push(f) } });
    }(document, "script", "twitter-wjs"));

    if (window.twttr) {
        twttr.ready(function (twttr) {
            // callback();
            twttr.events.bind('click', function () {
                // videos_pause();
            });
        });
    }
    
    window.setTimeout(callback, 100);
}

function facebookScript (callback) {
    var appID = oblio.settings.FBAppID || '';
    var initFB = function () {
        FB.init({
            appId: appID,
            xfbml      : true,  // parse social plugins on this page
            version    : 'v2.11' // use version 2.11
        });
        // window.setTimeout(callback, 500);
    };

    window.setTimeout(callback, 500);

    if (window.FB) {
        initFB();
    } else {
        (function(d, s, id){
           var js, fjs = d.getElementsByTagName(s)[0];
           if (d.getElementById(id)) {return;}
           js = d.createElement(s); js.id = id;
           js.src = "//connect.facebook.net/en_US/sdk.js";
           fjs.parentNode.insertBefore(js, fjs);
         }(document, 'script', 'facebook-jssdk'));

        window.fbAsyncInit = initFB;
    }
}

function googlePlusScript (callback) {

    var gPlusOne,
        container = document.getElementById('gPlusBtn');

    if (container) {
        gPlusOne = document.createElement('div');
        gPlusOne.className = 'g-plusone';
        gPlusOne.setAttribute("size", "small");
        gPlusOne.setAttribute("annotation", "none");
        gPlusOne.setAttribute("data-href", container.getAttribute('data-href'));
        container.appendChild(gPlusOne);

        var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
        po.src = 'https://apis.google.com/js/platform.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);

        window.setTimeout(callback, 100);
    } else {
        if (callback) {
            callback();
        }
    }
}

export var ShareShelf = {
    getNew: function () {
        return Object.assign(Object.create(prototype), {
            isOpen: false
        });
    }
}