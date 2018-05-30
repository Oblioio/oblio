import { SectionLoader } from 'OblioUtils/utils/SectionLoader';
import { Section } from 'OblioUtils/classes/Section';
import { Navigation } from 'OblioUtils/classes/Navigation';

/* Videos.widgets */

'use strict';

var myName = 'Videos',
    yt_player,
    instance,
    data,
    vidMenu,
    videoInfo,
    videoMenuItems = [],
    totalVisibleVideos = 0,
    currVidId,
    navigation = Navigation.getInstance(),
    pause_cover,
    resizables = [];

function prepareLoad () {
    console.log('prepareLoad! ' + myName);
    var files = [];

    if (files.length > 0) {
        sectionLoader.addFiles(myName, files);
    }
}

// var Videos = function () {
//     console.log('hey there ' + myName);
//     this.initialized = false;
// };

function init (callback) {
    console.log('Videos: init');

    data = oblio.app.dataSrc.widgets.Videos.data;

    this.elements = {
        sectionWrapper: document.getElementById(myName.toLowerCase()),
        videoMenuObj: document.getElementById('playerMenu'),
        menuWrapper: document.getElementById('vid_nav_wrapper'),
        cookiePrefs: document.getElementById('teconsent'),
        footer: document.getElementById('footer'),
        header: document.getElementById('mainHeader')
    };

    this.elements.player = this.elements.sectionWrapper.querySelector('.vid_wrapper');
    setupYoutubePlayer.call(this);

    videoInfo = [];

    if (data.videos.length > 1) {
        this.elements.menuWrapper.style.display = 'block';
    }

    for (var i = 0; i < data.videos.length; i++) {

        // false will evaluate to true if it's a string, so also make sure that it's not a string that === 'false'
        if (data.videos[i].visible && data.videos[i].visible !== 'false') {
            videoInfo.push(data.videos[i]);
            videoMenuItems.push({link: data.videos[i].videoSrc, label: data.videos[i].title});
            totalVisibleVideos ++;
        }
    }

    this.elements.sectionWrapper.querySelector('.close_btn').addEventListener('click', function (e) {
        e.preventDefault();
        navigation.changeSection('Home');
    });

    // Set the name of the hidden property and the change event for visibility
    var hidden, visibilityChange; 
    if (typeof document.hidden !== 'undefined') { // Opera 12.10 and Firefox 18 and later support 
        hidden = 'hidden';
        visibilityChange = 'visibilitychange';
    } else if (typeof document.mozHidden !== 'undefined') {
        hidden = 'mozHidden';
        visibilityChange = 'mozvisibilitychange';
    } else if (typeof document.msHidden !== 'undefined') {
        hidden = 'msHidden';
        visibilityChange = 'msvisibilitychange';
    } else if (typeof document.webkitHidden !== 'undefined') {
        hidden = 'webkitHidden';
        visibilityChange = 'webkitvisibilitychange';
    }

    document.addEventListener(visibilityChange, function (e) {
        if (e.target.hidden === true) {
            pauseVideo.call(this);
        } else if (e.target.hidden === false) {
            // unmuteAll.apply(this);
        } else {
            console.log('unknown page visibility status');
        }
    }.bind(this), false);

    this.resize();

    if (callback) {
        callback();
    }
}

function setupYoutubePlayer (callback) {
    var playerOptions = {
        autoplay: 1,
        videoSrc: oblio.app.dataSrc.widgets.Videos.data.videos[oblio.app.dataSrc.settings.defaultVideoIndex].videoSrc,
        rel: 0,
        showinfo: 1,
        modestbranding: 1,
        pauseoverlay: 0
    };

    var youtube_wrapper = this.elements.sectionWrapper.querySelector('.vid_wrapper');

    if (typeof player !== 'undefined') {
        player.create(youtube_wrapper.querySelector('.videoplayer'), youtube_wrapper, 'youtube', playerOptions).then(function (videoPlayer) {
            yt_player = videoPlayer;
            resizables.push(videoPlayer);
        }.bind(this));
    }   
}

function startup (callbackFn) {
    var i;

    if (this.verbose) {
        console.log('Videos: startup');
    }

    this.elements.sectionWrapper.style.display = 'block';

    if (!vidMenu && typeof Menu !== 'undefined') {
        this.elements.sectionWrapper.style.visibility = 'hidden';
        vidMenu = Menu.getNew({
            menuID: 'playerMenu',
            wrapperID: 'vid_nav_wrapper',
            paginatorElID: 'vid_nav_paginator',
            menuStyle: 'horizontal',
            menuList: videoMenuItems
        });

        if (vidMenu.menuList.length === 1) {
            this.elements.videoMenuObj.style.visibility = 'hidden';
        }

        this.elements.videoMenuObj.addEventListener('click', changeVideo.bind(this));
    }

    /** show vids **/
    this.elements.vidMenuButtons = this.elements.videoMenuObj.getElementsByTagName('a');
    for (i = 0; i < this.elements.vidMenuButtons.length; i++){
        this.elements.vidMenuButtons[i].setAttribute('rel', i);
    }

    var buttonIndex = currVidId;

    if (buttonIndex === undefined) {
        buttonIndex = oblio.app.dataSrc.settings.defaultVideoIndex;
    }

    var chosenVid = this.elements.vidMenuButtons[buttonIndex];
    chosenVid.parentNode.className = 'active';
    currVidId = Number(chosenVid.rel);
    /** end show vids **/

    if (callbackFn) {
        callbackFn();
    }
}

function hide (callback) {
    pauseVideo();

    TweenMax.to(this.elements.sectionWrapper, 0.75, {autoAlpha: 0, ease: Power3.easeInOut, onComplete: function () {
        this.elements.sectionWrapper.style.display = 'none';
        if (callback) callback();
    }.bind(this)});
}

function shutdown (callBackFn){
    if (this.verbose) {
        console.log('Videos: shutdown');
    }

    if (callBackFn) {
        callBackFn();
    }
}

function changeVideo (e) {
    e.preventDefault();

    if (e.target.parentNode.classList.contains('active')) {
        e.stopPropagation();
        return;
    }

    if (this.verbose) {
        console.log('Videos: changeVideo');
    }

    var oldVidObj = videoInfo[currVidId];

    if (typeof e === 'object' && e.target.rel) {
        currVidId = Number(e.target.rel);
    }

    this.elements.player.style.visibility = 'visible';

    var newVidObj = videoInfo[currVidId];

    for (var i=0; i<this.elements.vidMenuButtons.length; i++) {
        var currbutton = this.elements.vidMenuButtons[i];
        if (Number(currbutton.rel) === currVidId) {
            currbutton.parentNode.className = 'active';
        } else {
            currbutton.parentNode.className = '';
        }
    }

    if (oldVidObj.type === newVidObj.type) {
        yt_player.loadVideoById(videoInfo[currVidId].videoSrc);
    } else {
        // yt_player.destroy();
        setTimeout(this.show.bind(this), 100);
    }
}

function pauseVideo () {
    console.log('Videos: pauseVideo');

    if (yt_player && yt_player.pause) {
        yt_player.pause();
    }
}

function onIntroComplete () {
    if (this.verbose) {
        console.log('Videos: onIntroComplete');
    }

    navigation.changeSection('Home');
}

function resize (w, h) {
    if (this.elements === undefined) {
        return;
    }

    let footerHeight = oblio.settings.footerHeight;
    let headerHeight = oblio.settings.headerHeight;
    let menuHeight = this.elements.menuWrapper.offsetHeight;

    this.height = h - headerHeight - footerHeight;
    this.width = w;

    this.elements.sectionWrapper.style.width = this.width + 'px';
    this.elements.sectionWrapper.style.height = this.height + 'px';
    this.elements.sectionWrapper.style.top = headerHeight + 'px';

    let vidWidth = this.width,
        vidHeight = Math.min(this.height - menuHeight, this.width * (9 / 16));

    this.elements.player.style.height = vidHeight + 'px';
    this.elements.player.style.width = vidWidth + 'px';
    this.elements.player.style.top = (((this.height - menuHeight) - vidHeight) * 0.4) + 'px';
    this.elements.player.style.left = ((this.width - vidWidth) * 0.5) + 'px';

    resizables.forEach(resizable => resizable.resize(vidWidth, vidHeight));
}

var props = {
    id: myName,
    prepareLoad: prepareLoad,
    init: init,
    resize: resize,
    startup: startup,
    shutdown: shutdown,
    hide: hide,
    pauseVideo: pauseVideo,
    onIntroComplete: onIntroComplete
};

export var Videos = {
    getInstance: function () {
        instance = instance || Object.assign(Object.create(Section.prototype), props);
        return instance;
    }
};