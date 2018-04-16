import {player as player_html} from './players/player_html';
import {player as player_youtube} from './players/player_youtube';
import {player as player_vimeo} from './players/player_vimeo';
import {events} from 'OblioUtils/utils/pubsub.js';

export var player = {

    create: function (vid, wrapper, type, options) {

        var player_obj = ((type) =>  { 
            switch (type) {
                case 'html':
                    return player_html;
                case 'youtube':
                    return player_youtube;
                case 'vimeo':
                    return player_vimeo;
                default:
                return false;
            };
        })(type);

        var instance = Object.assign(Object.create(player_obj.proto), {
            wrapper: wrapper,
            video_el: vid,
            cover: document.createElement('div'),
            options: options,
            events: Object.create(events.getInstance())
        });

        instance.cover.className = 'cover';
        instance.wrapper.insertBefore(instance.cover, wrapper.querySelector('.controls_wrapper'));

        return player_obj.load.call(instance);
    }
}