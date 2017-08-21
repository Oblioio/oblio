import { ArrayExecuter } from '../../../app/js/oblio/utils/ArrayExecuter.js';
import Mustache from 'mustache';
import 'OblioUtils/utils/DeviceDetect';

var arrayExecuter = ArrayExecuter(null, 'SectionLoader'),
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

        this.setupSections.call(this);

        if (completeFn) completeFn('Load JSON complete');
    }.bind(this));
}

function setupSections() {

    var section_name,
        section_obj;

    for (section_name in oblio.app.dataSrc.sections)
    {

        if (oblio.app.dataSrc.sections.hasOwnProperty(section_name)) {

            section_obj = oblio.app.dataSrc.sections[section_name];

            if (section_obj.visible === 'false') {
                continue;
            }

            section_obj.data.base = oblio.settings.assetsUrl || '';

            this.addSection(section_name, section_obj);
        }
    }

}

/*
--------------------------------------------------------------------------------------------------------------------
Section Loader
--------------------------------------------------------------------------------------------------------------------
*/

var sectionLoaderState = {sections:[], currentlyLoadingIDs:[], templatesToLoad: [], imagesToLoad:[], imagesLoaded:0, miscToLoad:[], miscLoaded:0, loader:null},
    isMobile = DeviceDetect.isMobile;

function addLoaderUI (loaderObj) {
    if(this.verbose)console.log('SectionLoader | addLoaderUI: '+loaderObj);
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

function addSection (id, data) {
    if(this.verbose)console.log('SectionLoader | addSection: '+id);
    //Check to be sure a section has not already been added with the same name
    var numSections = sectionLoaderState.sections.length,
        files = data.files || {},
        templatePath = files.templatePath || false,
        partials = files.partials || {},
        images = files.images || false,
        htmlPath = files.htmlPath || false,
        cssPath = files.cssPath || false,
        jsPath = files.jsPath || false,
        addFiles = files.addFiles || [];

    if(sectionExists(id)){
        if(this.verbose)console.log('SectionLoader | addSection: section id '+id+' already exists');
        return;
    }

    sectionLoaderState.sections.push({id: id, images: images, data:data.data, templatePath: templatePath, partials:partials ,htmlPath: htmlPath, htmlData: null, cssPath: cssPath, cssData: null, jsPath: jsPath, jsAttached: true, jsData: null, addFiles:addFiles, loaded: false});
    if (id === 'work') {
        // console.log(sectionLoaderState.sections);
    }
}

function sectionExists(id){
    var numSections = sectionLoaderState.sections.length;
    // console.log('check exists: '+id);
    // console.log(sectionLoaderState.sections);
    while (numSections--) {
        if(sectionLoaderState.sections[numSections].id === id){
            // if(this.verbose)console.log('SectionLoader | sectionExists: section id '+id+' already exists');
            return true;
        }
    }
    return false;
}

function loadSection (...args) {
    var i;

    //Load section content by passing in the ID of the section, or an array of IDs
    if(this.verbose){
        console.log('////////////////////////////////////////////');
        console.log('////////////////////////////////////////////');
        console.log('////////////////////////////////////////////');
    }

    var function_arr =  [],
        reject = args.pop(),
        callback = args.pop();

    if (args.length === 1 && args[0] === 'all') {
        args = [];
        for (i = sectionLoaderState.sections.length - 1; i >= 0; i--) {
            args.push(sectionLoaderState.sections[i].id);
        }
    }

    if (args !== undefined && args !== null){
        for (i = args.length - 1; i >= 0; i--) {
            if (typeof args[i] === 'function') {
                // the only functions in args should be resolve and reject passed from array executer
                console.log('THIS SHOULD NOT BE A FUNCTION');
            } else {
                if(sectionExists(args[i])){
                    if(this.verbose)console.log('SectionLoader | loadSection: '+args[i]);
                    function_arr.push({scope: this, fn: this.initScrape, vars: [args[i]]});
                } else {
                    console.log("SECTION LOADER ERROR! section: "+args[i]+" does not exist");
                }
            }
        }
    } else {
        if(this.verbose)console.log('SectionLoader | this.loadSection: input not valid');
    }

    function_arr.push({scope: this, fn: this.loadFiles, vars: null});

    if (callback) {
        function_arr.push({fn: callback, vars: null});
    }

    arrayExecuter.execute(function_arr);
}

function initScrape (...args) {

    var id = args.shift(),
        numAddFiles,
        numImages,
        sectionOBJ = this.returnSectionOBJ(id),
        fileURL;

    var reject = args.pop();
    var resolve = args.pop();

    //confirm sectionOBJ was found
    if(sectionOBJ === undefined){
        if(this.verbose)console.log('SectionLoader | this.loadSection: section id '+id+' not found');
        reject(true);
        return;
    }

    //check is section is already loaded
    if(sectionOBJ.loaded === true){
        if(this.verbose)console.log('SectionLoader | this.loadSection: '+id+' is already loaded');
        reject(true);
        return;
    }

    sectionLoaderState.currentlyLoadingIDs.push(sectionOBJ.id);

    // add any templates
    for( var partial in sectionOBJ.partials ) {
        if (sectionOBJ.partials.hasOwnProperty(partial)) {
            sectionLoaderState.templatesToLoad.push({template_name: partial, template_path: sectionOBJ.partials[partial]});
        }
    }

    //add any addFiles that may have been passed
    numAddFiles = sectionOBJ.addFiles.length;

    while (numAddFiles--){
        fileURL = sectionOBJ.addFiles[numAddFiles];

        if(fileURL.indexOf('.gif') > 0 || fileURL.indexOf('.jpg') > 0 || fileURL.indexOf('.jpeg') > 0 || fileURL.indexOf('.png') > 0){
            addImage.call(this, fileURL);               
        } else {
            addMisc.call(this, fileURL);
        }
    }

    //add any iamges from the json
    numImages = sectionOBJ.images.length;

    while (numImages--){
        fileURL = sectionOBJ.images[numImages];

        if(fileURL.indexOf('.gif') > 0 || fileURL.indexOf('.jpg') > 0 || fileURL.indexOf('.jpeg') > 0 || fileURL.indexOf('.png') > 0){
            addImage.call(this, fileURL);
        } else {
            if(this.verbose)console.log('SectionLoader | not a supported fileType: '+fileURL);
        }
    }

    var function_arr =  [];

    if (sectionOBJ.htmlPath) {
        function_arr.push({scope: this, fn: this.loadHTML,  vars: [sectionOBJ]});
    }

    if (sectionOBJ.templatePath) {
        function_arr.push({scope: this, fn: this.loadTemplate,  vars: [sectionOBJ, sectionOBJ.templatePath]});
    }

    for (var i = sectionLoaderState.templatesToLoad.length - 1; i >= 0; i--) {
        function_arr.push({scope: this, fn: this.loadTemplate,  vars: [sectionOBJ, sectionLoaderState.templatesToLoad[i]]});
    }

    if(sectionOBJ.cssPath) {
        function_arr.push({scope: this, fn: this.loadCSS,   vars: [sectionOBJ]});
    }

    arrayExecuter.execute(function_arr);

}

function getAjax (url, success) {
    var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    xhr.open('GET', url);
    xhr.onreadystatechange = function() {
        if (xhr.readyState>3 && xhr.status==200) success(xhr);
    };
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.send();
    return xhr;
};

function loadHTML (sectionOBJ, resolve, reject) {

    if(this.verbose)console.log('SectionLoader | loadHTML: '+sectionOBJ.htmlPath);

    getAjax(sectionOBJ.htmlPath, function (e) {
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
                    var data = e.responseText;

                    this.htmlLoaded(sectionOBJ, data, resolve);
                }
                break;
            default:
        }
    }.bind(this));

}

function htmlLoaded (sectionOBJ, data, complete) {
    if(this.verbose)console.log('SectionLoader | htmlLoaded: ');

    sectionOBJ.htmlData = data;

    var sectionID = sectionOBJ.id;

    if(sectionLoader.localizationJSON && sectionLoader.localizationJSON.sections){
        var htmlObjs;
        var numHtmlObjs;
        var spanStyle;
        var spanStyleNum;
        var newStr;
        var currSpanStyle;
        var currObj;

        //handle the shared 'html' category 
        if (sectionLoader.localizationJSON.sections.shared && sectionLoader.localizationJSON.sections.shared.html) {
            htmlObjs = sectionLoader.localizationJSON.sections.shared.html;
            numHtmlObjs = htmlObjs.length;
            while (numHtmlObjs--) {
                currObj = htmlObjs[numHtmlObjs];
                sectionOBJ.htmlData = getHTMLString(sectionOBJ.htmlData, currObj);
            }
        }

        //handle the section specifc 'html' category
        if (sectionLoader.localizationJSON.sections[sectionID] && sectionLoader.localizationJSON.sections[sectionID].html) {
            htmlObjs = sectionLoader.localizationJSON.sections[sectionID].html;
            numHtmlObjs = htmlObjs.length;
            while(numHtmlObjs--){
                currObj = htmlObjs[numHtmlObjs];
                sectionOBJ.htmlData = getHTMLString(sectionOBJ.htmlData, currObj);
            }
        }

        // make temp element so we can set the style to the actual node using a styleholder span with a data-style attribute rather than creating an extra inner span
        var tmp = document.createElement('div');
        tmp.innerHTML = sectionOBJ.htmlData;
        var markers = tmp.getElementsByClassName('styleholder');

        for (var i = markers.length - 1; i >= 0; i--) {
            markers[i].parentNode.setAttribute('style', markers[i].getAttribute('data-style'));
            markers[i].parentNode.removeChild(markers[i]); // remove styleholder span
        }

        sectionOBJ.htmlData = tmp.innerHTML;
    }

    // preload images from html
    var img_pattern = /<img [^>]*src="([^"]+)"[^>]*>/g;
    var results;

    while ((results = img_pattern.exec(sectionOBJ.htmlData)) !== null)
    {
        addImage.call(this, results[1]);
    }

    complete();
}

function getHTMLString (html_data, html_obj) {
    var html_str = String(html_data),
        spanStyle,
        spanStyleNum,
        newStr,
        currSpanStyle;

    while (html_str.indexOf(String(html_obj.ID)) > 0){
        spanStyle = '';
        spanStyleNum = (html_obj.css)?html_obj.css.length:0;
        while(spanStyleNum--){
            currSpanStyle = html_obj.css[spanStyleNum];
            if (currSpanStyle.VAL) {
                spanStyle += currSpanStyle.ID + ':' + currSpanStyle.VAL + ';';
            }
        }
        // create a 'styleholder' span to hold style data from the json
        newStr = (spanStyle === '') ? String(html_obj.VAL) : '<span class="styleholder" data-style="' + spanStyle + '"></span>' + String(html_obj.VAL);
        if (html_obj.visible && String(html_obj.visible).toLowerCase() === 'false') newStr = '';
        html_str = html_str.replace(String(html_obj.ID), newStr);
    }

    return html_str;
}

function loadCSS (sectionOBJ, resolve, reject) {
    if(this.verbose)console.log('SectionLoader | loadCSS: '+sectionOBJ.cssPath);

    getAjax(url, function (e) {
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
                    var data = e.responseText;

                    this.cssLoaded(sectionOBJ, data, resolve);
                }
                break;
            default:
        }
    }.bind(this));

}

function cssLoaded (sectionOBJ, data, complete){
    if (this.verbose) console.log('SectionLoader | this.cssLoaded: ' + sectionOBJ.id);
    sectionOBJ.cssData = String(data);

    var sectionID = sectionOBJ.id;

    if (sectionLoader.localizationJSON && sectionLoader.localizationJSON.sections && sectionLoader.localizationJSON.sections[sectionID] && sectionLoader.localizationJSON.sections[sectionID].css) {
        var cssObjs = sectionLoader.localizationJSON.sections[sectionID].css;
        var numCssObjs = cssObjs.length;
        while(numCssObjs--){
            while(String(sectionOBJ.cssData).indexOf(String(cssObjs[numCssObjs].ID)) > 0){
                sectionOBJ.cssData = sectionOBJ.cssData.replace(String(cssObjs[numCssObjs].ID), String(cssObjs[numCssObjs].VAL));
            }
        }
    }

    var imgUrls = sectionOBJ.cssData.match(/[^\(]+\.(gif|jpg|jpeg|png)/g);

    if (imgUrls) {
        var numImages = imgUrls.length;
        while (numImages--) {
            var fileURL = imgUrls[numImages].replace('../', '');
            if(this.verbose)console.log('SectionLoader | cssLoaded: adding: '+fileURL);
            addImage.call(this, fileURL);
        }
    }

    complete();
}

function loadJS (sectionOBJ){
    var that = this;

    if (this.verbose) console.log('SectionLoader | loadJS: '+sectionOBJ.jsPath);

    if (sectionOBJ.jsPath) {
        that.jsLoaded(sectionOBJ, null);
    }

}

function jsLoaded (sectionOBJ, data){
    if (this.verbose) console.log('SectionLoader | loadJS: success');
    sectionOBJ.jsAttached = true;

    arrayExecuter.stepComplete();
}

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

    if(this.verbose)console.log('SectionLoader | loadHTML: '+sectionOBJ.htmlPath);

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
                console.log(results[1]);
                addImage.call(this, results[1]);
            }
        } else {
            sectionOBJ.partials[template.template_name] = data;
        }

        resolve();
    }.bind(this));
}

function _loadFile (url, type, callback) {
    if (oblio.settings.useJSONP) {

        var script,
            callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
        
        window[callbackName] = function(data) {
            delete window[callbackName];
            document.body.removeChild(script);
            callback(data);
        };

        script = document.createElement('script');
        script.src = oblio.settings.assetsUrl + 'php/jsonp.php?filename=' + encodeURIComponent('../' + url) + '&type=' + type + '&callback=' + callbackName;
        document.body.appendChild(script);

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
                        callback(e.responseText);
                    }
                    break;
                default:
            }
        }.bind(this));
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
    if (!this.isDuplicate(fileURL)) {
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
        this.miscFiles[fileObj.url] = data.data;

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

        //attachCSS
        if (sectionOBJ.cssPath) {
            if(this.verbose)console.log('SectionLoader | attachCSS: '+sectionOBJ.cssPath);

            if (sectionLoader.localizationJSON && sectionLoader.localizationJSON.sections && sectionLoader.localizationJSON.sections[sectionID] && sectionLoader.localizationJSON.sections[sectionID].css) {
                //write modified CSS directly into HTML header
                document.head.insertAdjacentHTML('beforeend', '<style type="text/css">' + sectionOBJ.cssData + '</style>');
            } else {
                //attached link to original CSS file
                var fileref = document.createElement('link');
                fileref.setAttribute('rel', 'stylesheet');
                fileref.setAttribute('type', 'text/css');
                fileref.setAttribute('href', sectionOBJ.cssPath);
                document.getElementsByTagName('head')[0].appendChild(fileref);
            }
        }
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
    setupSections: setupSections,
    localizationJSON: {},
    addLoaderUI: addLoaderUI,
    addSection: addSection,
    sectionExists: sectionExists,
    addFiles: addFiles,
    loadSection: loadSection,
    initScrape: initScrape,
    loadHTML: loadHTML,
    loadTemplate: loadTemplate,
    htmlLoaded: htmlLoaded,
    loadCSS: loadCSS,
    cssLoaded: cssLoaded,
    loadJS: loadJS,
    jsLoaded: jsLoaded,
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
    arrayExecuter: arrayExecuter
};

window.oblio = window.oblio || {};
oblio.utils = oblio.utils || {};
oblio.utils.SectionLoader = oblio.utils.SectionLoader || sectionLoader;