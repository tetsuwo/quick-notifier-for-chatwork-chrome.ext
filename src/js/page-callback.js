TrelloChecker.run();

var updateLoggedIn = function() {
    var isLoggedIn = Trello.authorized();
    $('#authorize').attr('disabled', isLoggedIn);
    $('#deauthorize').attr('disabled', !isLoggedIn);
};
updateLoggedIn();

var onAuthorizeError = function(response) {
    console.log(response);
    updateLoggedIn();
};

// get token
var token = window.location.href.match(/[0-9a-f]{64}/),
    hasToken = token && token.length === 64;

var options = {
    name: 'Quick-Notifier for Trello',
    scope: {
        account: true,
        write: true,
        read: true
    },
    expiration: 'never',
    error: onAuthorizeError
};

options.success = function() {
    if (Trello.authorized()) {
        localStorage.token = token;
        chrome.extension.getBackgroundPage().TrelloChecker.getCount();
        updateLoggedIn();
        window.close();
    }
};

if (hasToken) {
    console.log('has token');
    options.interactive = false;
    Trello.authorize(options);
} else if (window.location.href.indexOf('mode=authorize') > -1) {
    console.log('authorize');
    Trello.authorize(options);
}

$('#authorize').click(function() {
    Trello.authorize(options);
});

$('#deauthorize').click(function() {
    Trello.deauthorize();
});
