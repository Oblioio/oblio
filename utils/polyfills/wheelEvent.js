'use strict';

var prefix = '',
    _addEventListener,
    _removeEventListener,
    support;

// detect event model
if ( window.addEventListener ) {
    _addEventListener = 'addEventListener';
    _removeEventListener = 'removeEventListener';
} else {
    _addEventListener = 'attachEvent';
    _removeEventListener = 'detachEvent';
    prefix = 'on';
}

// detect available wheel event
support = 'onwheel' in document.createElement('div') ? 'wheel' : // Modern browsers support 'wheel'
          document.onmousewheel !== undefined ? 'mousewheel' : // Webkit and IE support at least 'mousewheel'
          'DOMMouseScroll'; // let's assume that remaining browsers are older Firefox

function addWheelListener ( elem, callback, useCapture ) {
    let removeFn = _addWheelListener( elem, support, callback, useCapture );

    // handle MozMousePixelScroll in older Firefox
    if( support === 'DOMMouseScroll' ) {
        removeFn = _addWheelListener( elem, 'MozMousePixelScroll', callback, useCapture );
    }

    return removeFn;
}

function removeWheelListener ( elem, callback, useCapture ) {
    _removeWheelListener( elem, support, callback, useCapture );

    // handle MozMousePixelScroll in older Firefox
    if( support === 'DOMMouseScroll' ) {
        _removeWheelListener( elem, 'MozMousePixelScroll', callback, useCapture );
    }
}

function _addWheelListener( elem, eventName, callback, useCapture ) {
    let callbackFn = support == 'wheel' ? callback : function( originalEvent ) {
        !originalEvent && ( originalEvent = window.event );

        // create a normalized event object
        var event = {
            // keep a ref to the original event object
            originalEvent: originalEvent,
            target: originalEvent.target || originalEvent.srcElement,
            type: 'wheel',
            deltaMode: originalEvent.type == 'MozMousePixelScroll' ? 0 : 1,
            deltaX: 0,
            deltaY: 0,
            deltaZ: 0,
            preventDefault: function() {
                originalEvent.preventDefault ?
                    originalEvent.preventDefault() :
                    originalEvent.returnValue = false;
            }
        };

        // calculate deltaY (and deltaX) according to the event
        if ( support == 'mousewheel' ) {
            event.deltaY = - 1/40 * originalEvent.wheelDelta;
            // Webkit also support wheelDeltaX
            originalEvent.wheelDeltaX && ( event.deltaX = - 1/40 * originalEvent.wheelDeltaX );
        } else {
            event.deltaY = originalEvent.deltaY || originalEvent.detail;
        }

        // it's time to fire the callback
        return callback( event );
    }

    elem[ _addEventListener ]( prefix + eventName, callbackFn, useCapture );

    return _removeWheelListener( elem, prefix + eventName, callbackFn, useCapture );
}

function _removeWheelListener( elem, eventName, callback, useCapture ) {
    return function () {
        elem[ _removeEventListener ]( eventName, callback, useCapture );
    }
}

export var wheelEvent = {
    addWheelListener: addWheelListener
};