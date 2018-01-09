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

    for (var widget_name in oblio.app.dataSrc.widgets) {
        let widget_obj = oblio.app.dataSrc.widgets[widget_name];

        if (widget_obj.visible === 'false') {
            continue;
        }

        this.addSection(widget_name, widget_obj);
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
        filesToLoad: [],
        filesLoaded: 0,
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
    sectionOBJ.files = sectionOBJ.files || [];

    if (typeof files === 'string') {
        sectionOBJ.files.push(files);
    } else {
        for (var i = files.length - 1; i >= 0; i--) {
            sectionOBJ.files.push(files[i]);
        }
    }
}

function addSection (id, data) {

    if (sectionExists(id)) throw 'SectionLoader | addSection: section id ' + id + ' already exists';

    if (instance.verbose) console.log('SectionLoader | addSection: ' + id);

    data.data = data.data || {};
    data.data.base = oblio.settings.assetsUrl || '';

    let sectionObj = {
        id: id,
        data: data.data,
        loaded: false
    }

    if (data.widgets) {
        sectionObj.widgets = data.widgets;
    }

    if (data.files) {
        sectionObj.files = sectionObj.files || [];
        sectionObj.files = sectionObj.files.concat(data.files);
    }

    if (data.templatePath) {
        sectionObj.templatePath = data.templatePath;
        sectionObj.files = sectionObj.files || [];
        sectionObj.files.push(data.templatePath);
    }

    sectionLoaderState.sections.push(sectionObj);
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
        if (this.verbose) console.log('SectionLoader | this.loadSection: ' + id + ' is already loaded');
        reject(true);
        return;
    }

    sectionLoaderState.currentlyLoadingIDs.push(sectionOBJ.id);

    sectionOBJ.partials = getWidgets(sectionOBJ);

    if (sectionOBJ.templatePath) sectionLoaderState.filesToLoad.push(sectionOBJ.templatePath);
    sectionLoaderState.filesToLoad = sectionLoaderState.filesToLoad.concat(sectionOBJ.partials.map(partial => returnSectionOBJ(partial).templatePath).filter(path => path !== undefined));
    if (sectionOBJ.files) sectionLoaderState.filesToLoad = sectionLoaderState.filesToLoad.concat(sectionOBJ.files);

    resolve();

}

// recursively get all of the object's child widgets
function getWidgets (sectionObj) {
    var widgetNames = sectionObj.widgets,
        widgets = [],
        partials = [];

    if (!widgetNames || widgetNames.length === 0) return [];

    var widget;
    for (var i = widgetNames.length - 1; i >= 0; i--) {
        widget = sectionLoader.returnSectionOBJ(widgetNames[i]);
        if (widget) {
            // widgets.push(widget);
            // widgets = widgets.concat(getWidgets(widget));
            if (partials.indexOf(widgetNames[i]) === -1) partials.push(widgetNames[i]);

            let childWidgets = getWidgets(widget);

            for (var j = childWidgets.length - 1; j >= 0; j--) {
                if (partials.indexOf(childWidgets[j]) === -1) partials.push(childWidgets[j]);
            }
        }
    }

    return partials;
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

    sectionLoader.filesLoadedCallback = resolve;

    if (sectionLoaderState.filesToLoad.length < 1) {
        this.complete();
        if (oblio.settings.prepreloader && oblio.settings.prepreloader.goOut) {
            oblio.settings.prepreloader.goOut();
        }
        return;
    }

    var i = sectionLoaderState.filesToLoad.length,
        filesToLoad = sectionLoaderState.filesToLoad;

    if (sectionLoaderState.loader) {
        sectionLoaderState.loader.bringIn();
    }

    while (i--) {
        let url = filesToLoad[i];

        if (url.indexOf('.gif') > 0 || url.indexOf('.jpg') > 0 || url.indexOf('.jpeg') > 0 || url.indexOf('.png') > 0) {
            loadImage.call(this, url, fileLoadComplete(url));               
        } else {
            _loadFile.call(this, url, 'misc', fileLoadComplete(url));
        }
    }
}

function fileLoadComplete (url) {
    return function (data) {
        if (data) sectionLoaderState.files[url] = data;
        sectionLoaderState.filesLoaded++;
        sectionLoader.checkComplete();
    }
}

function loadImage(url, callback){
    console.log('SectionLoader | load image: ' + url);

    var newImage = new Image();

    newImage.addEventListener('load', function () {
        if(this.verbose)console.log('SectionLoader | image Loaded: ' + url);
        if (callback) callback();
    }.bind(this));

    newImage.addEventListener('error', this.fileError);

    newImage.src = url;
}

function getPerc () {

    var loaded = sectionLoaderState.filesLoaded;
    var totalLoad = sectionLoaderState.filesToLoad.reduce(function (acc, curr) {
        return acc++;
    }, 0);

    return loaded/totalLoad;
}

function fileError (e) {
    console.error('SectionLoader | fileError', e.path[0].src, 'not found');
}

function checkComplete(){
    if (sectionLoaderState.filesLoaded >= sectionLoaderState.filesToLoad.length) {
        this.complete();
    }
}

function complete () {
    if (this.verbose) {
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
    sectionLoaderState.filesToLoad = [];
    sectionLoaderState.filesLoaded = 0;

    if (sectionLoaderState.loader && !sectionLoaderState.loader.finished) {
        sectionLoaderState.loader.complete(sectionLoader.filesLoadedCallback);
    } else {
        sectionLoader.filesLoadedCallback();
    }
}

function getSectionTemplates (id) {
    var data = returnSectionOBJ(id);

    return sectionLoaderState.sections.reduce(function (obj, section) {
        if (section.id === id) {
            let template = sectionLoaderState.files[section.templatePath];
            let partials = section.partials.reduce(function (partialsObj, partialName) {
                let partial = returnSectionOBJ(partialName);
                obj.data.data[partialName] = partial.data;
                partialsObj[partialName] = sectionLoaderState.files[partial.templatePath];
                return partialsObj;
            }, {});
            obj.template = template;
            obj.partials = partials;
        }
        return obj;
    }, {data: data});
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
    // loadTemplate: loadTemplate,
    // htmlLoaded: htmlLoaded,
    // loadCSS: loadCSS,
    // cssLoaded: cssLoaded,
    // loadJS: loadJS,
    // jsLoaded: jsLoaded,
    isDuplicate: isDuplicate,
    loadFiles: loadFiles,
    // filesizes: [],
    // defaultSize: 100,
    // setFileSize: setFileSize,
    // getFileSize: getFileSize,
    getPerc: getPerc,
    fileError: fileError,
    checkComplete: checkComplete,
    complete: complete,
    returnSectionOBJ: returnSectionOBJ,
    getSectionTemplates: getSectionTemplates,
    getSectionLoaderState: getSectionLoaderState,
    loadImage: loadImage,
    // miscLoadFile: miscLoadFile,
    arrayExecuter: arrayExecuter,
    getWidgets: getWidgets
};

export var SectionLoader = {
    getInstance: function () {
        instance = instance || Object.create(sectionLoader);
        return instance;
    }
}