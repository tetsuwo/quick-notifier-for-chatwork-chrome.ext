/*!
 * ChatWork - Chrome JavaScript SDK for ChatWork API v1 Preview
 *
 * Copyright 2013, Tetsuwo OISHI.
 * Dual license under the MIT license.
 * http://tetsuwo.tumblr.com
 *
 * Version: 0.0.1
 * Date: 2013-11-29
 */

function ChatWork(param) {
    this.initialize.apply(this, arguments);
}

/**
 * Initialize
 *
 * @param {object} param
 */
ChatWork.prototype.initialize = function(param) {
    this.apiBaseUrl = 'https://api.chatwork.com/v1';
    this.url = 'https://chatwork.com';
    this.name       = '_chatwork';
    this.times      = 0;
    this.requests   = [];
    this.data       = [];
    this.debug      = false;
    this.win        = document.defaultView || document.parentWindow;

    this.config = {
        apiToken: null
    };

    if (param) {
        if (param.debug) {
            this.debug = param.debug;
        }
        if (param.apiKey) {
            this.config.apiToken = param.apiToken;
        }
    }

    this.log(param);
};

/**
 * Set API Token
 *
 * @param {string} apiToken
 */
ChatWork.prototype.setApiToken = function(apiToken) {
    this.config.apiToken = apiToken;
    return this;
};

/**
 * Logging
 *
 */
ChatWork.prototype.log = function() {
    if (this.debug) {
        console.log(arguments);
    }
};

/**
 * Serialize parameters
 *
 * @param {object} param
 * @param {string} prefix
 */
ChatWork.prototype.serialize = function(param, prefix) {
    var query = [];
    for (var p in param) {
        var k = prefix ? prefix + '[' + p + ']' : p, v = param[p];
        query.push(
            typeof v == 'object' ?
                this.serialize(v, k) :
                encodeURIComponent(k) + '=' + encodeURIComponent(v)
        );
    }
    return query.join('&');
};

/**
 * API Caller
 *
 * @param {string} method
 * @param {object} param
 * @param {function} callback
 */
ChatWork.prototype.api = function(method, param, callback) {
    var endpoint = this.apiBaseUrl + method;
    try {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var response = JSON.parse(xhr.responseText);
                callback(response);
            }
        };
        xhr.open('GET', endpoint);
        xhr.setRequestHeader('X-ChatWorkToken', this.config.apiToken);
        xhr.send();
    } catch (ex) {
        this.log('xhr.exception', ex);
    }
    return this;
};
