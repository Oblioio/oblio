define([], function () {

    function videoPlayerYT(div, parameters){

        this.div = typeof div === 'string' ? document.getElementById(div) : div;       
        this.autoplay = parameters.autoplay || 0;
        this.color = parameters.color || 'red';
        this.showinfo = parameters.showinfo || 1;
        this.controls = parameters.controls || 1;
        this.videoSrc = parameters.videoSrc || undefined;
        this.isReady = parameters.isReady || false;
        this.isMobile = parameters.isMobile || false;
        this.relatedVideos = parameters.relatedVideos || 0;
        this.modestbranding = parameters.modestbranding || 1;
        this.relatedVideos = parameters.relatedVideos || 0;

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

            if (percent >= this.nextPercentage) {
                app.trackEvent('Video Completion', this.title, this.nextPercentage + '% complete');

                while (this.nextPercentage <= percent) {
                    this.nextPercentage += 10;
                }
            }
        }

    }
    
    function detectMobile(){        
        var ua = navigator.userAgent.toLowerCase();
        var isAndroid = ua.indexOf("android") > -1;
        var isiPad = navigator.userAgent.match(/iPad/i) !== null;
        var p = navigator.platform.toLowerCase();
        if( isAndroid || isiPad || p === 'ipad' || p === 'iphone' || p === 'ipod' || p === 'android' || p === 'palm' || p === 'windows phone' || p === 'blackberry'){
            this.isMobile = true;
        }
    }
    
    function checkForReady(){       
        if(this.isReady)return true;    
                    
        if(typeof(YT) == 'undefined' || typeof(YT.Player) == 'undefined'){          
            setTimeout(checkForReady.bind(this), 100);

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
                'enablejsapi': this.enablejsapi,
                'color': this.color, // this is red or white -- turning it to white disables modestbranding:1
                'showinfo': this.showinfo, // this.showinfo,
                'controls': this.controls,
                'wmode': 'transparent', // fixes z-index problem in ie8
                'rel': this.relatedVideos, // hide end screen of related videos,
                'modestbranding': this.modestbranding
            },
            events: {
                'onStateChange': ytStateChange.bind(this),
                'onError': ytError.bind(this)
            }
        });
    }

    function ytError (e) {
        switch(e.data){
            case 2:
                // The request contains an invalid parameter value. For example, this error occurs if you specify a video ID that does not have 11 characters, or if the video ID contains invalid characters, such as exclamation points or asterisks.
                console.error('INVALID PARAMETER VALUE');
                break;
            case 5:
                // The requested content cannot be played in an HTML5 player or another error related to the HTML5 player has occurred.
                console.error('The requested content cannot be played in an HTML5 player');
                break;
            case 100:
                // The video requested was not found. This error occurs when a video has been removed (for any reason) or has been marked as private.
                console.error('The video requested was not found.');
                break;
            case 101:
                // The owner of the requested video does not allow it to be played in embedded players.
            case 150:
                // same as 101
                console.error('The owner of the requested video does not allow it to be played in embedded players.');
                break;
            default:          
        }
        if(this.onError)this.onError(e);
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
        } catch(e){}
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
        } catch(e){}
    }
    
    function ytPause(){
        try{
            this.player.pauseVideo();       
        } catch(e){}     
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
        } catch(e){}
    }
    
    function ytResize(w, h){
    }

    //public functions
    videoPlayerYT.prototype.type = "youTube";
    videoPlayerYT.prototype.loadVideo = ytLoadVideo;
    videoPlayerYT.prototype.play = ytPlay;
    videoPlayerYT.prototype.pause = ytPause;
    videoPlayerYT.prototype.destroy = ytDestroy;
    videoPlayerYT.prototype.resize = ytResize;

    window.oblio = window.oblio || {};
    oblio.utils = oblio.utils || {};
    oblio.utils.VideoPlayerYT = videoPlayerYT;

    return oblio.utils.VideoPlayerYT;
});