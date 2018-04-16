const name = 'playpause';

var proto = {
    getName: () => name,
    click: function () {
        return [
            {
                fname: this.toggle()
            }
        ];
    },
    toggle: function () {
        return this.paused ? this.play() : this.pause();
    },
    pause: function () {
        this.el.classList.add('paused');
        this.paused = true;
        return 'pause';
    },
    play: function () {
        this.el.classList.remove('paused');
        this.paused = false;
        return 'play';
    },
    getPaused: function () {
        return this.paused;
    }
}

function createElement () {

    var play = '<svg class="play" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/" x="0px" y="0px" width="16.288px" height="16.823px" viewBox="0 0 16.288 16.823" style="enable-background:new 0 0 16.288 16.823;" xml:space="preserve"><defs></defs><polygon id="XMLID_17_" style="fill:none;stroke:#FFFFFF;stroke-miterlimit:10;" points="2.637,15.921 14.645,8.411 2.637,0.902 "/></svg>',
        pause = '<svg class="pause" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/" x="0px" y="0px" width="16.288px" height="15.834px" viewBox="0 0 16.288 15.834" style="enable-background:new 0 0 16.288 15.834;" xml:space="preserve"><defs></defs><g id="XMLID_19_"><line id="XMLID_21_" style="fill:none;stroke:#FFFFFF;stroke-miterlimit:10;" x1="5" y1="0.417" x2="5" y2="15.417"/><line id="XMLID_20_" style="fill:none;stroke:#FFFFFF;stroke-miterlimit:10;" x1="11" y1="0.5" x2="11" y2="15.417"/></g></svg>';

    var button = document.createElement('div');
    button.className = 'video-control playpause paused';
    button.setAttribute('data-name', name);
    button.innerHTML = play + pause;

    return button;
}

export var play_pause_control = {

    create: function (wrapper) {

        var instance = Object.assign(Object.create(proto), {
            el: createElement()
        });

        wrapper.appendChild(instance.el);
        instance.paused = true;

        return instance;
    }
}