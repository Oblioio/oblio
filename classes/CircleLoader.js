'use strict';

var CircleLoader = function () {

    this.id = "CircleLoader";

    this.elem = createElem();
    this.tt = document.getElementById('loader_tt');
    document.body.appendChild(this.elem);

    this.progressCircle = createCircle();
    this.elem.appendChild(this.progressCircle);
    this.circ = this.progressCircle.querySelector('circle');
    this.loaderText_before = '';
    this.loaderText_after = '%';
    this.loaderText = document.createElement('h2');
    this.loaderText.id = 'loaderText';
    this.elem.appendChild(this.loaderText);

    // this.tt = document.getElementById('load_tt');

    this.elem.style.display = 'block';
    this.elem.style.visibility = 'hidden';
};

function createElem(){
    var elem = document.createElement('div');
    elem.id = 'circle_loader';

    return elem;
}

function createCircle(){
    var loaderCircle = document.createElement('div');
    var svg = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="201px" height="201px" viewBox="0 0 201 201"><circle cx="100.5" cy="100.5" r="100" stroke-dasharray="628, 628"/></svg>';
    
    loaderCircle.id = 'loader_circle';
    loaderCircle.innerHTML = svg;

    return loaderCircle;
}

function goOut (isOut) {
    let tl = new TimelineMax({
        paused: true,
        onComplete: function () {
            // this.tt.style.display = 'none';
            this.elem.style.display = 'none';
            isOut();
        }.bind(this)
    });

    this.tt.style.opacity = 0;

    // tl.to(this.tt, 0.5, {alpha: 0}, 0);
    tl.to(this.elem, 0.5, {alpha: 0}, 0);

    tl.play();
}

function bringIn (isIn) {
    onProgress.call(this, 0);
    this.tt.style.opacity = 1;

    let tl = new TimelineMax({
        paused: true,
        onComplete: function () {
            isIn();
        }.bind(this)
    });

    // this.tt.style.display = 'block';
    this.elem.style.display = 'block';

    // tl.to(this.tt, 0.5, {alpha: 1}, 0);
    tl.to(this.elem, 0.5, {autoAlpha: 1}, 0);

    tl.play();
}

function onProgress (perc) {
    this.loaderText.textContent = Math.round(perc * 100);
    this.circ.style.strokeDashoffset = ((1 - perc) * 628);
    return perc >= 1;
}

function resize () {

}

CircleLoader.prototype.resize = resize;
CircleLoader.prototype.onProgress = onProgress;
CircleLoader.prototype.goOut = goOut;
CircleLoader.prototype.bringIn = bringIn;

export { CircleLoader };