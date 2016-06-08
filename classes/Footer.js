define([], function () {

    'use strict';

    var data;
    var arrayExecuter = new oblio.utils.ArrayExecuter();

    var Footer = function () {
    };

    function init (callback) {

        this.elements = {
            el: document.getElementById('footer')
        };

        var clickEvent = Modernizr.touch ? 'touchstart' : 'click';
        this.elements.el.addEventListener(clickEvent, function (e) {
            var target = Modernizr.touch ? e.touches[0].target : e.target;

            if (target.getAttribute('target') !== '_blank') e.preventDefault();

            switch (target.id) {
                case 'credits-button':
                    this.toggleCredits(e);
                    break;
                case 'sharelabel':
                    this.toggleShare(e);
                    break;
                case 'creditsbox-close':
                    this.toggleCredits(e);
                    break;
                case 'share-facebook':
                    window.open('http://www.facebook.com/share.php?u=' + encodeURIComponent(target.getAttribute('href'), '_blank'));
                    break;
                default:
            }

        }.bind(this), true);

        var functionArr =  [];

        if (document.getElementById('shareShelf')) {
            functionArr.push({ fn: initShare, scope: this, vars: [arrayExecuter.stepComplete.bind(arrayExecuter)] });
        }

        if (callback) {
            functionArr.push({ fn: callback, vars: null });
        }

        arrayExecuter.execute(functionArr);

    }

    function showMPAARequirements(){

        var data = oblio.app.dataSrc.sections.main.data,
            mpaaRequirementsJSON = data.MPAA_requirements,
            mpaaRequirementsElement = document.getElementById('MPAA_requirements');

        if (mpaaRequirementsElement) {
            oblio.settings.mpaaShown = true;
            TweenLite.to(mpaaRequirementsElement, 1, {y: '0px', ease: Power4.easeInOut});

            window.setTimeout(function () {
                this.hideMPAARequirements();
            }.bind(this), 6000);
        }

    }

    function hideMPAARequirements(){
        var mpaaRequirementsElement = document.getElementById('MPAA_requirements');
        TweenLite.to(mpaaRequirementsElement, 1, {y: mpaaRequirementsElement.offsetHeight + 'px', ease:Power4.easeInOut});
    }

    function initShare (callback) {

        var functionArr =  [
            { fn: googlePlusScript, vars: [arrayExecuter.stepComplete.bind(arrayExecuter)] },
            { fn: twitterScript, vars: [arrayExecuter.stepComplete.bind(arrayExecuter)] },
            { fn: facebookScript, vars: [arrayExecuter.stepComplete.bind(arrayExecuter)] },
            { fn: callback, vars: null }
        ];

        arrayExecuter.execute(functionArr);

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
                version    : 'v2.6' // use version 2.1
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
            gPlusOne.setAttribute("href", oblio.settings.base_url);
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

    function toggleShare(e){

        var shareShelf = document.getElementById('shareShelf'),
            sharelabel = document.getElementById('sharelabel'),
            sharelabelPadding = 6,
            shelf_height = shareShelf.offsetHeight,
            footer_height = this.elements.el.offsetHeight;

        if (sharelabel.className.match('active') !== null || e === 'close') {

            sharelabel.className = sharelabel.className.replace('active', '');

            TweenLite.set('#mainContent', {pointerEvents: 'auto'});
            TweenLite.to('#mainContent', 0.5, {y: '0px', autoAlpha: 1, ease:Power4.easeInOut});
            TweenLite.to(shareShelf, 0.5, {y: shelf_height + 'px', ease:Power4.easeInOut, onUpdateParams: ['{self}'], onUpdate: function (tween) {
                TweenLite.set(sharelabel, {y: Math.min(0, (tween.target._gsTransform.y - shelf_height) + (footer_height - sharelabel.offsetTop + sharelabelPadding)) + 'px'});
            }, onComplete: function () {
                shareShelf.style.zIndex = 0;
                sharelabel.style.zIndex = 1;
                TweenLite.set(sharelabel, {z:'0px'});
                if (this.restartMain) {
                    oblio.app.main.play();
                }
            }.bind(this)});

        } else {
            oblio.app.main.pause();

            sharelabel.className = sharelabel.className + ' active';

            sharelabel.style.zIndex = 10;
            shareShelf.style.zIndex = 9;
            TweenLite.set(sharelabel, {z:'1px'});

            TweenLite.set('#mainContent', {pointerEvents: 'none'});
            TweenLite.to('#mainContent', 0.5, {y: -(shelf_height - (footer_height - 10)) + 'px', autoAlpha: 0.25, ease:Power4.easeInOut});
            TweenLite.to(shareShelf, 0.5, {y: '0px', ease:Power4.easeInOut, onUpdateParams: ['{self}'], onUpdate: function (tween) {
                TweenLite.set(sharelabel, {y: Math.min(0, (tween.target._gsTransform.y - shelf_height) + (footer_height - sharelabel.offsetTop + sharelabelPadding)) + 'px'});
            }});

            if (document.getElementById('credits-button').className.match('active')) {
                this.toggleCredits();
            }
        }

    }

    function toggleCredits(e) {

        var credits = document.getElementById('credits'),
            creditsButton = document.getElementById('credits-button'),
            creditslabelPadding = 6,
            credits_height = credits.offsetHeight,
            footer_height = this.elements.el.offsetHeight;

        if (creditsButton.className.match('active') !== null || e === 'close') {

            creditsButton.className = creditsButton.className.replace('active', '');

            TweenLite.set('#mainContent', {pointerEvents: 'auto'});
            TweenLite.to('#mainContent', 0.5, {y: '0px', autoAlpha: 1, ease:Power4.easeInOut});
            TweenLite.to(credits, 0.5, {y: credits_height + 'px', ease:Power4.easeInOut, onUpdateParams: ['{self}'], onUpdate: function (tween) {
                TweenLite.set(creditsButton, {y: Math.min(0, (tween.target._gsTransform.y - credits_height) + (footer_height - creditsButton.offsetTop + creditslabelPadding)) + 'px'});
            }, onComplete: function () {
                creditsButton.style.zIndex = 1;
                credits.style.zIndex = 0;
                TweenLite.set(creditsButton, {z:'0px'});
                if (this.restartMain) {
                    oblio.app.main.play();
                }
            }.bind(this)});
        } else {
            oblio.app.main.pause();

            creditsButton.className = creditsButton.className + ' active';
            creditsButton.style.zIndex = 10;
            credits.style.zIndex = 9;
            TweenLite.set(creditsButton, {z:'1px'});

            TweenLite.set('#mainContent', {pointerEvents: 'none'});
            TweenLite.to('#mainContent', 0.5, {y: -(credits_height - footer_height) + 'px', autoAlpha: 0.25, ease:Power4.easeInOut});
            TweenLite.to(credits, 0.5, {y: '0px', ease:Power4.easeInOut, onUpdateParams: ['{self}'], onUpdate: function (tween) {
                TweenLite.set(creditsButton, {y: Math.min(0, (tween.target._gsTransform.y - credits_height) + (footer_height - creditsButton.offsetTop + creditslabelPadding)) + 'px'});
            }});

            if (document.getElementById('sharelabel').className.match('active')) {
                this.toggleShare();
            }
        }

    }

    function resize (w, h) {
        console.log('resize footer');
    }

    function closeMenus () {
        this.toggleShare('close');
        this.toggleCredits('close');
    }

    function hide () {
        TweenLite.to(this.elements.el, 0.25, {y: this.elements.el.offsetHeight + 'px', ease:Power2.easeInOut, onComplete: function () {
            // that.elements.el.style.display = 'none';
        }});
    }

    function show () {
        // this.elements.el.style.display = 'block';
        TweenLite.to(this.elements.el, 0.25, {y: '0px', ease:Power2.easeInOut});

        if (oblio.settings.mpaaShown === false) {
            setTimeout(oblio.app.Footer.showMPAARequirements.bind(oblio.app.Footer), 1000);
        }
    }

    Footer.prototype.initShare = initShare;
    Footer.prototype.toggleShare = toggleShare;
    Footer.prototype.toggleCredits = toggleCredits;

    Footer.prototype.closeMenus = closeMenus;
    Footer.prototype.init = init;

    Footer.prototype.hide = hide;
    Footer.prototype.show = show;

    Footer.prototype.resize = resize;
    Footer.prototype.showMPAARequirements = showMPAARequirements;
    Footer.prototype.hideMPAARequirements = hideMPAARequirements;

    window.oblio = window.oblio || {};
    oblio.classes = oblio.classes || {};
    oblio.classes.Footer = Footer;

    return Footer;
});
