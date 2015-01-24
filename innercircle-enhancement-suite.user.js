// ==UserScript==
// @name         InnerCircle Enhancement Suite
// @namespace    http://jeltelagendijk.nl
// @version      0.1
// @description  Adds functionalities to InnerCircle
// @author       j3lte
// @match        https://www.theinnercircle.co/*
// @include      https://www.theinnercircle.co/*
// @grant        none
// ==/UserScript==

function ic_FunctionWrapper() {
    // DEFINE $IC
    var win = window;
    var $ic;

    if (typeof unsafeWindow != 'undefined') win = unsafeWindow;
    if (typeof unsafeWindow == 'undefined' ) $ic = jQuery;
    else $ic = unsafeWindow.jQuery || jQuery;

    var $body = $ic('body');

    if (!win.console) {
        win.console = {
            log : function(){}
        };
    }

    // ADD CSS
    var css = "#userBox {width: 158px; z-index:10000; padding: 2px; border: 1px solid #0099B0;position: fixed;left: 10px;top: 111px;font-size: 10px;background: #fff;}\n";
    css    += "#userBox .profile_field { border: 0px solid #000; padding: 0px; line-height: 11px; clear: both; }\n";
    css    += "#userBox .job_title { clear: both; color: #666; padding-bottom: 0; font-size: 10px; line-height: 11px; white-space: nowrap; overflow: hidden; border-top: 1px solid #CCC; border-bottom: 1px solid #CCC;}\n";
    css    += "#userBox #user_photos { display: block; width: 158px; min-width: 1px; margin: 3px 0 3px 2px; }\n";
    css    += "#userBox .rsTmb { width: 50px; margin: 0 2px 2px 0; }\n";
    css    += ".close-user-box { cursor: pointer; }\n";
    css    += ".google-link {position: absolute;background: rgba(255,255,255,0.3);left: 0;bottom: 0;width: 100%;text-align: center;color: #000;font-size: 10px;text-decoration: none;}";

    if (typeof GM_addStyle != "undefined") {
        GM_addStyle(css);
    } else if (typeof PRO_addStyle != "undefined") {
        PRO_addStyle(css);
    } else if (typeof addStyle != "undefined") {
        addStyle(css);
    } else {
        var node = document.createElement("style");
        node.type = "text/css";
        node.appendChild(document.createTextNode(css));
        var heads = document.getElementsByTagName("head");
        if (heads.length > 0) {
            heads[0].appendChild(node);
        } else {
            // no head yet, stick it whereever
            document.documentElement.appendChild(node);
        }
    }

    var $memBox = $ic('<div />');

    var $userBox = $ic('<div id="userBox" style="display: none;" />');
    $body.append($userBox);

    var $loader = $ic('<div id="loader" style="opacity: 0.6; z-index: 10000; display: none; position: fixed; right: 20px;bottom: 0; width: 240px; height: 16px; background: #0099B0;text-align: center; color: #FFF; padding: 5px 0;"></div>');
    $body.append($loader);

    function showLoader(message) {
        $loader.text(message);
        if ($loader.is(':hidden')) {
            $loader.show();
        }
    }

    function hideLoader() {
        if (!$loader.is(':hidden')) {
            $loader.hide();
        }
    }

    var memLinkRegEx = /(http|https):\/\/www\.theinnercircle\.co\/member\/\d+/;
    var timer, ev, link, userBoxes  = {};

    function loadMember(link) {
        showLoader('Loading member...');
        $memBox.load(link, function(){
            //callback after your data is in loaded into body.
            var userName = $memBox.find('.username').parent();
            var jobTitle = $memBox.find('.job_title');
            var thumbs = $memBox.find('#user_photos');
            var profileFields = $memBox.find('.profile_field');

            $userBox.html('');
            $userBox.append(userName);
            $userBox.append(jobTitle);
            if (thumbs.find('.rsImg').length) {

                var h = Math.round(thumbs.find('.rsImg').length / 3) * 50;
                thumbs.css('height', h + 'px');

                thumbs.find('.rsImg').each(function (i){
                    if ($ic(this).data('rsbigimg')) {
                        $ic(this).attr('href', $ic(this).data('rsbigimg'));
                    }
                    $ic(this).attr('target',"_blank");
                });

                $userBox.append(thumbs);
            }
            $userBox.append(profileFields);
            $userBox.append('<span class="ui-button-icon-primary ui-icon ui-icon-closethick close-user-box" style="position: absolute; top: 0; right: 0;"></span>');

            userBoxes[link] = $userBox.html();
            link = null;

            hideLoader();
            $userBox.fadeIn(500);

            win.console.log('[IC Enhancement Suite] :: User shown');
        });
    }

    $body.on('mouseover', 'a', function(event) {
        ev = event;
        // Only set timer if it has a target link, matches a member and is not equal to current member
        if (ev.currentTarget && ev.currentTarget.href && memLinkRegEx.test(ev.currentTarget.href) && (ev.currentTarget.href !== win.location.href) && ev.currentTarget.href.indexOf('#') === -1) {

            link = ev.currentTarget.href;

            if (typeof(userBoxes[link]) !== 'undefined' && userBoxes[link] !== null) {

                $userBox.html(userBoxes[link]);
                $userBox.show();

            } else {
                showLoader('Loading member in 7s...');
                timer = win.setTimeout(function() {
                    // Execute when timer reached
                    win.console.log('[IC Enhancement Suite] :: Loading user : ' + link);
                    loadMember(link);

                    timer = null;
                    ev = null;

                }, 7000);

            }
        }
    });

    $body.on('mouseout', 'a', function(event) {
        if (timer) {
            win.clearTimeout(timer);
            ev = null;
        }
        hideLoader();
    });

    // Hide top question
    //$ic('.nearby-block.question').hide();

    function open_new() {
        $ic(this).target = "_blank";
        if ($ic(this).prop('href')) {
            win.open($ic(this).prop('href'));
        } else if ($ic(this).prop('src')) {
            win.open($ic(this).prop('src'));
        }
        if (timer) {
            win.clearTimeout(timer);
            ev = null;
        }
        return false;
    }

    // Open online members in new tab/window
    $body.on('click', '.online_box a', open_new);

    // Open featured in new tab/window
    $body.on('click','.featured_box a', open_new);

    // Userbox clicks
    $body.on('click', '#userBox .username', open_new);
    $body.on('click','.close-user-box', function() { $userBox.hide(); });

    // Open interest in new tab/window
    $body.on('click','.interest_box a', open_new);

    // Remove match box if there are no matches
    if ($('.potential_match .match-last').length) {
        console.log('[IC Enhancement Suite] :: No matches, hiding box');
        $ic('.potential_match').hide();
    }

    // Open fancybox images originals
    $body.on('click','.fancybox-image', open_new);

    $body.on('mouseover', '.fancybox-image', function(event) {
        ev = event;
        if ($ic(this).attr('src') && $ic(this).parent().find('.google-link').length === 0) {
            var href = $ic(this).attr('src');
            var link = $ic('<a class="google-link" href="http://www.google.com.hk/searchbyimage?image_url=' + encodeURIComponent(href) +'" target="_blank">Search with google</a>');
            $ic(this).parent().append(link);
        }
    });

    // DEBUG
    win.console.log("[IC Enhancement Suite] :: Succesfully loaded Suite");
}

var ic_ScriptObject = document.createElement("script");
ic_ScriptObject.textContent = "(" + ic_FunctionWrapper.toString() + ")();";
document.body.appendChild(ic_ScriptObject);