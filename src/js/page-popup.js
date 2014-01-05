/**
 * Pop-up page JavaScript
 *
 */

Adapter.run();

var _processRow = function($target, row) {
    var notifTexts = [],
        typeText = '';

    typeText = row.type
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, function(chars) {
            return chars.toUpperCase();
        });

    var $li = $('<li />')
        .append(
            $('<a />').addClass('card-outline')
                .attr('target', '_blank')
                .attr('href', [
                    Adapter.url,
                    '/#!rid',
                    row.room_id
                ].join(''))
                .append(
                    $('<b />').addClass('board-name')
                        .text(row.name)
                )
        )
        //.append(
        //    $('<a />').addClass('notif-read').text('X')
        //        .data('id', row.id)
        //        .attr('href', '#')
        //)

    if (0 < row.unread_num || 0 < row.mention_num) {
        notifTexts.push('Unread: <b title="Mention">' + row.mention_num + '</b>/<b title="Unread Message">' + row.unread_num + '</b> message(s)');
    }
    if (0 < row.task_num || 0 < row.mytask_num) {
        notifTexts.push('Task: <b>' + row.mytask_num + '</b>/<b>' + row.task_num + '</b> task(s)');
    }
    if (0 < notifTexts.length) {
        var $notifInfo = $('<span />')
            .addClass('notif-info')
            .html(notifTexts.join(' | '));
        $li.append($notifInfo)
    }
    $target.append($li);
};

var _notif = function(init) {
    Adapter.client.api(
        '/rooms',
        null,
        function (response) {
            var $target = $('.notifications ul');
            Adapter.log(response);
            if (init) {
                $target.empty();
            }
            for (var key in response) {
                var row = response[key];
                _processRow($target, row);
            }
            if (!response || !response.length) {
                $target.append('<li><b style="color: #d00;">You have no notifications.</b></li>');
            }
            $('.notifications').slideDown();
        }
    );
};

var _checker = function() {
    Adapter.run();
    if (Adapter.authorized()) {
        $('#authentication').hide();
        $('#notification').slideDown();

        Adapter.client.api(
            '/me',
            null,
            function(me) {
                Adapter.log(me);
                $('[data-id]').text(me.chatwork_id);
                $('[data-email]').text(me.mail);
                _notif();
            }
        );
    } else {
        $('#notification').hide();
        $('#authentication').slideDown();
    }
};

//$(document).on('click', '.notifications .notif-read', function() {
//    _readNotif($(this).data('id'));
//});

$('#share').on('click', function() {
    $('#sharer').slideToggle();
});

$('#go-notif').on('click', function() {
    chrome.tabs.create({
        url: $(this).attr('data-url') + '/notifications'
    });
});

$('#reset').on('click', function() {
    Adapter.deauthorize();
    _checker();
});

$('#save-api-token').on('click', function() {
    var token = $.trim($('#api-token').val());
    if (!token || token == "") {
        alert('Invalid Token');
        return;
    }
    ls.set('chatwork-api-token', token);
    _checker();
});

$('#deauthorize').click(function() {
    if (confirm('Do you really want to deauthorize?')) {
        Adapter.deauthorize();
        _checker();
    }
});

//if (!Adapter.authorized()) {
//    chrome.tabs.create({
//        url: window.location.origin + '/options.html?mode=authorize'
//    });
//    //chrome.tabs.create({
//    //    url: window.location.origin + '/callback.html?mode=authorize'
//    //});
//}
//else {
//}
_checker();

// Twitter
(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (!d.getElementById(id)) {
        js = d.createElement(s);
        js.id = id;
        js.src = "https://platform.twitter.com/widgets.js";
        fjs.parentNode.insertBefore(js, fjs);
    }
})(document, "script", "twitter-wjs");

// Facebook
/*
(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s);
  js.id = id;
  js.src = "https://connect.facebook.net/ja_JP/all.js";
  fjs.parentNode.insertBefore(js, fjs);
})(document, 'script', 'facebook-jssdk');

window.fbAsyncInit = function() {
    FB.init({
        appId      : '279973812102399', // App ID
        status     : true, // check login status
        cookie     : true, // enable cookies to allow the server to access the session
        xfbml      : true  // parse XFBML
    });
};
*/

// Google+
(function() {
    var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
    po.src = 'https://apis.google.com/js/plusone.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
})();
