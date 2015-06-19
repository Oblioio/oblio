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
            'greensock/TweenLite.min',
            'greensock/easing/EasePack.min',
            'greensock/plugins/CSSPlugin.min'
            ], function ($) {
                return (root.classes.BGRenderer = factory($));
            });
        } else {
            root.classes.BGRenderer = factory($);
        }
    }(window.oblio = window.oblio || {}, function ($) {

        'use strict';

        var BGRenderer = function (containerId) {
            this.container = containerId;
            this.initialized = false;
            this.image1 = {
                image: null,
                outer: null,
                inner: null,
                obj: null
            };
            this.image2 = {
                image: null,
                outer: null,
                inner: null,
                obj: null
            };
            this.nextContainer = 0;
            this.verbose = false;
            this.width = 0;
            this.height = 0;
        }

        function init(){
            if(this.verbose)console.log('BGRenderer | init');
            this.initialized = true;
            this.container = document.getElementById(this.container);

            // create two bg containers
            this.image1.outer = this.addStyles(document.createElement('div'));
            this.image1.inner = this.addStyles(document.createElement('div'));
            this.image1.outer.appendChild(this.image1.inner);
            this.container.appendChild(this.image1.outer);

            this.image2.outer = this.addStyles(document.createElement('div'));
            this.image2.inner = this.addStyles(document.createElement('div'));
            this.image2.outer.appendChild(this.image2.inner);
            this.container.appendChild(this.image2.outer);

            this.image1.outer.style.overflow = this.image2.outer.style.overflow = "hidden";

            // call resize via shell
            oblio.app.Shell.resize();
        }

        function addStyles(elem){
            elem.style.position = 'absolute';
            elem.style.top = elem.style.left = '0px';
            elem.style.width = elem.style.height = '100%';
            return elem;
        }

        function changeBg(imageObj, instant, callbackFn){
            if(!this.initialized)this.init();

            // add new image
            var newImage, oldImage;
            if(this.nextContainer == 0){
                newImage = this.image1;
                oldImage = this.image2;
                this.image1.obj = imageObj;
                if (imageObj.place) {
                    this.image1.image = this.image1.obj.place(this.image1.inner);
                    this.currentBG = this.image1;
                }
            } else {
                newImage = this.image2;
                oldImage = this.image1;
                this.image2.obj = imageObj;
                if (imageObj.place) {
                    this.image2.image = this.image2.obj.place(this.image2.inner);
                    this.currentBG = this.image2;
                }
            }
            this.resize();
            this.transition(newImage, oldImage, instant, callbackFn);
        }

        function transition(newImage, oldImage, instant, callbackFn){

            var that = this;
            var tl = new TimelineLite({onComplete:function(){
                that.changeComplete(callbackFn);
            }.bind(this)});
            tl.pause();

            var t = (instant) ? 0 : (8 / 3);

            // set initial position and scale out new container
            tl.to(newImage.outer, 0, { x: this.width + 'px' });

            // animate positions
            tl.to(oldImage.outer, t*3.5/8, { x: -this.width + 'px', ease: Expo.easeInOut}, 0);
            tl.to(newImage.outer, t*3.5/8, { x: 0 + 'px', ease: Expo.easeInOut}, 0);

            tl.play();
        }

        function changeComplete(callbackFn){
            // remove old image
            if(this.nextContainer == 0){
                this.image2.inner.innerHTML = "";
                this.image2.image = null;
                this.image2.obj = null;
            } else {
                this.image1.inner.innerHTML = "";
                this.image1.image = null;
                this.image1.obj = null;
            }

            // update nextContainer value
            this.nextContainer = (this.nextContainer+1)%2;

            if(callbackFn)callbackFn();
        }

        function clear(){
            this.image1.inner.innerHTML = "";
            this.image1.image = null;
            this.image1.obj = null;
            this.image2.inner.innerHTML = "";
            this.image2.image = null;
            this.image2.obj = null;
        }

        function resize(w, h){

            if(!this.image1.inner)return;
            if(!w)w = this.container.offsetWidth;
            if(!h)h = this.container.offsetHeight;
            this.width = w;
            this.height = h;

            var img1width,
                img1height,
                img2width,
                img2height;

            if (this.image1.obj) {
                if (this.image1.obj.dimensions) {
                    img1width = this.image1.obj.dimensions.width;
                    img1height = this.image1.obj.dimensions.height;
                } else {
                    img1width = this.image1.image ? this.image1.image.offsetWidth : 0;
                    img1height = this.image1.image ? this.image1.image.offsetHeight : 0;
                }
            }

            if (this.image2.obj) {
                if (this.image2.obj.dimensions) {
                    img2width = this.image2.obj.dimensions.width;
                    img2height = this.image2.obj.dimensions.height;
                } else {
                    img2width = this.image2.image ? this.image2.image.offsetWidth : 0;
                    img2height = this.image2.image ? this.image2.image.offsetHeight : 0;
                }
            }

            var img1Dimensions = {
                w: img1width,
                h: img1height
            },
            bg1Ratio = Math.max(w/img1Dimensions.w, h/img1Dimensions.h),
            bg1AdjustedWidth = (img1Dimensions.w*bg1Ratio),
            bg1AdjustedHeight = (img1Dimensions.h*bg1Ratio),

            img2Dimensions = {
                w: img2width,
                h: img2height
            },
            bg2Ratio = Math.max(w/img2Dimensions.w, h/img2Dimensions.h),
            bg2AdjustedWidth = (img2Dimensions.w*bg2Ratio),
            bg2AdjustedHeight = (img2Dimensions.h*bg2Ratio),

            paddingW = 0,
            paddingH = 0,

            bgOffsetLeftMin = -paddingW/2,
            bg1OffsetLeftMax = ((w-bg1AdjustedWidth)+(paddingW/2))-bgOffsetLeftMin,
            bg2OffsetLeftMax = ((w-bg2AdjustedWidth)+(paddingW/2))-bgOffsetLeftMin,

            bgOffsetTopMin = -paddingH/2,
            bg1OffsetTopMax = ((h-bg1AdjustedHeight)+(paddingH/2))-bgOffsetTopMin,
            bg2OffsetTopMax = ((h-bg2AdjustedHeight)+(paddingH/2))-bgOffsetTopMin;

            if(this.image1.image){
                this.image1.image.style.top = (bgOffsetTopMin+(bg1OffsetTopMax*this.image1.obj.v)).toFixed() + 'px';
                this.image1.image.style.left = (bgOffsetLeftMin+(bg1OffsetLeftMax*this.image1.obj.h)).toFixed() + 'px';
                this.image1.image.style.width = bg1AdjustedWidth+'px';
                this.image1.image.style.height = bg1AdjustedHeight+'px';
            }
            if(this.image2.image){
                this.image2.image.style.top = (bgOffsetTopMin+(bg2OffsetTopMax*this.image2.obj.v)).toFixed() + 'px';
                this.image2.image.style.left = (bgOffsetLeftMin+(bg2OffsetLeftMax*this.image2.obj.h)).toFixed() + 'px';
                this.image2.image.style.width = bg2AdjustedWidth+'px';
                this.image2.image.style.height = bg2AdjustedHeight+'px';
            }
        }

        BGRenderer.prototype.init = init;
        BGRenderer.prototype.addStyles = addStyles;
        BGRenderer.prototype.changeBg = changeBg;
        BGRenderer.prototype.changeComplete = changeComplete;
        BGRenderer.prototype.transition = transition;
        BGRenderer.prototype.clear = clear;
        BGRenderer.prototype.resize = resize;

        return BGRenderer;
    }));
