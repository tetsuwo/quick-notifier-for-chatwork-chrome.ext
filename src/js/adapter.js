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

// Event handlers for the various notification events
function notifClosed(notID, bByUser) {
    console.log("The notification '" + notID + "' was closed" + (bByUser ? " by the user" : ""));
}

function notifClicked(notID) {
    console.log("The notification '" + notID + "' was clicked");
}

function notifButtonClicked(notID, iBtn) {
    console.log("The notification '" + notID + "' had button " + iBtn + " clicked");
}

// set up the event listeners
chrome.notifications.onClosed.addListener(notifClosed);
chrome.notifications.onClicked.addListener(notifClicked);
chrome.notifications.onButtonClicked.addListener(notifButtonClicked);

(function(obj) {
    obj.client    = null;
    obj.url       = 'https://www.chatwork.com';
    obj.toolbar   = chrome.browserAction;
    obj.timer     = 15 * 1000;
    obj.prevCount = null;
    obj.responses = {};
    obj.logCount  = 0;
    obj.idPrefix  = 'qn-cw_';

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
        switch (type) {
            case 'ALERT':
                return [200, 0, 0, 255];
            //case 'CLEAR':
            //    return [66, 178, 125, 255];
            default:
                return [150, 150, 150, 255];
        }
    };

    obj.generateId = function(prefix) {
        return prefix + String((new Date()).getTime());
    };

    obj.notify = function(title, message) {
        var id = this.generateId(this.idPrefix);
        var options = {
            type: 'basic',
            iconUrl: 'images/chatwork-logo_colorful.png',
            title: title,
            message: message
        };
        var callback = function (response) {
            console.log('created notify id =', response);
        };

        chrome.notifications.create(id, options, callback);
    };

    obj.setColor = function(type) {
        this.toolbar.setBadgeBackgroundColor({
            color: obj.getColor(type)
        });
    };

    obj.setIcon = function(type) {
        var iconPath = 'images/chatwork-logo_grayscale.png';
        if (type === 'ALERT') {
            iconPath = 'images/chatwork-logo_colorful.png';
        }
        this.toolbar.setIcon({ path: iconPath });
    };

    obj.setText = function(val) {
        this.toolbar.setBadgeText({
            text: String(val)
        });
    };

    obj.handleToolbar = function (type) {
        this.setColor(type);
        this.setIcon(type);
        if (type === 'ALERT') {
            this.notify(
                'ChatWork Notifications',
                'It may to exists unread post(s).'
            );
        }
    };

    obj.log = function() {
        if (this.logCount % 10 === 0) {
            console.clear();
        }
        console.log(arguments);
        this.logCount++;
    };

    obj.process = function() {
        obj.log('start process');
        obj.run();
        var that = obj;
        obj.client.api('/my/status', null, function(response) {
            obj.log('run.response = ', response, that.prevCount != response.unread_num);
            if (that.prevCount != response.unread_num) {
                var type = response.unread_num === 0 ? 'CLEAR' : 'ALERT';
                that.prevCount = response.unread_num;
                that.handleToolbar(type);
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
            this.setText('E');
            this.process();
        }
    };
})(Adapter);
