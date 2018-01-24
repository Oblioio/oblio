const name = 'fullscreen';

var proto = {
    getName: () => name,
    click: function () {
        return [
            {
                fname: 'fullscreen'
            }
        ];
    }
}

function createElement () {

    var fullscreen = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/" x="0px" y="0px" width="16px" height="16px" viewBox="0 0 16 16" style="enable-background:new 0 0 16 16;" xml:space="preserve"><defs></defs><polyline id="XMLID_22_" style="fill:none;stroke:#FFFFFF;stroke-miterlimit:10;" points="0.5,6.5 0.5,0.5 6.5,0.5 "/><polyline id="XMLID_21_" style="fill:none;stroke:#FFFFFF;stroke-miterlimit:10;" points="9.5,0.5 15.5,0.5 15.5,6.5 "/><polyline id="XMLID_20_" style="fill:none;stroke:#FFFFFF;stroke-miterlimit:10;" points="6.5,15.5 0.5,15.5 0.5,9.5 "/><polyline id="XMLID_19_" style="fill:none;stroke:#FFFFFF;stroke-miterlimit:10;" points="15.5,9.5 15.5,15.5 9.5,15.5 "/></svg>';
    var button = document.createElement('div');

    button.className = 'video-control fullscreen';
    button.innerHTML = fullscreen;
    button.setAttribute('data-name', name);

    return button;
}

export var fullscreen_control = {

    create: function (wrapper) {

        var instance = Object.assign(Object.create(proto), {
            el: createElement()
        });

        wrapper.appendChild(instance.el);

        return instance;
    }
}