import './polyfills/matches.js';

'use strict';

function findAncestor (el, sel) {
    while (el && !el.matches(sel)) el = el.parentElement;
    return el;
}

export { findAncestor };