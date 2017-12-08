import { pad } from './pad.js';

'use strict';

function formatTime (total_seconds) {
    var hours = pad(Math.floor(total_seconds / (60 * 60)), 2) + ':',
        minutes = pad(Math.floor(total_seconds / 60) % 60, 2) + ':',
        seconds = pad(Math.floor(total_seconds % 60), 2);

    return hours + minutes + seconds;
}

export { formatTime }