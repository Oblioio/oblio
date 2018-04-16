import { SectionLoader } from 'OblioUtils/utils/SectionLoader';
import { Section } from 'OblioUtils/classes/Section';
import { Navigation } from 'OblioUtils/classes/Navigation';

/* Videos.widgets */

'use strict';

var myName = 'Videos',
    yt_player,
    elements,
    instance,
    data,
    sectionHeight = 0,
    sectionWidth = 0,
    sectionTop = 0,
    vidMenu,
    videoInfo,
    videoMenuItems = [],
    totalVisibleVideos = 0,
    currVidId,
    navigation = Navigation.getInstance(),
    pause_cover,
    // playercontrols,
    // vid_buttons,
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

    elements = this.elements = {
        sectionWrapper: document.getElementById(myName.toLowerCase()),
        videoMenuObj: document.getElementById('playerMenu'),
        menuWrapper: document.getElementById('vid_nav_wrapper'),
        cookiePrefs: document.getElementById('teconsent'),
        footer: document.getElementById('footer'),
        header: document.getElementById('mainHeader')
    };

    elements.player = elements.sectionWrapper.querySelector('.vid_wrapper');
    setupYoutubePlayer();

    videoInfo = [];

    if (data.videos.length > 1) {
        elements.menuWrapper.style.display = 'block';
    }

    for (var i = 0; i < data.videos.length; i++) {

        // false will evaluate to true if it's a string, so also make sure that it's not a string that === 'false'
        if (data.videos[i].visible && data.videos[i].visible !== 'false') {
            videoInfo.push(data.videos[i]);
            videoMenuItems.push({link: data.videos[i].videoSrc, label: data.videos[i].title});
            totalVisibleVideos ++;
        }
    }

    elements.sectionWrapper.querySelector('.close_btn').addEventListener('click', function (e) {
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

    var youtube_wrapper = elements.sectionWrapper.querySelector('.vid_wrapper');

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

        elements.videoMenuObj.addEventListener('click', changeVideo.bind(this));
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

    this.resize(oblio.settings.windowDimensions.width, oblio.settings.windowDimensions.height);

    if (callbackFn) {
        callbackFn();
    }
}

function show (callback) {
    TweenMax.to(elements.sectionWrapper, 0.75, {autoAlpha: 1, ease: Power3.easeInOut, onComplete: function () {
        if (callback) callback();
    }});
}

function hide (callback) {
    pauseVideo();

    TweenMax.to(elements.sectionWrapper, 0.75, {autoAlpha: 0, ease: Power3.easeInOut, onComplete: function () {
        elements.sectionWrapper.style.display = 'none';
        if (callback) callback();
    }});
}

function shutdown (callBackFn){
    if (this.verbose) {
        console.log('Videos: shutdown');
    }

    // if (yt_player) {
    //     yt_player.destroy();
    // }

    if (oblio.app.mainMenu) {
        oblio.app.mainMenu.show();
    }

    if (oblio.app.Footer) {
        oblio.app.Footer.show();
    }

    if (this.elements.cookiePrefs) {
        this.elements.cookiePrefs.style.display = 'block';
    }

    if (callBackFn) {
        callBackFn();
    }
}

function changeVideo (e) {
// e.preventDefault();
// debugger;
    if (e.target.parentNode.classList.contains('active')) {
        e.stopPropagation();
        e.preventDefault();
        return;
    } 

    if (this.verbose) {
        console.log('Videos: changeVideo');
    }

    var oldVidObj = videoInfo[currVidId];

    if (typeof e === 'object') {
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

    e.preventDefault();
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
    if (elements === undefined) {
        return;
    }

    let footerHeight = elements.footer.offsetHeight;
    let headerHeight = elements.header.offsetHeight;
    let menuHeight = elements.menuWrapper.offsetHeight;

    sectionHeight = h;
    sectionWidth = w;

    elements.sectionWrapper.style.width = sectionWidth + 'px';
    elements.sectionWrapper.style.height = sectionHeight + 'px';

    let vidWidth = sectionWidth,
        vidHeight = Math.min(sectionHeight - (footerHeight + headerHeight + menuHeight), sectionWidth * (9 / 16));

    elements.menuWrapper.style.top = headerHeight + 'px';
    elements.player.style.top = headerHeight + menuHeight + 0.5 * ((sectionHeight - (headerHeight + footerHeight)) - vidHeight) + 'px';
    elements.player.style.height = vidHeight + 'px';
    elements.player.style.width = vidWidth + 'px';
    elements.player.style.left = ((sectionWidth - vidWidth) * 0.5) + 'px';

    resizables.forEach(resizable => resizable.resize(vidWidth, vidHeight));
}

var props = {
    id: myName,
    prepareLoad: prepareLoad,
    init: init,
    resize: resize,
    startup: startup,
    shutdown: shutdown,
    show: show,
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