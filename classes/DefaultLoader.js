// UMD (Universal Module Definition) patterns for JavaScript modules that work everywhere.
// https://github.com/umdjs/umd/blob/master/amdWebGlobal.js

;(function (root, factory) {
    // Browser globals
    root.classes = root.classes || {};

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], function () {
            return (root.classes.DefaultLoader = factory());
        });
    } else {
        root.classes.DefaultLoader = factory();
    }
}(window.oblio = window.oblio || {}, function () {

    var myName = "DefaultLoader";

    var DefaultLoader = function () {

        this.id = "DefaultLoader";

        this.elem = createElem();
        $('body').append($(this.elem));

        this.progressBar = createBar();
        this.elem.appendChild(this.progressBar);

        this.loaderText_before = "LOADING: ";
        this.loaderText_after = "% COMPLETE";
        this.loaderText = document.createElement('h2');
        this.loaderText.id = 'loaderText';
        this.elem.appendChild(this.loaderText);

        this.elem.style.display = 'block';
        this.elem.style.visibility = 'hidden';

    }

    function createElem(){
        var elem = document.createElement('div');
        elem.id = 'default_loader';
        elem.style.position = 'absolute';
        elem.style.zIndex = 200;
        elem.style.width = '100%';
        elem.style.height = '4px';

        return elem;
    }

    function createBar(){
        var loaderBar = document.createElement('div');
        loaderBar.id = 'loader_bar';
        loaderBar.style.position = 'absolute';
        loaderBar.style.top = '0px';
        loaderBar.style.left = '0px';
        loaderBar.style.height = '100%';
        loaderBar.style.width = '0%';
        loaderBar.style.background = '#FF0000';

        return loaderBar;
    }

    function resize () {

    }

    DefaultLoader.prototype.resize = resize;

    return DefaultLoader;
}));