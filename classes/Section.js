define([
        'mustache'
    ],
    function (Mustache) {

        var myName,
            that,
            data;

        function Section() {
            console.log('hey there ' + myName);
            this.initialized = false;
            this.verbose = true;
        }

        function init (callback) {
        }

        function placeHTML (wrapperId) {
            var wrapper = document.getElementById(wrapperId);

            var content = oblio.app.dataSrc.sections[wrapperId].data;

                content.slugify = function () {
                    return function (text, render) {
                        return render(text)
                            .toLowerCase()
                            .replace(/[^\w ]+/g,'')
                            .replace(/ +/g,'_')
                            ;
                    };
                };

            var template = oblio.utils.SectionLoader.returnSectionOBJ(wrapperId).template,
                html = Mustache.render(template, content);

            wrapper.innerHTML = html;
        }

        function resize (w, h) {
            if (this.backplate) {
                this.backplate.resize();
            }
        }

        // function startup (callbackFn) {
        //     if (callbackFn) {
        //         callbackFn();
        //     } else {
        //         if (this.verbose) console.log('Section startup', 'no callbackFn');
        //     }
        // }

        // function show (callbackFn) {
        //     if (callbackFn) {
        //         callbackFn();
        //     } else {
        //         if (this.verbose) console.log('Section show', 'no callbackFn');
        //     }
        // }

        // function shutdown (callbackFn) {
        //     if (callbackFn) {
        //         callbackFn();
        //     } else {
        //         if (this.verbose) console.log('Section shutdown', 'no callbackFn');
        //     }
        // }

        function keyHandler (e) {
        }

        function touchStart (e) {
        }

        function touchEnd (e) {
        }

        function touchMove (e) {
        }

        function mousewheelHandler (e) {
        }

        Section.prototype.init = init;
        Section.prototype.resize = resize;
        Section.prototype.keyHandler = keyHandler;

        /**
        * TODO: I think we might want to add startup shutdown show hide, 
        * and maybe add & remove to section base class and remove it from nav class
        */
        // Section.prototype.startup = startup;
        // Section.prototype.show = show;
        // Section.prototype.shutdown = shutdown;

        Section.prototype.touchStartHandler = touchStart;
        Section.prototype.touchEndHandler = touchEnd;
        Section.prototype.touchMoveHandler = touchMove;
        Section.prototype.mousewheelHandler = mousewheelHandler;
        Section.prototype.placeHTML = placeHTML;

        window.oblio = window.oblio || {};
        oblio.classes = oblio.classes || {};
        oblio.classes.Section = Section;

        return oblio.classes.Section;
});
