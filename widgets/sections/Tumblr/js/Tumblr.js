import { SectionLoader } from 'OblioUtils/utils/SectionLoader';
import { Section } from 'OblioUtils/classes/Section';

/* Tumblr.widgets */

'use strict';

var myName = "Tumblr",
    blog_name = 'wbpictures', // oblio.settings.blogName, // 'annabelledev',
    api_key = '13OWT3TDZ8tBaGLqIZEHTuyaa8q7UsbaTCSx8I7DtvdqMeEaCy',
    instance,
    sectionLoader = SectionLoader.getInstance(),
    elements,
    mobile = false,
    winHeight = 0,
    winWidth = 0,
    currentFilter = 'none',
    currentLayout = 'one_column',
    scrollTop = 0;

var t = 0;

function prepareLoad () {
    console.log('prepareLoad! ' + myName);

    var files = [
        'html/tumblrPostTypes/post.html',
        'html/tumblrPostTypes/footer.html',
        'html/tumblrPostTypes/link.html',
        'html/tumblrPostTypes/photo.html',
        'html/tumblrPostTypes/photoset.html',
        'html/tumblrPostTypes/quote.html',
        'html/tumblrPostTypes/text.html',
        'html/tumblrPostTypes/video.html'
    ];

    if (files.length > 0) {
        sectionLoader.addFiles('tumblr', files);
    }
}

function init (callback) {
    console.log('init ' + myName);

    elements = this.elements = {
        sectionWrapper: document.getElementById(myName.toLowerCase()),
    };

    var template = sectionLoader.miscFiles['html/tumblrPostTypes/post.html'];
    var partials = {
        footer: sectionLoader.miscFiles['html/tumblrPostTypes/footer.html'],
        link: sectionLoader.miscFiles['html/tumblrPostTypes/link.html'],
        photo: sectionLoader.miscFiles['html/tumblrPostTypes/photo.html'],
        photoset: sectionLoader.miscFiles['html/tumblrPostTypes/photoset.html'],
        quote: sectionLoader.miscFiles['html/tumblrPostTypes/quote.html'],
        text: sectionLoader.miscFiles['html/tumblrPostTypes/text.html'],
        video: sectionLoader.miscFiles['html/tumblrPostTypes/video.html']
    };

    getPostData().then(function (data) {
        console.log(data);
    });

    if (callback) callback();
}

function loadPosts (options = {}) {
    loading = true;

    if (currentFilter !== 'none') {
        options[filters[currentFilter].filterType] = filters[currentFilter].filterValue;
    }

    getPostData(options).then(function (data) {
        data.permalink = false;
        return parsePostData(data);
    }).then(preloadPosts).then(appendPosts).then(function (postIDs) {
        loading = false;
        resize(winWidth, winHeight);
        updateLikeButtons(postIDs);
    });
}

function getPostData (options = {}) {

    // var filter = filters[currentFilter];
    // options.offset = filter.offset;
    options.limit = '10';

    return new Promise(function (resolve, reject) {
        var script,
            callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());

        var type = '';
        if (options.type) {
            type = '/' + options.type;
            delete options.type;
        }

        var keys = Object.keys(options);
        var options_str = '';

        for (var i = 0; i < keys.length; i++) {
            options_str += '&' + keys[i] + '=' + options[keys[i]];
        }

        window[callbackName] = function(data) {
            delete window[callbackName];
            document.body.removeChild(script);

            // filter.offset += data.response.posts.length;
            // filter.allLoaded = filter.offset >= data.response.total_posts;

            resolve(data);
        };

        script = document.createElement('script');
        script.src = 'https://api.tumblr.com/v2/blog/' + blog_name + '.tumblr.com/posts' + type + '?api_key=' + api_key + '&jsonp=' + callbackName + options_str;
        document.body.appendChild(script);
    });
}

function resize (callback) {
    winHeight = window.innerHeight;
    winWidth = window.innerWidth;
}

var props = {
        id: myName,
        prepareLoad: prepareLoad,
        init: init,
        resize: resize
    };

export var Tumblr = {
    getInstance: function () {
        instance = instance || Object.assign(Object.create(Section.prototype), props);
        return instance;
    }
}