;(function (root, factory) {
    // Browser globals
    root.utils = root.utils || {};

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], function () {
            // Add to namespace
            return (root.utils.VideoPlayerYT = factory());
        });
    } else {
        root.utils.VideoPlayerYT = factory();
    }
}(window.oblio = window.oblio || {}, function () {

    function videoPlayerYT(div, parameters){

        this.div = typeof div === 'string' ? document.getElementById(div) : div;       
        this.autoplay = 0;
        this.color = 'white';
        this.showinfo = 0;
        this.controls = 1;
        this.videoSrc = undefined;
        this.isReady = false;
        this.isMobile = false;

        if (parameters.tracking === true) {
            // stuff for sending tracking events to ga
            this.tracking = true;
            this.playerDiv = this.div;
            this.videoTitle = parameters.title;
            this.duration = null;
            this.nextPercentage = 10;
            this.progressInterval = true;
            this.progressInterval = setInterval(checkProgress.bind(this), 1000);
        }
 
        //events
        this.onComplete = undefined;
        this.onPlaying = undefined;
        this.onPaused = undefined;
        this.onBuffering = undefined;
        
        detectMobile.call(this);
        
        for(var par in parameters){
            if (parameters.hasOwnProperty(par)) {
                this[par] = parameters[par];
            }
        }

        if(typeof(YT) == 'undefined'){
            var ytScript = document.createElement('script');
            ytScript.type = 'text/javascript';
            ytScript.src = 'https://www.youtube.com/iframe_api';
            document.body.appendChild(ytScript);
            
            checkForReady.call(this);
        
        } else if(typeof(YT.Player) == 'undefined'){
                        
            checkForReady.call(this);           
        } else {
            
            attachPlayer.call(this);
        }
        
    }

    function checkProgress() {

        if (this.duration === null || this.duration === 0) {
            this.duration = this.player.getDuration();
            return;
        } else {
            var current_time = this.player.getCurrentTime(),
                percent = Math.ceil(current_time/this.duration * 100); //calculate % complete

            // trace(this.duration);
            // trace(current_time);
            // trace(percent);

            if (percent >= this.nextPercentage) {
                app.trackEvent('Video Completion', this.title, this.nextPercentage + '% complete');

                while (this.nextPercentage <= percent) {
                    this.nextPercentage += 10;
                }
            }

            // if (percent === 100) {
            //     window.clearInterval(this.progressInterval);
            // }
        }

    }
    
    function detectMobile(){        
        var ua = navigator.userAgent.toLowerCase();
        isAndroid = ua.indexOf("android") > -1;
        isiPad = navigator.userAgent.match(/iPad/i) != null;
        var p = navigator.platform.toLowerCase();
        if( isAndroid || isiPad || p === 'ipad' || p === 'iphone' || p === 'ipod' || p === 'android' || p === 'palm' || p === 'windows phone' || p === 'blackberry'){
            this.isMobile = true;
        }
    }
    
    function checkForReady(){       
        if(this.isReady)return true;    
                    
        if(typeof(YT) == 'undefined' || typeof(YT.Player) == 'undefined'){          
            setTimeout( bind(checkForReady, this), 100);

        } else {            
            attachPlayer.call(this);
        }
        
    }   
    
    function attachPlayer(){
        var height = oblio.settings.isIpad ? '95%' : '100%';

        this.autoplay = (this.isMobile)?0:this.autoplay;
        this.isReady = false;
        this.player = new YT.Player(this.div, {
            height: height,
            width: '100%',
            videoId: this.videoSrc,
            playerVars: { 
                'autoplay': this.autoplay,
                'enablejsapi': 1,
                'color': this.color,
                'showinfo': this.showinfo,
                'controls': this.controls,
                'wmode': 'transparent', // fixes z-index problem in ie8
                'rel': 0 // hide end screen of related videos
            },
            events: {
                'onStateChange': bind(ytStateChange, this)
            }
        });
    }
    
    function ytStateChange(e){
        switch(e.data){
            case YT.PlayerState.ENDED:
                if(this.onComplete)this.onComplete();
                break;
            case YT.PlayerState.PLAYING:
                if(this.onPlaying)this.onPlaying();
                break;
            case YT.PlayerState.PAUSED:
                if(this.onPaused)this.onPaused();
                break;
            case YT.PlayerState.BUFFERING:
                if(this.onBuffering)this.onBuffering();
                break;          
        }
    }   
    
    function ytPlay(){
        try{
            this.player.playVideo();
        } catch(e){};
    }
    
    function ytLoadVideo(src){
                
        try{
            if(this.isMobile){
                this.player.destroy();
                this.videoSrc = src;
                attachPlayer.call(this);
            } else {
                this.player.loadVideoById(src);
            }
        } catch(e){};   
    }
    
    function ytPause(){
        try{
            this.player.pauseVideo();       
        } catch(e){};       
    }
    
    function ytDestroy(){
        try{
            if (this.progressInterval) {
                window.clearInterval(this.progressInterval);
                this.progressInterval = null;
                this.nextPercentage = 10;
            }
            //null vars that point to objects
            this.onComplete = undefined;
            this.onPlaying = undefined;
            this.onPaused = undefined;
            this.onBuffering = undefined;
            
            this.player.destroy();  
            this.div.innerHTML = "";
            this.player = null;         
        } catch(e){};   
    }
    
    function ytResize(w, h){
    }
    
    function bind(fn, scope){
        return function() {
            return fn.apply(scope, arguments);
        }
    }

    //public functions
    videoPlayerYT.prototype.type = "youTube";
    videoPlayerYT.prototype.loadVideo = ytLoadVideo;
    videoPlayerYT.prototype.play = ytPlay;
    videoPlayerYT.prototype.pause = ytPause;
    videoPlayerYT.prototype.destroy = ytDestroy;
    videoPlayerYT.prototype.resize = ytResize;

    return videoPlayerYT;
}));