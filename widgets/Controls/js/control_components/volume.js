const name = 'volume';

var proto = {
    getName: () => name,
    mousedown: function (e) {
        this.dragging = true;

        var v = 1 - Math.max(0, Math.min(1, (e.clientY - this.offset) / this.height));
        this.setVolume(v);

        return [
            {
                fname: 'mute',
                args: [true]
            },
            {
                fname: 'updateVolume',
                args: [v]
            }
        ];
    },
    mouseup: function (e) {
        if (this.dragging) {
            this.dragging = false;
            var v = 1 - Math.max(0, Math.min(1, (e.clientY - this.offset) / this.height));
            this.setVolume(v);

            return [
                {
                    fname: 'updateVolume',
                    args: [v]
                }
            ]
        }
    },
    mousemove: function (e) {
        if (this.dragging) {
            var v = 1 - Math.max(0, Math.min(1, (e.clientY - this.offset) / this.height));
            this.setVolume(v);

            return [
                {
                    fname: 'updateVolume',
                    args: [v]
                }
            ]
        }
    },
    setVolume: function (v) {
        this.needsUpdate = true;
        this.volume = v;
        if (!this.bar) this.bar = this.el.querySelector('.volumebar');
        if (!this.handle) this.handle = this.el.querySelector('.handle');
        this.bar.style.transform = 'scaleY(' + v + ')';
        TweenMax.set(this.handle, {y: -(v * this.height) + 'px'});
    },
    getVolume: function () {
        return this.volume;
    },
    resize: function () {
        var track = this.el.querySelector('.track');
        this.offset = getPosition(track).y;
        this.height = track.offsetHeight;
    }
}

function createElement () {

    var outer = document.createElement('div'),
        slider = document.createElement('div'),
        track = document.createElement('div'),
        handle = document.createElement('div'),
        volumebar = document.createElement('div');

    outer.className = 'video-control volume';
    slider.className = 'slider';
    track.className = 'track';
    handle.className = 'handle';
    volumebar.className = 'volumebar';
    outer.setAttribute('data-name', name);
    track.appendChild(volumebar);
    track.appendChild(handle);
    slider.appendChild(track);
    outer.appendChild(slider);

    return outer;
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

export var volume_control = {

    create: function (wrapper) {

        var instance = Object.assign(Object.create(proto), {
            el: createElement(),
            volume: 1
        });

        var volume_wrapper = wrapper.querySelector('.volume_wrapper');

        if (volume_wrapper) {
            volume_wrapper.appendChild(instance.el);
        } else {
            volume_wrapper = document.createElement('div');
            volume_wrapper.className = 'volume_wrapper';
            wrapper.appendChild(volume_wrapper);
        }

        volume_wrapper.appendChild(instance.el);

        instance.resize();
        instance.setVolume(instance.volume);
        instance.needsUpdate = true;

        return instance;
    }
}