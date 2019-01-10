import { SectionLoader } from 'OblioUtils/utils/SectionLoader';

var sectionLoader = SectionLoader.getInstance(),
    curr_loaderID = false, // current preloader
    loaderUIObjects = {}, // object to store preloaders by id
    perc = 0,
    tracker,
    complete_callback = false,
    instance;

var preloader = function() {
    if (!oblio.settings.instaLoad) {
        sectionLoader.addLoaderUI(this);
    }
    this.finished = true;
}

function switchLoader(loader_id) {
    if(loaderUIObjects[loader_id]){
        curr_loaderID = loader_id;
    } else {
        console.log("preloader.js : switchLoader : no loader found with ID: "+loader_id);
    }
}
        
function addLoader(loader_obj, callback) {

    loaderUIObjects[loader_obj.id] = loader_obj;

    // if there is not already a UI attached, it will automatically be set to the current UI
    if(!curr_loaderID)curr_loaderID = loader_obj.id;

    if (callback) {
        callback();
    }
}
        
function bringIn() {
    console.log('preloader bringIn', curr_loaderID);

    if(!curr_loaderID)return;

    this.finished = false;
    perc = 0;

    if (oblio.settings.prepreloader && oblio.settings.prepreloader.goOut) {
        oblio.settings.prepreloader.goOut();
    }
    
    //
    if(curr_loaderID && loaderUIObjects[curr_loaderID].bringIn !== undefined){
        //custom bringIn
        loaderUIObjects[curr_loaderID].bringIn(isIn.bind(this));
    } else {
        if(curr_loaderID && loaderUIObjects[curr_loaderID].elem !== undefined){
            //default bringIn
            loaderUIObjects[curr_loaderID].elem.style.display = 'block';
            TweenLite.to(loaderUIObjects[curr_loaderID].elem, 0.5, {autoAlpha: 1, onComplete: isIn.bind(this)});
            track.apply(this);
        } else {
            isIn.call(this);
        }
    }

}

function isIn(){
    console.log('preloader isIn', curr_loaderID);

    startTracking.apply(this);
}

var stop = false;
function raf () {
    track.call(this);
    if (!stop) window.requestAnimationFrame(tracker);
}
       
function startTracking(e) {
    tracker = raf.bind(this);
    stop = false;
    window.requestAnimationFrame(tracker);
}
        
function track(e) {
    var newPerc = sectionLoader.getPerc();

    if(isNaN(newPerc) || !isFinite(newPerc))newPerc = 1;

    newPerc = perc+(Math.ceil(10*(newPerc-perc)/.2)/1000);

    perc = Math.max(perc, newPerc);

    if(curr_loaderID && loaderUIObjects[curr_loaderID].onProgress !== undefined){
        //custom onProgress
        var animComplete = loaderUIObjects[curr_loaderID].onProgress(perc);

        if(perc >= 1 && this.finished && animComplete === true){
            stop = true;
            goOut();
        }
    } else {

        if(curr_loaderID && loaderUIObjects[curr_loaderID].updateBar !== undefined){
            //custom progressBar update
            loaderUIObjects[curr_loaderID].updateBar(perc);
        } else if (curr_loaderID && loaderUIObjects[curr_loaderID].progressBar !== undefined){
            //default progressBar update
            loaderUIObjects[curr_loaderID].progressBar.style.width = (perc*100)+'%';
        }

        if(curr_loaderID && loaderUIObjects[curr_loaderID].updateLabel !== undefined){
            //custom label fill
            loaderUIObjects[curr_loaderID].updateText(perc);
        } else if (curr_loaderID && loaderUIObjects[curr_loaderID].loaderText !== undefined){
            //default label fill                
            var labelString = "";
            if(curr_loaderID && loaderUIObjects[curr_loaderID].loaderText_before !== undefined)
                labelString += loaderUIObjects[curr_loaderID].loaderText_before;

            labelString += Math.round(perc*100);

            if(curr_loaderID && loaderUIObjects[curr_loaderID].loaderText_after !== undefined)
                labelString += loaderUIObjects[curr_loaderID].loaderText_after;

            loaderUIObjects[curr_loaderID].loaderText.innerHTML = labelString;
        }

        if(perc >= 1 && this.finished){
            stop = true;
            goOut();
        }
    }
}
        
function goOut() {
    console.log('preloader goOut');
    if(curr_loaderID && loaderUIObjects[curr_loaderID].goOut !== undefined){
        //custom goOut
        loaderUIObjects[curr_loaderID].goOut(isOut.bind(this));
    } else {
        if(curr_loaderID && loaderUIObjects[curr_loaderID].elem !== undefined){
            //default goOut
            TweenLite.to(loaderUIObjects[curr_loaderID].elem, 0.5, {autoAlpha: 0, onComplete: isOut.bind(this)});
        } else {
            isOut();
        }
    }
}
        
function isOut(callback){
    console.log('Preloader isOut');
    // if (loaderUIObjects[curr_loaderID].elem) loaderUIObjects[curr_loaderID].elem.style.display = 'none';
    if (complete_callback) {
        complete_callback();
    }
}
        
function complete(callback) {
    console.log('preloader complete');
    // TweenLite.ticker.removeEventListener("tick", this.track);

    complete_callback = callback || false;

    if(!curr_loaderID)isOut();

    this.finished = true;
}

preloader.prototype.switchLoader = switchLoader;
preloader.prototype.addLoader = addLoader;

preloader.prototype.bringIn = bringIn;
preloader.prototype.complete = complete;

export var Preloader = {
    getInstance: function () {
        instance = instance || new preloader();
        return instance;
    }
}