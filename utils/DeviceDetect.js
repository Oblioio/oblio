define([], function () {

    var exports = {},
        DeviceDetect =
        {
            isMobile: function ()
            {
                var p = navigator.platform.toLowerCase(),
                    pattern = /(iphone|ipod|android|palm|windows\sphone|blackberry)/g;

                return p.match(pattern) === null ? false : true;
            },

            searchString: function (data)
            {
                for (var i=0 ; i < data.length ; i++)
                {
                    var dataString = data[i].string;
                    this.versionSearchString = data[i].subString;

                    if (dataString.indexOf(data[i].subString) != -1)
                    {
                        return data[i].identity;
                    }
                }
            },

            searchVersion: function (dataString)
            {
                var index = dataString.indexOf(this.versionSearchString);
                if (index == -1) return;
                return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
            },

            dataBrowser:
            [
                { string: navigator.userAgent, subString: "Android",   identity: "Android" },
                { string: navigator.userAgent, subString: "Chrome",  identity: "Chrome" },
                { string: navigator.userAgent, subString: "MSIE",    identity: "Explorer" },
                { string: navigator.userAgent, subString: "Trident",    identity: "Explorer" },
                { string: navigator.userAgent, subString: "Firefox", identity: "Firefox" },
                { string: navigator.userAgent, subString: "Opera",   identity: "Opera" },
                { string: navigator.userAgent, subString: "iPod",   identity: "iPod" },
                { string: navigator.userAgent, subString: "iPad",   identity: "iPad" },
                { string: navigator.userAgent, subString: "iPhone",   identity: "iPhone" },
                { string: navigator.userAgent, subString: "Safari",  identity: "Safari" },
            ]
        };

    exports.browser = DeviceDetect.searchString(DeviceDetect.dataBrowser) || "Other";
    exports.version = DeviceDetect.searchVersion(navigator.userAgent) || DeviceDetect.searchVersion(navigator.appVersion) || "Unknown";
    exports.isIphone = exports.browser === 'iPhone';
    exports.isIpod = exports.browser === 'iPod';
    exports.isIpad = exports.browser === 'iPad';
    exports.isIOS = exports.browser === 'iPhone' || exports.browser === 'iPad' || exports.browser === 'iPod';
    exports.isAndroid = exports.browser === 'Android';
    exports.isMobile = DeviceDetect.isMobile();
    exports.isMac = navigator.appVersion.indexOf("Mac") != -1 ? true : false;
    exports.isIE = (exports.browser === 'Explorer' || exports.browser === 'MSIE')?true:false;
    exports.isIETouch = (exports.browser === 'Explorer' && navigator.userAgent.indexOf('Touch') >= 0)?true:false;
    exports.isEarlyIE = (navigator.userAgent.indexOf('MSIE 8.0') >= 0)?true:false;

    window.oblio = window.oblio || {};
    oblio.utils = oblio.utils || {};
    oblio.utils.DeviceDetect = exports;

    return oblio.utils.DeviceDetect;
});
