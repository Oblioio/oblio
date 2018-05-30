import 'platform';

var player_proto = {
    play: function () {
        this.isPaused = false;
        this.player.play().then(function () {
            // console.log('then');
            // this.isPaused = false;
        }.bind(this)).catch(function (err) {
            console.log(err);
        });
    },
    pause: function (resume) {
        if (!resume) this.isPaused = true;

        this.player.pause().then(function () {
            // this.isPaused = true;
        }.bind(this));
    },
    paused: function () {
        return this.isPaused;
    },
    setVolume: function (v) {
        this.volume = v;
        this.player.setVolume(v);
    },
    getVolume: function () {
        return this.volume;
    },
    getCurrentTime: function () {
        this.player.getCurrentTime().then(function (ct) {
            this.currentTime = ct;
        }.bind(this));
        return this.currentTime || 0;
    },
    setCurrentTime: function (ct) {
        this.currentTime = ct * this.duration;
        this.player.setCurrentTime(this.currentTime);
    },
    getDuration: function () {
        this.player.getDuration().then(function (d) {
            if (this.duration !== d) {
                this.duration = d;
                this.onStateChange('durationchange').call(this);
            }
        }.bind(this));
        return this.duration || 0;
    },
    fullscreen: function () {
        var iframe = document.getElementById(this.video_el.id);

        var fullscreenFn = iframe.requestFullscreen ||
            iframe.webkitRequestFullscreen || 
            iframe.mozRequestFullscreen || 
            iframe.msRequestFullscreen || function () {
                console.warning('This browser does not support fullscreen');
            };

        fullscreenFn.call(iframe);
    },
    onStateChange: function (eventName) {
        return function (e) {
            switch (eventName) {
                case 'play':
                    this.events.publish('play', {playing: true});
                    break;
                case 'pause':
                    this.events.publish('pause', {paused: true});
                    break;
                case 'ended':
                    this.events.publish('ended', {ended: true});
                    break;
                case 'timeupdate':
                    this.events.publish('timeupdate', {currentTime: this.getCurrentTime(), duration: this.getDuration()});
                    break;
                case 'durationchange':
                    this.events.publish('durationchange', {duration: this.getDuration()});
                    break;
                case 'volumechange':
                    this.events.publish('volumechange', {volume: this.getVolume()})
                default:
                    console.log(eventName);
            }
        }
    },
    getRatio: function () {
        return this.ratio;
    }
}

function onError (e) {
    console.log('YOUTUBE ERROR', e);
}

function loadScript( url, callback ) {
    var script = document.createElement( "script" )
    script.type = "text/javascript";
    if(script.readyState) {  //IE
        script.onreadystatechange = function() {
            if ( script.readyState === "loaded" || script.readyState === "complete" ) {
                script.onreadystatechange = null;
                callback();
            }
        };
    } else {  //Others
        script.onload = function() {
            callback();
        };
    }

    script.src = url;
    document.getElementsByTagName( "head" )[0].appendChild( script );
}

function resize (w, h) {
    var ratio = h / w;

    return function () {
        var w = this.wrapper.offsetWidth;

        this.ratio = ratio;
        this.player.element.style.width = w + 'px';
        this.player.element.style.height = (w * this.ratio) + 'px';
    }
}

function loadOEmbed (vID, options) {
    return new Promise (function (resolve, reject) {
        var script,
            type = 'json',
            callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random()),
            url = 'https://vimeo.com/api/oembed.json?url=https%3A//vimeo.com/' + vID;

        var xhr = new XMLHttpRequest();
        xhr.addEventListener('load', function (e) {
            var json = JSON.parse(e.target.responseText);
            var background = 1;

            // // background feature breaks vimeo on mobile devices
            // if (platform.os.family.match(/(Android|iOS|Windows\sPhone)/)) {
            //     background = 0;
            // }

            resolve(json.html.replace(/(src="(?:[^\\"]+|\\.)*(?="))/, '$1?background=' + background + '&loop=0&autoplay=0'));
        });
        xhr.open('GET', url);
        xhr.send();

    }.bind());
}

function addEvents () {
    var events = [
        'play',
        'pause',
        'ended',
        'timeupdate',
        'durationchange',
        // 'progress',
        // 'seeked',
        // 'texttrackchange',
        // 'cuechange',
        // 'cuepoint',
        'volumechange',
        // 'error',
        // 'loaded'
    ];

    events.forEach(function (eventName) {
        this.player.on(eventName, this.onStateChange(eventName).bind(this));
    }.bind(this));
}

function load () {

    return new Promise (function (resolve, reject) {

        this.isPaused = false;
        var vID = this.options.videoSrc;
        delete this.options.videoSrc;

        loadOEmbed(vID, this.options).then(function (html) {
            var div = document.createElement('div');
            div.innerHTML = html;
            var iframe = div.querySelector('iframe');
            this.video_el.appendChild(iframe);

            loadScript('https://player.vimeo.com/api/player.js', function() {
                var options = {
                        // id: this.options.videoSrc,
                        // portrait: this.options.portrait,
                        // title: this.options.title,
                        // byline: this.options.byline,
                        // background: 1,
                        // loop: 0
                    };

                this.player = new Vimeo.Player(iframe, options);
                this.player.ready().then(function () {
                    this.resize = resize(this.player.element.width, this.player.element.height);
                    addEvents.call(this);
                    this.setVolume(1);
                    resolve(this);
                }.bind(this));
            }.bind(this));
        }.bind(this));

    }.bind(this));
}

export var player = {
    proto: player_proto,
    resize: resize,
    load: load
}