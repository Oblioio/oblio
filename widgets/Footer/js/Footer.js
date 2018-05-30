import { ArrayExecuter } from 'OblioUtils/utils/ArrayExecuter';

/* Footer.widgets */

'use strict';

var data,
    instance,
    arrayExecuter = ArrayExecuter(null, 'Footer'),
    clickFn = null,
    firstClick = true,
    creditsDrawer,
    shareShelf,
    mpaaPopup;

var footer = function () {
};

function onClick (e) {
    var target;

    if (e.touches) {
        target = e.touches[0].target;
        if (firstClick) {
            this.elements.el.removeEventListener('click', clickFn, true);
            firstClick = false;
        }
    } else {
        target = e.target;
    }

    if (target.tagName === 'A' && target.getAttribute('target') !== '_blank') e.preventDefault();

    switch (target.id) {
        case 'credits-button':
            if (creditsDrawer) creditsDrawer.open();
            break;
        case 'sharelabel':
            if (shareShelf) shareShelf.open();
            break;
        case 'share-facebook':
            window.open('http://www.facebook.com/share.php?u=' + encodeURIComponent(target.getAttribute('href'), '_blank'));
            break;
        default:
    }
}

function init (callback) {

    this.elements = {
        el: document.getElementById('footer')
    };

    clickFn = onClick.bind(this);

    this.elements.el.addEventListener('touchstart', clickFn, false);
    this.elements.el.addEventListener('click', clickFn, true);

    var functionArr = [
        { fn: initWidgets, scope: this, vars: null }
    ];

    if (callback) {
        functionArr.push({ fn: callback, vars: null });
    }

    arrayExecuter.execute(functionArr);
}

function initWidgets (callback) {

    creditsDrawer = (typeof CreditsDrawer !== 'undefined') ? CreditsDrawer.getNew() : false;
    shareShelf = (typeof ShareShelf !== 'undefined') ? ShareShelf.getNew() : false;
    mpaaPopup = (typeof MpaaPopup !== 'undefined') ? MpaaPopup.getNew() : false;

    let functionArr = [];

    if (mpaaPopup) functionArr.push({ fn: mpaaPopup.init, scope: mpaaPopup, vars: [document.getElementById('MPAA_requirements')] });
    if (creditsDrawer) functionArr.push({ fn: creditsDrawer.init, scope: creditsDrawer, vars: [document.getElementById('credits')] });
    if (shareShelf) functionArr.push({ fn: shareShelf.init, scope: shareShelf, vars: [document.getElementById('shareShelf')] });

    functionArr.push({ fn: callback, vars: null });

    arrayExecuter.execute(functionArr);
}

function showMPAARequirements(){
    if (mpaaPopup) mpaaPopup.open();
}

function hideMPAARequirements(){
    if (mpaaPopup) mpaaPopup.close();
}

function resize (w, h) {
    console.log('resize footer');
}

function hide () {
    TweenLite.to(this.elements.el, 0.25, {y: this.elements.el.offsetHeight + 'px', ease:Power2.easeInOut});
}

function show (callback) {
    TweenLite.set(this.elements.el, {y: 0});
    TweenLite.fromTo(this.elements.el, 1, {alpha: 0}, {alpha: 1, ease:Power2.easeInOut, onComplete: function () {
        if (callback) {
            callback();
        }
    }});

    if (mpaaPopup) {
        mpaaPopup.open();
    }
}

function getHeight () {
    return this.elements.el.offsetHeight;
}

footer.prototype.init = init;
footer.prototype.getHeight = getHeight;
footer.prototype.hide = hide;
footer.prototype.show = show;
footer.prototype.resize = resize;

export var Footer = {
    getInstance: function () {
        instance = instance || new footer();
        return instance;
    }
}
