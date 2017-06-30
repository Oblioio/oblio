define([
        'OblioUtils/utils/DeviceDetect',
        'OblioUtils/classes/Menu'
    ], function () {

    'use strict';

    var EventHandlers = function (el) {

    }

    EventHandlers.prototype.init = function(data) {

        document.addEventListener('keydown', keyHandler, false);
        window.addEventListener('scroll', scrollHandler, false);

        window.addWheelListener(document, mousewheelHandler);

        var firstTouchStart = function (e) {
            document.removeEventListener('touchstart', firstTouchStart, false);

            document.addEventListener('touchstart', touchStartHandler, false);
            document.addEventListener('touchmove', touchMoveHandler, false);
            document.addEventListener('touchend', touchEndHandler, false);

            window.removeEventListener('mousemove', mousemoveHandler, false);
        }

        document.addEventListener('touchstart', firstTouchStart, false);

        // if (Modernizr.touch) {
        //     document.addEventListener('touchstart', touchStartHandler, false);
        //     document.addEventListener('touchmove', touchMoveHandler, false);
        //     document.addEventListener('touchend', touchEndHandler, false);
        // } else {
        //     window.addEventListener('mousemove', mousemoveHandler, false);
        // }

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
