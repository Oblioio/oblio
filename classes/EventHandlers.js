define([
        'oblio/utils/DeviceDetect',
        'oblio/classes/Menu',
        'greensock/TweenLite.min',
        'greensock/easing/EasePack.min',
        'greensock/plugins/CSSPlugin.min'
    ], function () {

    'use strict';

    var EventHandlers = function (el) {

    }

    EventHandlers.prototype.init = function(data) {
        var _window = $(window),
            _document = $(document);

        _document.on('keydown', keyHandler);
        _window.on('scroll', scrollHandler);
        window.addWheelListener(document, mousewheelHandler);

        if (Modernizr.touch) {
            _document.on('touchstart', touchStartHandler);
            _document.on('touchmove', touchMoveHandler);
            _document.on('touchend', touchEndHandler);
        } else {
            _window.on('mousemove', mousemoveHandler);
        }

        //window.onorientationchange = handleResize;
    }

    function mousemoveHandler (e) {
        if (oblio.sections[oblio.app.navigation.current_section] && oblio.sections[oblio.app.navigation.current_section].mousemoveHandler) {
            oblio.sections[oblio.app.navigation.current_section].mousemoveHandler(e);
        }
    }

    function mousewheelHandler (e) {
        if (oblio.sections[oblio.app.navigation.current_section] && oblio.sections[oblio.app.navigation.current_section].mousewheelHandler) {
            oblio.sections[oblio.app.navigation.current_section].mousewheelHandler(e);
        }
    }

    function scrollHandler (e) {
        if (oblio.sections[oblio.app.navigation.current_section] && oblio.sections[oblio.app.navigation.current_section].scrollHandler) {
            oblio.sections[oblio.app.navigation.current_section].scrollHandler(e);
        }
    }

    function keyHandler (e) {
        if (oblio.sections[oblio.app.navigation.current_section] && oblio.sections[oblio.app.navigation.current_section].keyHandler) {
            oblio.sections[oblio.app.navigation.current_section].keyHandler(e);
        }
    }

    function touchStartHandler (e) {
        if (oblio.sections[oblio.app.navigation.current_section] && oblio.sections[oblio.app.navigation.current_section].touchStartHandler) {
            oblio.sections[oblio.app.navigation.current_section].touchStartHandler(e);
        }
    }

    function touchMoveHandler (e) {
        if (oblio.sections[oblio.app.navigation.current_section] && oblio.sections[oblio.app.navigation.current_section].touchMoveHandler) {
            oblio.sections[oblio.app.navigation.current_section].touchMoveHandler(e);
        }
    }

    function touchEndHandler (e) {
        if (oblio.sections[oblio.app.navigation.current_section] && oblio.sections[oblio.app.navigation.current_section].touchEndHandler) {
            oblio.sections[oblio.app.navigation.current_section].touchEndHandler(e);
        }
    }

    window.oblio = window.oblio || {};
    oblio.classes = oblio.classes || {};
    oblio.classes.EventHandlers = new EventHandlers();

    return oblio.classes.EventHandlers;
});
