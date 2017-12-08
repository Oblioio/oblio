import { ArrayExecuter } from 'OblioUtils/utils/ArrayExecuter.js';
import Mustache from 'mustache';
import 'OblioUtils/utils/DeviceDetect';

var instance,
    verbose = false,
    arrayExecuter = ArrayExecuter(null, 'SectionLoader'),
    DeviceDetect = oblio.utils.DeviceDetect;

/*
--------------------------------------------------------------------------------------------------------------------
Load / Parse JSON
--------------------------------------------------------------------------------------------------------------------
*/

function loadJSON(url, completeFn){

    _loadFile.call(this, url, 'json', function (data) {
        //this strips out line returns so that multiline strings in the JSON will parse correctly
        if (typeof data === 'object') {
            data = JSON.stringify(data);
        }

        data = data.replace(/(\r\n|\n|\r)/gm,"");
        data = data.replace(/\t/g, '');
        oblio.app.dataSrc = this.localizationJSON = JSON.parse(String(data));

        this.setupWidgets.call(this);

        if (completeFn) completeFn('Load JSON complete');
    }.bind(this));
}

function setupWidgets() {

    var section_name,
        section_obj;

    for (var widget_name in oblio.app.dataSrc.widgets) {
        section_obj = oblio.app.dataSrc.widgets[widget_name];

        if (section_obj.visible === 'false') {
            continue;
        }

        section_obj.data = section_obj.data || {};
        section_obj.data.base = oblio.settings.assetsUrl || '';

        this.addSection(widget_name, section_obj);
    }
}

/*
--------------------------------------------------------------------------------------------------------------------
Section Loader
--------------------------------------------------------------------------------------------------------------------
*/

var sectionLoaderState = {
        sections: [],
        currentlyLoadingIDs: [],
        templatesToLoad: [],
        imagesToLoad: [],
        imagesLoaded: 0,
        miscToLoad: [],
        miscLoaded: 0,
        loader: null,
        files: {}
    },
    isMobile = DeviceDetect.isMobile;

function addLoaderUI (loaderObj) {
    if (this.verbose) console.log('SectionLoader | addLoaderUI: '+loaderObj);
    sectionLoaderState.loader = loaderObj;
}

function addFiles (section_id, files) {
    var sectionOBJ = returnSectionOBJ(section_id);
    sectionOBJ.files = sectionOBJ.files || {};
    // sectionOBJ.addFiles = typeof files === 'String' ? sectionOBJ.addFiles.push(files) : files;
    if (typeof files === 'string') {
        sectionOBJ.addFiles.push(files);
    } else {
        for (var i = files.length - 1; i >= 0; i--) {
            sectionOBJ.addFiles.push(files[i]);
        }
    }
}

/*
**  TODO: get rid of widgets here, 
**  make the only thing stored in 
**  the section objects the images, 
**  addfiles, templatePath, and a list 
**  of paths to required partials --- the templatePaths 
**  of the sections widgets and widgets widgets
*/
function addSection (id, data) {
    if (sectionExists(id)) throw 'SectionLoader | addSection: section id '+id+' already exists';

    if (instance.verbose) console.log('SectionLoader | addSection: '+id);

    var files = data.files || {},
        templatePath = files.templatePath || false,
        widgets = data.widgets || [], 
        images = files.images || false,
        addFiles = files.addFiles || [];
console.log(id, images);
    sectionLoaderState.sections.push({
        id: id,
        images: images,
        data: data.data,
        templatePath: templatePath,
        widgets: widgets,
        addFiles: addFiles,
        loaded: false
    });
}

function sectionExists (id) {
    return sectionLoaderState.sections.filter(section => section.id === id).length > 0;
}

function loadSection (...args) {

    if (this.verbose) {
        console.log('////////////////////////////////////////////');
        console.log('////////////////////////////////////////////');
        console.log('////////////////////////////////////////////');
        console.log('SectionLoader | this.loadSection:', args);
    }

    // the last 2 args are reject and resolve functions
    var function_arr,
        reject = args.pop(),
        callback = args.pop();

    if (args === undefined || args === null) throw 'SectionLoader | this.loadSection: input not valid';

    if (args.length === 1 && args[0] === 'all') {
        args = sectionLoaderState.sections.map(function (section) {
            return section.id;
        });
    }

    function_arr = args.map(function (sectionName) {
        if (sectionExists(sectionName)) {
            return {scope: this, fn: this.initScrape, vars: [sectionName]};
        }
    }.bind(this));

    function_arr.push({scope: this, fn: this.loadFiles, vars: null});

    if (callback) {
        function_arr.push({fn: callback, vars: null});
    }

    arrayExecuter.execute(function_arr);
}

function initScrape (...args) {

    var id = args.shift(),
        numImages,
        sectionOBJ = this.returnSectionOBJ(id),
        widgets,
        fileURL;

    var reject = args.pop();
    var resolve = args.pop();

    //confirm sectionOBJ was found
    if (sectionOBJ === undefined) reject('SectionLoader | this.loadSection: section id ' + id + ' not found');

    //check is section is already loaded
    if (sectionOBJ.loaded === true) {
        if(this.verbose)console.log('SectionLoader | this.loadSection: ' + id + ' is already loaded');
        reject(true);
        return;
    }

    sectionLoaderState.currentlyLoadingIDs.push(sectionOBJ.id);

    widgets = getWidgets(sectionOBJ);

    var function_arr =  [];
    var numWidgets = widgets.length - 1;
    var widget = sectionOBJ;

    do {
        // add any templates
        addTemplates.call(this, widget);

        //add any addFiles that may have been passed in prepareLoad()
        addNewFiles.call(this, widget);

        //add any images from the json
        addImages.call(this, widget);

        if (widget.templatePath) {
            console.log(widget.templatePath);
            function_arr.push({scope: this, fn: this.loadTemplate,  vars: [widget, widget.templatePath]});
        }

        for (var i = sectionLoaderState.templatesToLoad.length - 1; i >= 0; i--) {
            console.log(sectionLoaderState.templatesToLoad[i]);
            function_arr.push({scope: this, fn: this.loadTemplate,  vars: [widget, sectionLoaderState.templatesToLoad[i]]});
        }

        widget = widgets[numWidgets];
        numWidgets--;
    }
    while (widget !== undefined);

    function_arr.push({fn: resolve,   vars: null});

    arrayExecuter.execute(function_arr);

}

function addTemplates (sectionOBJ) {
    console.log(sectionOBJ);
    for ( var partial in sectionOBJ.partials ) {
        if (sectionOBJ.partials.hasOwnProperty(partial)) {
            sectionLoaderState.templatesToLoad.push({template_name: partial, template_path: sectionOBJ.partials[partial]});
        }
    }
}

function addNewFiles (sectionOBJ) {
    let numAddFiles = sectionOBJ.addFiles.length;

    while (numAddFiles--){
        let fileURL = sectionOBJ.addFiles[numAddFiles];

        if(fileURL.indexOf('.gif') > 0 || fileURL.indexOf('.jpg') > 0 || fileURL.indexOf('.jpeg') > 0 || fileURL.indexOf('.png') > 0){
            addImage.call(this, fileURL);               
        } else {
            addMisc.call(this, fileURL);
        }
    }
}

function addImages (sectionOBJ) {
    let numImages = sectionOBJ.images.length;

    while (numImages--){
        let fileURL = sectionOBJ.images[numImages];

        if(fileURL.indexOf('.gif') > 0 || fileURL.indexOf('.jpg') > 0 || fileURL.indexOf('.jpeg') > 0 || fileURL.indexOf('.png') > 0){
            addImage.call(this, fileURL);
        } else {
            if(this.verbose)console.log('SectionLoader | not a supported fileType: '+fileURL);
        }
    }
}

// recursively get all of the object's child widgets
function getWidgets (sectionObj) {
    var widgetNames = sectionObj.widgets,
        widgets = [];

    if (!widgetNames || widgetNames.length === 0) return [];

    var widget;
    for (var i = widgetNames.length - 1; i >= 0; i--) {
        widget = sectionLoader.returnSectionOBJ(widgetNames[i]);
        if (widget) {
            widgets.push(widget);
            widgets = widgets.concat(getWidgets(widget));
        }
    }

    return widgets;
}

function getAjax (url, success) {
    console.log(url);
    var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    xhr.open('GET', url);
    xhr.onreadystatechange = function() {
        if (xhr.readyState>3 && xhr.status==200) success(xhr);
    };
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.send();
    return xhr;
};

function isDuplicate (fileURL){
    var numImages = sectionLoaderState.imagesToLoad.length;
    while (numImages--) {
        if (sectionLoaderState.imagesToLoad[numImages].url === fileURL) {
            return true;
        }
    }

    var numMisc = sectionLoaderState.miscToLoad.length;
    while (numMisc--) {
        if(sectionLoaderState.miscToLoad[numMisc].url === fileURL) {
            return true;
        }
    }

    return false;
}

function loadTemplate(sectionOBJ, template, resolve, reject) {
    var template_path = typeof template === 'string' ? template : template.template_path;

console.log(sectionOBJ, sectionLoaderState);

    if(this.verbose)console.log('SectionLoader | loadTemplate: ', sectionOBJ.id, template_path);

    _loadFile.call(this, template_path, 'html', function (data) {
        if (typeof template === 'string') {
            sectionOBJ.template = data.data || data;
            sectionOBJ.data.assetsUrl = oblio.settings.assetsUrl;
            sectionOBJ.htmlData = Mustache.render(sectionOBJ.template, sectionOBJ.data);

            // preload images from html
            var img_pattern = /<img [^>]*src="([^"]+)"[^>]*>/g;
            var results;

            while ((results = img_pattern.exec(sectionOBJ.htmlData)) !== null)
            {
                addImage.call(this, results[1]);
            }
        } else {
            sectionOBJ.partials[template.template_name] = data;
        }

        resolve();
    }.bind(this));
}

function _loadFile (url, type, callback) {
    if (sectionLoaderState.files[url]) {
        callback(sectionLoaderState.files[url]);
        return;
    } else if (oblio.settings.useJSONP) {

        var script,
            callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
        
        window[callbackName] = function(data) {
            delete window[callbackName];
            document.body.removeChild(script);
            sectionLoaderState.files[url] = data;
            callback(data);
        };

        script = document.createElement('script');
        script.src = oblio.settings.assetsUrl + 'php/jsonp.php?filename=' + encodeURIComponent('../' + url) + '&type=' + type + '&callback=' + callbackName;
        document.body.appendChild(script);
        return;
    } else {
        getAjax(oblio.settings.assetsUrl + url, function (e) {
            switch (e.readyState) {
                case 0: // UNSENT
                    // console.log('UNSENT', e.status, e.responseText);
                    break;
                case 1: // OPENED
                    // console.log('OPENED', e.status, e.responseText);
                    break;
                case 2: // HEADERS_RECEIVED
                    // console.log('HEADERS_RECEIVED', e.status, e.responseText);
                    break;
                case 3: // LOADING
                    // console.log('LOADING', e.status, e.responseText);
                    break;
                case 4: // DONE
                    if (e.status === 200) {
                        sectionLoaderState.files[url] = e.responseText;
                        callback(e.responseText);
                    }
                    break;
                default:
            }
        }.bind(this));
        return;
    }
}

function loadFiles (resolve, reject){

    var numImages = sectionLoaderState.imagesToLoad.length,
        numMisc = sectionLoaderState.miscToLoad.length,
        fileURL,
        newImage,
        that = this;

    sectionLoader.filesLoadedCallback = resolve;

    if ((numImages + numMisc) < 1) {
        this.complete();
        if (oblio.settings.prepreloader && oblio.settings.prepreloader.goOut) {
            oblio.settings.prepreloader.goOut();
        }
        return;
    }

    if (sectionLoaderState.loader) {
        sectionLoaderState.loader.bringIn();
    }

    while (numImages--) {
        loadImage.call(this, sectionLoaderState.imagesToLoad[numImages]);
    }

    while(numMisc--){
        miscLoadFile.call(this, sectionLoaderState.miscToLoad[numMisc]);
    }
}

function addImage(fileURL){
    if (!isDuplicate(fileURL)) {
        var index = sectionLoaderState.imagesToLoad.length;
        sectionLoaderState.imagesToLoad.push({url: fileURL, index: index});
    }
}

function loadImage(fileObj){
    if(this.verbose)console.log('SectionLoader | load image: '+fileObj.url);
    var fileURL = fileObj.url;

    fileObj.done = false;
    fileObj.size = this.getFileSize(fileURL);

    var newImage = new Image();
    newImage.alt = String(fileObj.index);
    newImage.addEventListener('load', function () {
        if(this.verbose)console.log('SectionLoader | image Loaded: '+fileObj.url);

        fileObj.done = true;
        sectionLoaderState.imagesLoaded++;
        sectionLoader.checkComplete();
    }.bind(this));

    newImage.addEventListener('error', this.fileError);

    newImage.src = fileURL;
}

function addMisc (fileURL) {
    if (!this.isDuplicate(fileURL)) {
        sectionLoaderState.miscToLoad.push({url:fileURL});
    }
}

function miscLoadFile(fileObj){
    if(this.verbose)console.log('SectionLoader | xhr load: '+fileObj.url);

    var fileURL = fileObj.url;

    fileObj.perc = 0;
    fileObj.done = false;
    fileObj.size = this.getFileSize(fileURL);

    _loadFile.call(this, fileURL, 'misc', function (data) {
        this.miscFiles = this.miscFiles || {};
        this.miscFiles[fileObj.url] = data.data || data; // if jsonp, data is an object - otherwise, it's just a string containing the file content

        fileObj.done = true;
        sectionLoaderState.miscLoaded++;
        sectionLoader.checkComplete();
    }.bind(this));
}

function setFileSize (url, size) {
    this.filesizes.push({url:url, size:size});
}

function getFileSize (url) {
    for (var f = 0; f < this.filesizes.length; f++) {
        if (url == this.filesizes[f].url) {
            return this.filesizes[f].size;
        }
    }
    return this.defaultSize;
}

function getPerc () {
    var loaded = 0;
    var totalLoad = 0;
    for (var m=0; m<sectionLoaderState.miscToLoad.length; m++) {
        totalLoad += sectionLoaderState.miscToLoad[m].size;
        if(sectionLoaderState.miscToLoad[m].done){
            loaded += sectionLoaderState.miscToLoad[m].size;
        } else {
            loaded += sectionLoaderState.miscToLoad[m].size*sectionLoaderState.miscToLoad[m].perc;
        }
    }
    for (var i=0; i<sectionLoaderState.imagesToLoad.length; i++) {
        totalLoad += sectionLoaderState.imagesToLoad[i].size;
        if(sectionLoaderState.imagesToLoad[i].done){
            loaded += sectionLoaderState.imagesToLoad[i].size;
        }
    }
    
    // console.log(loaded+ ' / '+totalLoad);
    return loaded/totalLoad;
}

function fileError (e) {
    console.error('SectionLoader | fileError', e.path[0].src, 'not found');
}

function checkComplete(){
    // console.log('checkComplete '+sectionLoaderState.imagesLoaded+' vs. '+sectionLoaderState.imagesToLoad.length+' | '+sectionLoaderState.miscLoaded+' vs. '+sectionLoaderState.miscToLoad.length);
    if (sectionLoaderState.imagesLoaded >= sectionLoaderState.imagesToLoad.length && sectionLoaderState.miscLoaded >= sectionLoaderState.miscToLoad.length) {
        this.complete();
    }
}

function complete () {
    if(this.verbose){
        console.log('SectionLoader | complete: ');
        console.log('******************************************* ');
        console.log('******************************************* ');
        console.log('******************************************* ');
    }
    
    var numSectionsLoaded = sectionLoaderState.currentlyLoadingIDs.length;
    while (numSectionsLoaded--) {
        var sectionID = sectionLoaderState.currentlyLoadingIDs[numSectionsLoaded];
        var sectionOBJ = this.returnSectionOBJ(sectionID);
        sectionOBJ.loaded = true;
    }

    sectionLoaderState.currentlyLoadingIDs = [];
    sectionLoaderState.imagesToLoad = [];
    sectionLoaderState.imagesLoaded = 0;
    sectionLoaderState.miscToLoad = [];
    sectionLoaderState.miscLoaded = 0;

    if (sectionLoaderState.loader && !sectionLoaderState.loader.finished) {
        sectionLoaderState.loader.complete(sectionLoader.filesLoadedCallback);
        // sectionLoaderState.loader.complete(arrayExecuter.stepComplete_instant.bind(arrayExecuter));
    } else {
        sectionLoader.filesLoadedCallback()
    }
}

function returnSectionOBJ (id) {
    var sectionOBJ,
        numSections = sectionLoaderState.sections.length;

    while (numSections--) {
        if (sectionLoaderState.sections[numSections].id === id) {
            sectionOBJ = sectionLoaderState.sections[numSections];
        }
    }

    return sectionOBJ;
}

function getSectionLoaderState () {
    return sectionLoaderState;
}

var sectionLoader = {
    verbose: false,
    loadJSON: loadJSON,
    setupWidgets: setupWidgets,
    localizationJSON: {},
    addLoaderUI: addLoaderUI,
    addSection: addSection,
    sectionExists: sectionExists,
    addFiles: addFiles,
    loadSection: loadSection,
    initScrape: initScrape,
    // loadHTML: loadHTML,
    loadTemplate: loadTemplate,
    // htmlLoaded: htmlLoaded,
    // loadCSS: loadCSS,
    // cssLoaded: cssLoaded,
    // loadJS: loadJS,
    // jsLoaded: jsLoaded,
    isDuplicate: isDuplicate,
    loadFiles: loadFiles,
    filesizes: [],
    defaultSize: 100,
    setFileSize: setFileSize,
    getFileSize: getFileSize,
    getPerc: getPerc,
    fileError: fileError,
    checkComplete: checkComplete,
    complete: complete,
    returnSectionOBJ: returnSectionOBJ,
    getSectionLoaderState: getSectionLoaderState,
    loadImage: loadImage,
    miscLoadFile: miscLoadFile,
    arrayExecuter: arrayExecuter,
    getWidgets: getWidgets
};

export var SectionLoader = {
    getInstance: function () {
        instance = instance || Object.create(sectionLoader);
        return instance;
    }
}