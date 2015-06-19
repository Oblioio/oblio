;(function (root, factory) {
    // Browser globals
    root.utils = root.utils || {};

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['mediaelement/mediaelement-and-player'], function () {
            // Add to namespace
            return (root.utils.VideoPlayerME = factory());
        });
    } else {
        root.utils.VideoPlayerME = factory();
    }
}(window.oblio = window.oblio || {}, function () {
	
	function videoPlayerME(div, parameters){
		this.div = typeof div === 'string' ? document.getElementById(div) : div;		
		this.autoplay = 0;
		this.loop = false;
		this.controls = true;
		this.videoSrc = undefined;
		this.isReady = false;
		this.isMobile = false;
		this.isFlash = false;
		this.isAndroid = false;
		this.isiPad = false;

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
		this.onBuffering = undefined;
				
		detectMobile.call(this);
		
		for(var par in parameters){
			this[par] = parameters[par];
		}
		
		if (this.videoSrc !== undefined) {
			// if the extension is included in the page, use that, otherwise use the one modernizr
			if (!this.videoSrc.match('.mp4')) {
				this.videoSrc = this.videoSrc + this.extension;	
			}
		}

		addStyle();
		
		attachPlayer.call(this);
	}

	function detectMobile(){		
		var ua = navigator.userAgent.toLowerCase(),
			p = navigator.platform.toLowerCase();

		this.isAndroid = ua.indexOf("android") > -1;
		this.isiPad = ua.match(/ipad/i) != null;
		
		if( this.isAndroid || this.isiPad || p === 'ipad' || p === 'iphone' || p === 'ipod' || p === 'android' || p === 'palm' || p === 'windows phone' || p === 'blackberry'){
			this.isMobile = true;
		}

	}
	
	function addStyle(){
		try{
			var styleME = document.createElement('style');
			styleME.type = "text/css";
			styleME.innerHTML = ".me-plugin {width:100%;height:100%;}";
		
			document.body.appendChild(styleME);
		} catch(e){};
		
	}
	
	function checkForReady(){	

		if(this.isReady)return true;	
					
		var mediaElementIsEmbedded = (typeof(MediaElement) == 'undefined')?false:true;;
		var jQueryIsEmbedded = (typeof(jQuery) == 'undefined')?false:true;
		
		if(!mediaElementIsEmbedded || !jQueryIsEmbedded){			
			setTimeout( bind(checkForReady, this), 100);
			
		} else {			
			attachPlayer.call(this);
		}

	}	

	function attachPlayer(){

		var that = this;

		this.autoplay = (this.isMobile)?0:this.autoplay;
		this.isReady = false;
	
		//create the video dom element		
		var newVid = document.createElement('video');
		newVid.width = '500px';
		newVid.height = '500px';
		newVid.id = this.playerID;
		newVid.preload = 'auto';	
		newVid.controls = true;
		newVid.style.position = 'absolute';
		newVid.style.left = '0px';
		newVid.style.top = '0px';
		if(this.autoplay)newVid.autoplay = 'true';
		newVid.src = this.videoSrc;

		this.div.appendChild(newVid);

		//convert the dom element into a mediaElement.js object
		if(!this.controls)document.getElementById(this.playerID).removeAttribute("controls");
		new MediaElement(this.playerID, {
				enablePluginSmoothing: true, 
				pluginPath: 'swf/',
				success: bind(function(mediaElement) {

					that.player = mediaElement;
					that.player.loop = this.loop;

					this.isFlash = (String(mediaElement).indexOf('HTMLVideoElement') >= 0)?false:true;

					if(this.autoplay){
						// trace('this autoplay');
						if(this.isFlash){
							setTimeout(function(){
								that.player.play();
							}, 750);
						} else {
							mediaElement.play();
						}
					}
					
					mediaElement.addEventListener('loadedmetadata', bind(function(e) {
						meStateChange.call(that, {data:'loadedmetadata'});  
					}, that), false);

					mediaElement.addEventListener('ended', bind(function(e) {
						if (that.player.webkitExitFullScreen) {
							that.player.webkitExitFullScreen();
						}
						if (that.isFlash) {
							//trace(that.player.currentTime);
							that.player.setCurrentTime(0);
							that.play();
						}
						meStateChange.call(that, {data:'ended'});  
			        }, that), false);
			        
					mediaElement.addEventListener('playing', bind(function(e) {
						meStateChange.call(that, {data:'playing'});  
			        }, that), false);
			        
					mediaElement.addEventListener('pause', bind(function(e) {
						// trace('videoplayerME 152 pause');
						// trace(that.videoSrc);
						meStateChange.call(that, {data:'pause'});  
			        }, that), false);
			        
					mediaElement.addEventListener('stalled', bind(function(e) {
						// trace('stalled');
						meStateChange.call(that, {data:'buffering'});  
			        }, that), false);
			        
					mediaElement.addEventListener('waiting', bind(function(e) {
						// trace('waiting');
						meStateChange.call(that, {data:'buffering'});  
			        }, that), false);
										
					if(that.isFlash){
						meResize.call(that);
					} else {
						that.player.width = '100%';
						that.player.height = '100%';
						that.player.style.width = '100%';
						that.player.style.height = '100%';
					}

			}, that)
		});

	}
	
	function meStateChange(e){
		switch(e.data){
			case 'loadedmetadata':
				if(this.onLoadedMetadata)this.onLoadedMetadata();
				break;
			case 'ended':
				if(this.onComplete)this.onComplete();
				break;
			case 'playing':
				if(this.onPlaying)this.onPlaying();
				break;
			case 'pause':
				if(this.onPaused)this.onPaused();
				break;
			case 'buffering':
				if(this.onBuffering)this.onBuffering();
				break;			
		}
	}	
	
	function mePlay(){
		try{
			this.player.play();
			// trace('play?');
		} catch(e){};
		// trace('play');
	}
	
	function meLoadVideo(src){
		try{
			this.videoSrc = src;
			if (!this.videoSrc.match('.mp4')) {
				this.videoSrc += this.extension;	
			}

			this.player.pause();
			this.player.setSrc(this.videoSrc);
			// this.player.load(this.videoSrc);
			if (this.isFlash) {
				// trace('flash');
				setTimeout(bind(function(){
					if(!this.isMobile)this.player.play();
				}, this), 1500);
			}
			// trace(this.player);
		} catch(e){};
	}
	
	function mePause(){
		try{
			this.player.pause();		
		} catch(e){};		
	}
	
	function meDestroy(){
		try{
			// pause to be sure it there is no audio even 
			// if the player somehow persist in memory
			this.player.pause();
			
			// remove all events
			this.onComplete = undefined;
			this.onPlaying = undefined;
			this.onPaused = undefined;
			this.onBuffering = undefined;
						
			// remove video object
			this.player.remove();
			
		}catch(e){}
		
		var container = this.div;
		if(container)container.innerHTML = "";
		this.player = null;
						
	}
	
	function meResize(w, h){

		try{
			if(this.isFlash){
				var container = this.div;
				w = w || container.offsetWidth;
				h = h || container.offsetHeight;
				this.player.setVideoSize(w, h);
			}
		} catch(e){};	
	}
	
	function bind(fn, scope){
		return function() {
			return fn.apply(scope, arguments);
		}
	}

	//public functions
	videoPlayerME.prototype.type = "htmlVideo";
	videoPlayerME.prototype.loadVideo = meLoadVideo;
	videoPlayerME.prototype.play = mePlay;
	videoPlayerME.prototype.pause = mePause;
	videoPlayerME.prototype.destroy = meDestroy;
	videoPlayerME.prototype.resize = meResize;

	return videoPlayerME;
	
}));