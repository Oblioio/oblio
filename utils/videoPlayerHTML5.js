define(function () {
	
	'use strict';
	/*jshint validthis:true*/

	function VideoPlayerHTML5 (div, parameters) {
		this.div = typeof div === 'string' ? document.getElementById(div) : div;

		this.autoplay = parameters.autoplay || 0;
		this.loop = parameters.loop || 0;
		this.controls = parameters.controls !== undefined ? parameters.controls : true;
		this.videoSrc = parameters.videoSrc;
		this.isReady = false;
		this.isAndroid = false;
		this.isiPad = false;
		this.isMobile = detectMobile.call(this);
		this.player = null;

		if (Modernizr.video.h264 === "probably") {
			this.extension = '.mp4';
		} else if (Modernizr.video.webm === "probably") {
			this.extension = '.webm';
		} else {
			this.extension = '.mp4';
		}

		//assign a unique id to the player
		this.playerID = "player_"+(new Date().getTime())+Math.round(Math.random()*999);
		
		//events
		this.onComplete = undefined;
		this.onPlaying = undefined;
		this.onPaused = undefined;

		for (var par in parameters) {
			this[par] = parameters[par];
		}
		
		if (this.videoSrc !== undefined) {
			// if the extension is included in the page, use that, otherwise use the one modernizr chose
			if (!this.videoSrc.match('.mp4')) {
				this.videoSrc = this.videoSrc + this.extension;	
			}
		}

		attachPlayer.call(this);
	}

	function detectMobile(){		
		var ua = navigator.userAgent.toLowerCase(),
			p = navigator.platform.toLowerCase();

		this.isAndroid = ua.indexOf("android") > -1;
		this.isiPad = ua.match(/ipad/i) !== null;
		
		return this.isAndroid || this.isiPad || p === 'ipad' || p === 'iphone' || p === 'ipod' || p === 'android' || p === 'palm' || p === 'windows phone' || p === 'blackberry';
	}

	function attachPlayer () {
		var that = this;

		this.autoplay = this.isMobile ? 0 : this.autoplay;
		this.isReady = false;

		this.player = document.createElement('video');
		this.player.width = this.player.height = '500px';
		this.player.id = this.playerID;
		this.player.preload = 'auto';	
		this.player.controls = this.controls;
		this.player.style.position = 'absolute';
		this.player.style.left = '0px';
		this.player.style.top = '0px';
		this.player.autoplay = this.autoplay;
		this.player.loop = this.loop;
		this.player.src = this.videoSrc;

		addListeners.call(this);

		this.div.appendChild(this.player);
	}
	
	function addListeners () {
		var events = [
			'abort',
			'canplay',
			'canplaythrough',
			'durationchange',
			'emptied',
			// 'encrypted',
			'ended',
			'error',
			'interruptbegin',
			'interruptend',
			'loadeddata',
			'loadedmetadata',
			'loadstart',
			// 'mozaudioavailable',
			'pause',
			'play',
			'playing',
			'progress',
			// 'ratechange',
			// 'seeked',
			// 'seeking',
			// 'stalled',
			// 'suspend',
			'timeupdate',
			// 'volumechange',
			// 'waiting'
		];

		for (var i = 0; i < events.length; i++) {
			this.player.addEventListener(events[i], stateChange.bind(this));
		}

	}

	function stateChange(e){

		switch(e.type){
			case 'loadedmetadata':
				if(this.onLoadedMetadata)this.onLoadedMetadata();
				break;
			case 'ended':
				if(this.onComplete)this.onComplete();
				break;
			case 'canplaythrough':
				if(this.onCanPlayThrough)this.onCanPlayThrough();
				break;
			case 'playing':
				if(this.onPlaying)this.onPlaying();
				break;
			case 'timeupdate':
				if(this.onTimeUpdate)this.onTimeUpdate();
				break;
			case 'pause':
				if(this.onPaused)this.onPaused();
				break;
			default: 
				// console.log('STATE', e);		
		}
	}	
	
	function play(){
		this.player.play();
	}
	
	function loadVideo(src){
		try {
			this.videoSrc = src;
			if (!this.videoSrc.match('.mp4')) {
				this.videoSrc += this.extension;	
			}

			this.player.pause();
			this.player.setSrc(this.videoSrc);
		} catch(e){}
	}
	
	function pause(){
		this.player.pause();
	}

	function destroy () {
		this.player.pause();

		// remove all events
		this.onComplete = undefined;
		this.onPlaying = undefined;
		this.onPaused = undefined;
		this.onBuffering = undefined;

		// remove video object
		this.player.remove();

		var container = this.div;
		if (container) {
			container.innerHTML = '';
		}

		this.player = null;				
	}

	function resize(w, h){
	}

	function bind(fn, scope){
		return function() {
			return fn.apply(scope, arguments);
		};
	}

	//public functions
	VideoPlayerHTML5.prototype.type = 'htmlVideo';
	VideoPlayerHTML5.prototype.loadVideo = loadVideo;
	VideoPlayerHTML5.prototype.play = play;
	VideoPlayerHTML5.prototype.pause = pause;
	VideoPlayerHTML5.prototype.destroy = destroy;
	VideoPlayerHTML5.prototype.resize = resize;

	window.oblio = window.oblio || {};
	oblio.utils = oblio.utils || {};
	oblio.utils.VideoPlayerHTML5 = VideoPlayerHTML5;

	return oblio.utils.VideoPlayerHTML5;

});