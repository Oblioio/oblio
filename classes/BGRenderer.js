import { Backplate } from 'OblioUtils/classes/Backplate';
import 'OblioUtils/utils/DeviceDetect';

'use strict';

var bgRenderer = function () {
    this.initialized = false;
};

function setContainerID (containerID) {
    this.containerID = containerID;
}

function init (callback) {
    /*jshint validthis:true*/
    if(this.verbose)console.log('bgRenderer | init');

    this.container = this.container || document.getElementById(this.containerID) || document.getElementById('backgroundContainer');

    if (!this.container) {
        throw 'Container needs to be specified for BGRenderer';
    }

    this.image1 = Backplate.getNew();
    this.image2 = Backplate.getNew();

    this.nextContainer = 0;
    this.verbose = false;
    this.width = 0;
    this.height = 0;
    this.initialized = true;

    // style two bg containers
    this.addStyles(this.image1.elements.outer);
    this.addStyles(this.image1.elements.inner);
    this.container.appendChild(this.image1.elements.outer);

    this.addStyles(this.image2.elements.outer);
    this.addStyles(this.image2.elements.inner);
    this.container.appendChild(this.image2.elements.outer);

    this.image1.elements.outer.style.overflow = this.image2.elements.outer.style.overflow = 'hidden';

    if (callback) callback();
}

function addStyles(elem){
    elem.style.position = 'absolute';
    elem.style.top = elem.style.left = '0px';
    elem.style.width = elem.style.height = '100%';
    return elem;
}

function changeBg(imageObj, instant, callbackFn){
    console.log('changebg', 'BGRESIZE');
    /*jshint validthis:true*/
    if(!this.initialized)this.init();

    // add new image
    var newImage, oldImage;
    if (this.nextContainer === 0) {
        newImage = this.image1;
        oldImage = this.image2;
        this.image1.changeImage(imageObj);
        this.currentBG = this.image1;
    } else {
        newImage = this.image2;
        oldImage = this.image1;
        this.image2.changeImage(imageObj);
        this.currentBG = this.image2;
    }
    this.resize();
    this.transition(newImage, oldImage, instant, callbackFn);
}

function transition(newImage, oldImage, instant, callbackFn){
    /*jshint validthis:true*/
    var that = this;
    var tl = new TimelineLite({onComplete:function(){
        that.changeComplete(callbackFn);
    }.bind(this)});
    tl.pause();

    var t = (instant) ? 0 : (8 / 3);

    // set initial position and scale out new container
    tl.to(newImage.elements.outer, 0, { x: this.width + 'px' });

    // animate positions
    tl.to(oldImage.elements.outer, t*3.5/8, { x: -this.width + 'px', ease: Expo.easeInOut}, 0);
    tl.to(newImage.elements.outer, t*3.5/8, { x: 0 + 'px', ease: Expo.easeInOut}, 0);

    tl.play();
}

function changeComplete(callbackFn){
    /*jshint validthis:true*/
    // remove old image
    if (this.nextContainer === 0) {
        this.image2.elements.inner.innerHTML = '';
        this.image2.obj = null;
    } else {
        this.image1.elements.inner.innerHTML = '';
        this.image1.obj = null;
    }

    // update nextContainer value
    this.nextContainer = (this.nextContainer+1)%2;

    if(callbackFn)callbackFn();
}

function clear(){
    /*jshint validthis:true*/
    this.image1.elements.inner.innerHTML = '';
    this.image1.obj.destroy();
    this.image1.obj = null;

    this.image2.inner.innerHTML = '';
    this.image2.obj.destroy();
    this.image2.obj = null;
}

function resize (w, h) {
    if (!this.container) return;

    if (w) this.width = w;
    if (h) this.height = h;

    if (this.image1) {
        this.image1.resize(this.width, this.height);
    }

    if (this.image2) {
        this.image2.resize(this.width, this.height);
    }
}

bgRenderer.prototype.init = init;
bgRenderer.prototype.addStyles = addStyles;
bgRenderer.prototype.changeBg = changeBg;
bgRenderer.prototype.changeComplete = changeComplete;
bgRenderer.prototype.transition = transition;
bgRenderer.prototype.clear = clear;
bgRenderer.prototype.resize = resize;
bgRenderer.prototype.setContainerID = setContainerID;

export var BGRenderer = {
    getNew: function () {
        return new bgRenderer();
    }
}