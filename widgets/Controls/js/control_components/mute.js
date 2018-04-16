const name = 'mute';

var proto = {
    getName: () => name,
    click: function () {
        return [
            {
                fname: this.toggle(),
                args: [false]
            }
        ];
    },
    toggle: function () {
        if (this.muted) {
            this.setState(this.volume);
            return 'unmute';
        } else {
            this.setState(0);
            return 'mute';
        }
    },
    setVolume: function (v) {
        this.volume = v;
    },
    getVolume: function () {
        return this.volume;
    },
    setState: function (v) {
        if (v > 0) {
            this.el.classList.remove('muted');
            this.muted = false;
        } else {
            this.el.classList.add('muted');
            this.muted = true;
        }
    }
}

function createElement () {

    // var mute = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/" x="0px" y="0px" width="16.558px" height="17.003px" viewBox="0 0 16.558 17.003" style="enable-background:new 0 0 16.558 17.003;" xml:space="preserve"><defs></defs><polygon id="XMLID_22_" style="fill:none;stroke:#FFFFFF;stroke-miterlimit:10;" points="9.46,15.919 0.77,8.501 9.46,1.084 "/><line id="XMLID_21_" style="fill:none;stroke:#FFFFFF;stroke-miterlimit:10;" x1="12.058" y1="6.497" x2="12.058" y2="10.506"/><line id="XMLID_20_" style="fill:none;stroke:#FFFFFF;stroke-miterlimit:10;" x1="14.058" y1="5.501" x2="14.058" y2="11.501"/><line id="XMLID_19_" style="fill:none;stroke:#FFFFFF;stroke-miterlimit:10;" x1="16.058" y1="3.497" x2="16.058" y2="13.506"/></svg>';
    // var unmute = '<svg class="unmute" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/" x="0px" y="0px" width="15px" height="15px" viewBox="0 0 1.63 2.719" style="enable-background:new 0 0 1.63 2.719;" xml:space="preserve"><defs></defs><polygon id="XMLID_16_" points="1.63,0 0.52,0.828 0,0.828 0,1.891 0.52,1.891 1.63,2.719 "/></svg>';
    var speaker = '<svg class="speaker" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/" x="0px" y="0px" width="16.558px" height="17.003px" viewBox="0 0 16.558 17.003" style="enable-background:new 0 0 16.558 17.003;" xml:space="preserve"><defs></defs><polygon id="XMLID_17_" style="fill:none;stroke:#FFFFFF;stroke-miterlimit:10;" points="9.46,15.919 0.77,8.501 9.46,1.084 "/></svg>';
    var vibes = '<svg class="vibes" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/" x="0px" y="0px" width="16.288px" height="15.834px" viewBox="0 0 16.288 15.834" style="enable-background:new 0 0 16.288 15.834;" xml:space="preserve"><defs></defs><line id="XMLID_21_" style="fill:none;stroke:#FFFFFF;stroke-miterlimit:10;" x1="11.788" y1="5.913" x2="11.788" y2="9.922"/><line id="XMLID_20_" style="fill:none;stroke:#FFFFFF;stroke-miterlimit:10;" x1="13.788" y1="4.917" x2="13.788" y2="10.917"/><line id="XMLID_19_" style="fill:none;stroke:#FFFFFF;stroke-miterlimit:10;" x1="15.788" y1="2.913" x2="15.788" y2="12.922"/></svg>';
    var offx = '<svg class="offx" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/" x="0px" y="0px" width="16.288px" height="15.834px" viewBox="0 0 16.288 15.834" style="enable-background:new 0 0 16.288 15.834;" xml:space="preserve"><defs></defs><line id="XMLID_19_" style="fill:none;stroke:#FFFFFF;stroke-miterlimit:10;" x1="11.666" y1="5.796" x2="15.909" y2="10.039"/><line id="XMLID_18_" style="fill:none;stroke:#FFFFFF;stroke-miterlimit:10;" x1="15.909" y1="5.796" x2="11.666" y2="10.039"/></svg>';
    var button = document.createElement('div');
    button.className = 'video-control mute';
    button.innerHTML = speaker + vibes + offx;
    button.setAttribute('data-name', name);

    return button;
}

export var mute_control = {

    create: function (wrapper) {

        var instance = Object.assign(Object.create(proto), {
            el: createElement(),
            volume: 1,
            muted: false
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

        return instance;
    }
}

