// UMD (Universal Module Definition) patterns for JavaScript modules that work everywhere.
// https://github.com/umdjs/umd/blob/master/amdWebGlobal.js

;(function (root, factory) {
    // Browser globals
    root.classes = root.classes || {};

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], function () {
            return (root.classes.Quotes = factory());
        });
    } else {
        root.classes.Quotes = factory();
    }
}(window.oblio = window.oblio || {}, function () {

    var quoteDuration = 11000;

    var Quotes = function (data) {

        var that = this,
            quotes = data.quotes || [];

        this.elements = {
            el: data.wrapper,
            list_el: document.createElement('ul')
        };

        this.addQuotes(quotes);
        this.elements.list_el.children[0].className += ' active';
        this.elements.el.appendChild(this.elements.list_el);
    }

    function addQuotes (quotes) {
        var quote_el;

        for (var i = quotes.length - 1; i >= 0; i--) {

            if (quotes[i].visible === false) {
                continue;
            }

            switch (quotes[i].type) {
                case 'twitter':
                    quote_el = this._getTwitterQuote(quotes[i]);
                    break;
                case 'standard':
                default:
                    quote_el = this._getStandardQuote(quotes[i]);

            }

            this.elements.list_el.appendChild(quote_el);
        };
    }

    function nextQuote () {
        var curr_index = $(this.elements.el).find('.active').eq(0).index();

        next_index = curr_index + 1 >= this.elements.list_el.children.length ? 0 : curr_index + 1;
        
        this.elements.list_el.children[curr_index].className = this.elements.list_el.children[curr_index].className.replace('active', '');
        this.elements.list_el.children[next_index].className = this.elements.list_el.children[next_index].className + ' active';
    }

    function getStandardQuote (quote) {
        var li = document.createElement('li'),
            html = '';

        li.className = 'quote standard';

        var fontSize = false;
        if (quote['font-size']) {
            fontSize = quote['font-size'];
        }

        var lineHeight = false;
        if (quote['line-height']) {
            lineHeight = quote['line-height'];
        }

        html += '<p class="content">';
        if (fontSize) {
            if (lineHeight) {
                html += '<span style="display: inline-block; font-size:' + fontSize + '; line-height: ' + lineHeight + ';">';
            } else {
                html += '<span style="font-size:' + fontSize + '; line-height: 1.1em;">';
            }
        }
            html += quote.content;
        if (fontSize) { html += '</span>'; }
        html += '</p>';

        if (quote.author || quote.source) {
            html += '<p class="author">';

            if (quote.author) {
                html += quote.author;
            }

            if (quote.source) {
                html += ' <span class="source">' + quote.source + '</span>';
            }

            html += '</p>';
        }

        li.innerHTML = html;

        return li;
    }

    function parseTweet (tweet) {
        var parsed_tweet,
            link_pattern = /(https?:\/\/([-\w\.]+)+(\/([\w\/_\.]*(\?\S+)?(#\S+)?)?)?)/g,
            at_pattern = /@(\w+)/g,
            hash_pattern = /(^|\s)#([a-z\d][\w-]*)/ig; // if hashtag is at the beginning, or preceded by a space so we don't link hashes in urls

        parsed_tweet = tweet.replace(link_pattern, '<a href="$1" target="_blank">$1</a>');
        parsed_tweet = parsed_tweet.replace(at_pattern, '<a href="http://twitter.com/$1" target="_blank">@$1</a>');
        parsed_tweet = parsed_tweet.replace(hash_pattern, '<a href="http://twitter.com/hashtag/$2/?src=hash" target="_blank">$1#$2</a>');

        return parsed_tweet;
    }

    function getTwitterQuote (quote) {
        var li = document.createElement('li'),
            html = '';

        li.className = 'quote twitter';

        html += '<div class="twitter-header">';

            // profile name
            html +='<a class="profile_link" href="' + quote.profile_url + '" target="_blank" title="View Twitter Profile">';
                html += '<img width="24" height="24" class="twitter_icon" src="img/twitter/twitter_icon.png" />';
                html += '<img width="24" height="24" class="profile_img" src="' + quote.profile_img + '" />';
                html += '<span class="twitter_fn">' + quote.author + '</span>';
                html += '<span class="twitter_un"> @' + quote.profile_username + '</span>';
            html += '</a>';

            // date
            html += '<a class="twitter_date" href="' + quote.profile_url + '/status/' + quote.tweet_id + '" target="_blank" title="View Tweet"> ';
                html += ' ' + oblio.utils.parseTwitterDate(quote.date);
            html += '</a>';
        html += '</div>';
        html += '<p class="content">' + parseTweet(quote.content) + '</p>';
        html += '<div class="twitter-footer">';
            html += '<a class="reply" href="https://twitter.com/intent/tweet?in_reply_to=' + quote.tweet_id + '" target="_blank" title="Reply">Reply</a>';
            html += '<a class="retweet" href="https://twitter.com/intent/retweet?tweet_id=' + quote.tweet_id + '" target="_blank" title="Retweet">Retweet</a>';
            html += '<a class="favorite" href="https://twitter.com/intent/favorite?tweet_id=' + quote.tweet_id + '" target="_blank" title="Favorite">Favorite</a>';
        html += '</div>';

        li.innerHTML = html;

        return li;
    }

    function startRotating () {
      this.interval = window.setInterval(this._nextQuote.bind(this), quoteDuration);
    }

    function stopRotating () {
        window.clearInterval(this.interval);
    }

    // set number of visible thumbs
    function resize (tt_top) {
        this.elements.el.style.paddingLeft = oblio.settings.menu_width + 'px';
        this.elements.el.style.paddingRight = oblio.settings.menu_width + 'px';

        var quotes_height = $('.quote').height(),
            padding_top = Math.min(tt_top - (quotes_height + 30), oblio.settings.window_dimensions.height / 2 - quotes_height / 2);
        this.elements.el.style.paddingTop = padding_top + 'px';
        // console.log($('.quote').height());
    }

    Quotes.prototype._getStandardQuote = getStandardQuote;
    Quotes.prototype._getTwitterQuote = getTwitterQuote;
    Quotes.prototype._nextQuote = nextQuote;
    
    Quotes.prototype.startRotating = startRotating;
    Quotes.prototype.stopRotating = stopRotating;
    Quotes.prototype.addQuotes = addQuotes;
    Quotes.prototype.resize = resize;

    return Quotes;
}));