const name = 'progress';

const pad = (n, s) => ('000000000' + n).substr(-s);

var proto = {
    getName: () => name,
    mousedown: function (e) {
        this.scrubbing = true;

        var p = Math.max(0, Math.min(1, (e.clientX - this.offset) / this.width));

        this.setProgress(p);

        return [
            {
                fname: 'pause',
                args: [true]
            },
            {
                fname: 'updateTime',
                args: [p]
            }
        ];
    },
    mouseup: function (e) {
        if (this.scrubbing) {
            var p = Math.max(0, Math.min(1, (e.clientX - this.offset) / this.width));
            this.setProgress(p);

            window.setTimeout(function () {
                this.scrubbing = false;
            }.bind(this), 50);

            return [
                {
                    fname: 'resume'
                },
                {
                    fname: 'updateTime',
                    args: [p]
                }
            ];
        }
    },
    mousemove: function (e) {
        if (this.scrubbing) {
            var p = Math.max(0, Math.min(1, (e.clientX - this.offset) / this.width));
            this.setProgress(p);

            return [
                {
                    fname: 'updateTime',
                    args: [p]
                }
            ];
        }
    },
    setProgress: function (p) {
        this.progress = p;
        this.bar.style.transform = 'scaleX(' + this.progress + ')';    
        updateTime.call(this);   
    },
    setDuration: function (d) {
        this.duration = d;
        updateTime.call(this);
        this.resize();
    },
    getProgress: function () {
        return this.progress;
    },
    resize: function () {
        var timeWidth = this.time.offsetWidth + 12;
        this.width = this.el.offsetWidth - timeWidth;
        this.offset = getPosition(this.el).x;
        this.height = this.el.offsetHeight;

        this.track.style.width = this.width + 'px';
    }
}

function updateTime () {
    this.time.textContent = formatTime(this.progress * this.duration) + '/' + formatTime(this.duration);
}

function formatTime (total_seconds) {
    var hours = Math.floor(total_seconds / (60 * 60)),
        minutes = (hours > 0 ? pad(Math.floor(total_seconds / 60) % 60, 2) : Math.floor(total_seconds / 60)) + ':',
        seconds = pad(Math.floor(total_seconds % 60), 2);

    hours = hours > 0 ? hours + ':' : '';

    return hours + minutes + seconds;
}

/**
 * Add up all the offsets
 */
function getPosition (el) {
    var xPosition = 0;
    var yPosition = 0;

    while (el) {
        if (el.tagName == "BODY") {
            // deal with browser quirks with body/window/document and page scroll
            var xScrollPos = el.scrollLeft || document.documentElement.scrollLeft;
            var yScrollPos = el.scrollTop || document.documentElement.scrollTop;

            xPosition += (el.offsetLeft - xScrollPos + el.clientLeft);
            yPosition += (el.offsetTop - yScrollPos + el.clientTop);
        } else {
            xPosition += (el.offsetLeft - el.scrollLeft + el.clientLeft);
            yPosition += (el.offsetTop - el.scrollTop + el.clientTop);
        }

        el = el.offsetParent;
    }
    return {
        x: xPosition,
        y: yPosition
    };
}

function createElement () {

    var outer = document.createElement('div'),
        track = document.createElement('div'),
        progressbar = document.createElement('div'),
        time = document.createElement('div');

    outer.className = 'video-control progress';
    track.className = 'track';
    time.className = 'time';
    progressbar.className = 'progressbar';
    outer.setAttribute('data-name', name);
    track.appendChild(progressbar);
    outer.appendChild(track);
    outer.appendChild(time);

    return outer;
}

export var progress_control = {
    create: function (wrapper, player) {

        var instance = Object.assign(Object.create(proto), {
            el: createElement(),
            progress: 0
        });

        instance.bar = instance.el.querySelector('.progressbar');
        instance.time = instance.el.querySelector('.time');
        instance.track = instance.el.querySelector('.track');

        wrapper.appendChild(instance.el);
        instance.resize();

        instance.setDuration(player.getDuration());
        instance.setProgress(0);

        return instance;
    }
}