/*!
 * Adapter
 *
 * Copyright 2013-2014, Tetsuwo OISHI.
 * Dual license under the MIT license.
 * http://tetsuwo.tumblr.com
 *
 * Date: 2013-12-03
 */

var Adapter = {};

(function(obj) {
    obj.client    = null;
    obj.url       = 'https://www.chatwork.com';
    obj.toolbar   = chrome.browserAction;
    obj.timer     = 15 * 1000;
    obj.prevCount = null;
    obj.responses = {};
    obj.logCount  = 0;

    obj.authorized = function() {
        var apiTokenString = ls.get('chatwork-api-token');
        return apiTokenString !== false;
    };

    obj.authorize = function() {
        return true;
    };

    obj.deauthorize = function() {
        ls.rm('chatwork-api-token');
        return true;
    };

    obj.getColor = function(type) {
        switch (type.toUpperCase()) {
            case 'ALERT':
                return [203, 77, 77, 255];
            case 'CLEAR':
                return [52, 178, 125, 255];
            default:
                return [66, 66, 66, 255];
        }
    };

    obj.setColor = function(type) {
        this.toolbar.setBadgeBackgroundColor({
            color: obj.getColor(type)
        });
    };

    obj.setText = function(val) {
        this.toolbar.setBadgeText({
            text: String(val)
        });
    };

    obj.log = function() {
        if (this.logCount % 10 === 0) {
            console.clear();
        }
        console.log(arguments);
        this.logCount++;
    };

    obj.process = function() {
        obj.run();
        var that = obj;
        obj.client.api('/my/status', null, function(response) {
            obj.log('run.response = ', response, that.prevCount != response.unread_num);
            if (that.prevCount != response.unread_num) {
                that.prevCount = response.unread_num;
                that.setColor(response.unread_num === 0 ? 'CLEAR' : 'ALERT');
                that.setText(response.unread_num);
            }
            that.startTimer();
        });
    };

    obj.setResponse = function(key, val) {
        obj.responses[key] = val;
    };

    obj.startTimer = function() {
        window.setTimeout(obj.process, this.timer);
    };

    obj.run = function(init) {
        obj.client = new ChatWork();
        if (this.authorized()) {
            obj.client.setApiToken(ls.get('chatwork-api-token'));
        }
        if (init) {
            this.setColor('ALERT');
            this.setText('!');
            this.process();
        }
    };
})(Adapter);
