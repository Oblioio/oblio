import { BG_Image } from 'OblioUtils/classes/BG_Image';
import { BG_Video } from 'OblioUtils/classes/BG_Video';
import { BGRenderer } from 'OblioUtils/classes/BGRenderer';
import { SectionLoader } from 'OblioUtils/utils/SectionLoader';

'use strict';

var instance,
    bgRenderer = BGRenderer.getInstance(),
    sectionLoader = SectionLoader.getInstance();

var bgManager = function () {
    console.log("bgManager");
    this.initialized = false;
    this.verbose = false;
};

function init (renderer, data) {
    /*jshint validthis:true*/
    if(this.verbose)console.log("bgManager | init");

    this.renderer = renderer;

    this.sections = data.sections;
    this.images = data.images;

    this.initialized = true;
    this.currBgObj = null;

    var sectionsLength = this.sections.length;

    // randomize the imgIDs array of each section
    while (sectionsLength--) {
        var sectionObj = this.sections[sectionsLength];
        if (sectionObj.imgIDs && sectionObj.randomize !== false) {
            sectionObj.imgIDs = randomizeArray(sectionObj.imgIDs);
        }
    }

    // create sectionLoader entries for each image
    for (var imageName in this.images){
        this.images[imageName].img = null;
        if (this.images[imageName].type === 'image') {
            this.images[imageName].url = oblio.settings.assetsUrl + this.images[imageName].url;
            sectionLoader.addSection('background_' + imageName, {
                files: [this.images[imageName].url]
            });
        }
    }
}

function returnSectionObj (id) {
    /*jshint validthis:true*/
    if(this.verbose)console.log("bgManager | returnSectionObj: "+id);
    var sectionObj = null,
        numSections = this.sections.length;

    while (numSections--) {
        if (this.sections[numSections].id === id) {
            sectionObj = this.sections[numSections];
            break;
        }
    }

    return sectionObj;
}

function deprioritize (imgID) {
    /*jshint validthis:true*/
    if(this.verbose)console.log("bgManager | deprioritize: "+imgID);
    var sectionsLength = this.sections.length,
        numIDs;

    // if image exists in any sections... move it to the end of their queue
    while (sectionsLength--) {
        numIDs = (this.sections[sectionsLength].imgIDs) ? this.sections[sectionsLength].imgIDs.length : 0;
        while (numIDs--) {
            if (this.sections[sectionsLength].imgIDs[numIDs] === imgID) {
                this.sections[sectionsLength].imgIDs.push(this.sections[sectionsLength].imgIDs.splice(numIDs,1)[0]);
            }
        }
    }
}

function getBg (sectionId, sectionLoaderId, keepPriority) {
    /*jshint validthis:true*/

    if(this.verbose)console.log("bgManager | getBg: "+sectionId);
    if(!this.initialized)this.init();

    var sectionObj = this.returnSectionObj(sectionId),
        imgID;

    // check that section exists and has images
    if (!sectionObj || !sectionObj.imgIDs || sectionObj.imgIDs.length <= 0) {
        return false;
    }

    imgID = sectionObj.imgIDs[0];

    if(!keepPriority)this.deprioritize(imgID);

    //return id of sectionLoader obj to load
    return (sectionLoaderId) ? 'background_'+imgID : imgID;
}

function changeBg(sectionId, instant, callbackFn){
    /*jshint validthis:true*/
    var bgId = this.getBg(sectionId, false, false),
        imgObj = this.images[bgId],
        loadCatch = false,
        that = this;

    if (bgId === false) {
        imgObj = {
            img: false
        };
    }

    if (imgObj === this.currBgObj) {
        if(callbackFn)callbackFn();
        return;
    }

    this.currBgObj = imgObj;

    if (imgObj.img === false || (imgObj.img && imgObj.loaded)) {
        this.renderer.changeBg(imgObj, instant, callbackFn);
    } else {
        if (imgObj.type === 'image') {

            imgObj = BG_Image.getNew(imgObj, function () {
                if(loadCatch)return;
                loadCatch = true;
                imgObj.loaded = true;
                if(that.verbose)console.log("bgManager | image loaded: "+imgObj.url);
                that.renderer.changeBg(imgObj, instant, callbackFn);
            });

        } else {

            if (!document.createElement('video').canPlayType) {
                imgObj.url = imgObj.fallback;
                imgObj = BG_Image.getNew(imgObj, function () {
                    if(loadCatch)return;
                    loadCatch = true;
                    imgObj.loaded = true;
                    if(that.verbose)console.log("bgManager | image loaded: "+imgObj.url);
                    that.renderer.changeBg(imgObj, instant, callbackFn);
                });
            } else {
                imgObj = BG_Video.getNew(imgObj, function () {
                    if(loadCatch)return;
                    loadCatch = true;
                    this.loaded = true;
                    if(that.verbose)console.log("bgManager | image loaded: ", this);
                    that.renderer.changeBg(this, instant, callbackFn);
                    // oblio.app.Shell.resize();
                }, this.renderer.resize);
            }
        }
    }
}

function preloadNextBg(sectionId, callbackFn){
    /*jshint validthis:true*/
    var bgId = this.getBg(sectionId, false, true);
    if(!bgId)return;
    var imgObj = this.images[bgId];

    if(!imgObj.img) {
        imgObj.img = new Image();
        imgObj.img.alt = 'Background';

        imgObj.img.addEventListener('load', function () {
            imgObj.loaded = true;
            if(callbackFn)callbackFn();
        });

        imgObj.img.src = imgObj.url;
    }
}

function clear(){
    /*jshint validthis:true*/
    this.renderer.clear();
}

function randomizeArray(arr){
    var newArr = [],
        arrLength = arr.length;

    while(arrLength--){
        var aIndex = Math.floor(Math.random()*arr.length);
        var aItem = arr.splice(aIndex,1)[0];

        newArr.unshift(aItem);
    }

    return newArr;
}

// override base class functions
bgManager.prototype.init = init;
bgManager.prototype.returnSectionObj = returnSectionObj;
bgManager.prototype.deprioritize = deprioritize;
bgManager.prototype.getBg = getBg;
bgManager.prototype.preloadNextBg = preloadNextBg;
bgManager.prototype.clear = clear;
bgManager.prototype.changeBg = changeBg;

// export var BGManager = {
//     getNew: function () {
//         return new bgManager();
//     }
// }
export var BGManager = {
    getInstance: function () {
        instance = instance || new bgManager();
        return instance;
    }
}