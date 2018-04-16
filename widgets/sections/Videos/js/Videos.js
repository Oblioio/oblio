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
    videosPlayerObj;

function prepareLoad () {
    console.log('prepareLoad! ' + myName);
    var files = [];

    if (files.length > 0) {
        sectionLoader.addFiles('videos', files);
    }
}

// var Videos = function () {
//     console.log('hey there ' + myName);
//     this.initialized = false;
// };

function init (callback) {
    console.log('Videos: init');

    data = oblio.app.dataSrc.widgets.videos.data;

    elements = this.elements = {
        sectionWrapper: document.getElementById(myName.toLowerCase()),
        videoMenuObj: document.getElementById('playerMenu'),
        menuWrapper: document.getElementById('vid_nav_wrapper'),
        player: document.getElementById('player'),
        cookiePrefs: document.getElementById('teconsent'),
        footer: document.getElementById('footer')
    };

    // this.elements.closeBtn.addEventListener('click', function (e) {
    //     e.preventDefault();
    //     navigation.changeSection('home');
    // });

    videoInfo = [];

    for (var i = 0; i < data.videos.length; i++) {

        // false will evaluate to true if it's a string, so also make sure that it's not a string that === 'false'
        if (data.videos[i].visible && data.videos[i].visible !== 'false') {
            videoInfo.push(data.videos[i]);
            videoMenuItems.push({link: data.videos[i].videoSrc, label: data.videos[i].title});
            totalVisibleVideos ++;
        }
    }

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
        videoSrc: 'DhLFMiHwuxo',
        controls: 0,
        rel: 0,
        showinfo: 1,
        modestbranding: 1,
        pauseoverlay: 0
    };

    youtube_wrapper = elements.sectionWrapper.querySelector('.vid_wrapper');
    pause_cover = youtube_wrapper.querySelector('.pause_cover');
    play_button = playButton.create(pause_cover.querySelector('.playSvg'));

    if (typeof player !== 'undefined') {
        player.create(youtube_wrapper.querySelector('.videoplayer'), youtube_wrapper, 'youtube', playerOptions).then(function (videoPlayer) {
            playercontrols = controls.create(videoPlayer, youtube_wrapper.querySelector('.controls_wrapper'), ['play_pause', 'progress', 'fullscreen', 'volume', 'mute']);

            yt_player = videoPlayer;

            yt_player.events.subscribe('play', onPlay);
            playercontrols.events.subscribe('pause', onPause);

            vid_buttons = document.getElementById('vid_buttons');
            elements.sectionWrapper.addEventListener('click', playVideo);

            resizables.push(videoPlayer, playercontrols);
            DetailView.resize = resize;

            callback();
        }.bind(this));
    }
    
}

function startup (callbackFn) {
    var i;

    if (this.verbose) {
        console.log('Videos: startup');
    }

    var cover = document.getElementById('playerFlashCover');
    TweenLite.set(cover, {autoAlpha:1});

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

        // for (i = 0; i < vidMenu.elements.listItems.length; i++) {
        //     vidMenu.elements.listItems[i].getElementsByTagName('a')[0].rel = i;
        // }

        elements.videoMenuObj.addEventListener('click', changeVideo.bind(this));
    }

    /** show vids **/
    this.elements.vidMenuButtons = this.elements.videoMenuObj.getElementsByTagName('a');
    // for(i=0; i<this.elements.vidMenuButtons.length; i++){
    //     this.elements.vidMenuButtons[i].addEventListener('click', this.changeVideo.bind(this));
    // }

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
    resize(sectionWidth, sectionHeight, sectionTop).then(function () {
        TweenMax.to(elements.sectionWrapper, 0.75, {autoAlpha: 1, ease: Power3.easeInOut, onComplete: function () {
            if (callback) callback();
        }});

        var videoObj = videoInfo[currVidId];
        var playerVars = {
                videoSrc: String(videoObj.videoSrc),
                autoplay: 1
            };
        if (videoObj.type === 'youTube'){
            videosPlayerObj = new oblio.utils.VideoPlayerYT('youtube-player', playerVars);
        } else if (videoObj.type === 'htmlVideo'){
            videosPlayerObj = new oblio.utils.VideoPlayerHTML5('youtube-player', playerVars);
        }
        if (this.introVideo) {
            videosPlayerObj.onComplete = this.onIntroComplete;
            this.introVideo = false;
        }
        var cover = document.getElementById('playerFlashCover');
        TweenLite.to(cover, 1, {autoAlpha:0, delay:1.5});

    }.bind(this));
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

    if (videosPlayerObj) {
        videosPlayerObj.destroy();
    }

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
        videosPlayerObj.loadVideo(videoInfo[currVidId].videoSrc);
    } else {
        videosPlayerObj.destroy();
        setTimeout(this.show.bind(this), 100);
    }

    e.preventDefault();
}

function pauseVideo () {
    console.log('Videos: pauseVideo', videosPlayerObj, videosPlayerObj.pause);

    if (videosPlayerObj && videosPlayerObj.pause) {
        videosPlayerObj.pause();
    }
}

function onIntroComplete () {
    if (this.verbose) {
        console.log('Videos: onIntroComplete');
    }

    navigation.changeSection('home');
}

function resize (w, h, top) {
    if (elements === undefined) {
        return;
    }

    return new Promise (function (resolve, reject) {
        let footerHeight = elements.footer.offsetHeight;

        sectionHeight = (h - top);
        sectionWidth = w;
        sectionTop = top;

        elements.sectionWrapper.style.top = top + 'px';
        elements.sectionWrapper.style.width = w + 'px';
        elements.sectionWrapper.style.height = sectionHeight + 'px';

        let vidWidth = sectionWidth,
            vidHeight = Math.min(sectionHeight - footerHeight, sectionWidth * (9 / 16));

        elements.player.style.top = 0.35 * (sectionHeight - vidHeight) + 'px';
        elements.player.style.height = vidHeight + 'px';
        elements.player.style.width = vidWidth + 'px';
        elements.player.style.left = ((sectionWidth - vidWidth) * 0.5) + 'px';

        resolve()
    });
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
}