// ==UserScript==
// @name         InnerCircle Enhancement Suite
// @namespace    http://jeltelagendijk.nl
// @version      0.2.1
// @description  Adds functionalities to InnerCircle
// @author       j3lte
// @match        https://www.theinnercircle.co/*
// @include      https://www.theinnercircle.co/*
// @grant        none
// ==/UserScript==

function ic_FunctionWrapper() {

    // Define global version
    var version = "0.2.1";

    // Variables
    var win = window;
    var $ic;

    if (typeof unsafeWindow != 'undefined') win = unsafeWindow;
    if (typeof unsafeWindow == 'undefined' ) $ic = jQuery;
    else $ic = unsafeWindow.jQuery || jQuery;

    if (!win.console) {
        win.console = {
            log : function(){}
        };
    }

    var defaults = {
        version : version,
        hideQuestionBlock : false,
        hideEmptyMatches : false,
        loadMemberOnHover : false,
        openInNew : true,
        nightMode : false
    };
    var opts = defaults;

    var optionLabels = [
        { identifier: 'option_hide_question', optionKey: 'hideQuestionBlock', label: 'Hide top question block' },
        { identifier: 'option_hide_empty', optionKey: 'hideEmptyMatches', label: 'Hide matches widget when there are no matches' },
        { identifier: 'option_load_hover', optionKey: 'loadMemberOnHover', label: 'Load members on hover' },
        { identifier: 'option_open_in_new', optionKey: 'openInNew', label: 'Open member links in a new window/tab' },
        { identifier: 'option_night_mode', optionKey: 'nightMode', label: 'Night mode (not finished)' }
    ];


    if ($ic.cookie) {
        if ($ic.cookie('ic_enhance_options')) {
            try {
                opts = JSON.parse($ic.cookie('ic_enhance_options'));
                if (opts.version !== defaults.version) {
                    var json = JSON.stringify(defaults);
                    $ic.cookie('ic_enhance_options', json, { path: '/' });
                }
            } catch (e) {}
        } else {
            var stringJSON = JSON.stringify(opts);
            $ic.cookie('ic_enhance_options', stringJSON, { path: '/' });
        }
    }

    // ADD CSS
    var css = [
        '#userBox { width: 158px; z-index:10000; padding: 2px; border: 1px solid #0099B0;position: fixed;left: 10px;top: 111px;font-size: 10px;background: #fff; }',
        '#userBox .profile_field { border: 0px solid #000; padding: 0px; line-height: 11px; clear: both; }',
        '#userBox .job_title { clear: both; color: #666; padding-bottom: 0; font-size: 10px; line-height: 11px; white-space: nowrap; overflow: hidden; border-top: 1px solid #CCC; border-bottom: 1px solid #CCC; }',
        '#userBox #user_photos { display: block; width: 158px; min-width: 1px; margin: 3px 0 3px 2px; }',
        '#userBox .rsTmb { width: 50px; margin: 0 2px 2px 0; }',
        '.close-user-box { cursor: pointer; }',
        '.google-link { position: absolute;background: rgba(255,255,255,0.3);left: 0;bottom: 0;width: 100%;text-align: center;color: #000;font-size: 10px;text-decoration: none; }',
        '#saveAndReloadOptions.disabled { opacity: 0.1; }',
        '.navigation a { padding: 8px 7px; }',
        '#enhance_tabs label { color:#FFF; }'
    ].join('\n');

    // NIGHT MODE
    css += [
        'body.night, .night .widget.white { background-color: #302E31; color: #fff; }',
        'body.night h1 { background-image: url("/images/h1_white.png"); }',
        'body.night h1, body.night h1 a, body.night .job_title, body.night .profile_field b { color:#fff; }',
        'body.night .rsDefault, body.night .rsDefault .rsOverflow, body.night .rsDefault .rsSlide, body.night .rsDefault .rsVideoFrameHolder, body.night .rsDefault .rsThumbs { background-color: #323232; }',
        'body.night .member_event_date, body.night .event_date, body.night .invites_count, body.night .my_trip_date { background-color: #0099B0; }',
        'body.night .grey, .message_accent { background-color: #151415; }',
        'body.night .featured_box, body.night .interest_box, body.night .ui-tooltip { color: #151415; }',
        'body.night .nearby-block { border-top:5px solid #151415; }',
        'body.night .widget, body.night .hotposts_container { color: #302E31; }'
    ].join('\n');

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

    // Body element
    var $body = $ic('body');

    if (opts.nightMode) {
        $body.addClass('night');
    };

    // $membox is used for the downloaded content
    var $memBox = $ic('<div />');

    // Userbox is the box that is shown when a member is loaded
    var $userBox = $ic('<div id="userBox" style="display: none;" />');
    $body.append($userBox);

    // Loader that is shown at the bottom right of the window
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

    // Regex to determine whether a link contains a member link
    var memLinkRegEx = /(http|https):\/\/www\.theinnercircle\.co\/member\/\d+/;
    var timer, ev, link, userBoxes  = {};

    // Loads the member page
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

    // Load member on hover
    if (opts.loadMemberOnHover){
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

        // Userbox clicks
        $body.on('click', '#userBox .username', open_new);
        $body.on('click','.close-user-box', function() { $userBox.hide(); });
    }

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

    if (opts.openInNew) {
        // Open online members in new tab/window
        $body.on('click', '.online_box a', open_new);

        // Open featured in new tab/window
        $body.on('click','.featured_box a', open_new);

        // Open interest in new tab/window
        $body.on('click','.interest_box a', open_new);
    }

    // Remove match box if there are no matches
    if (opts.hideEmptyMatches && $ic('.potential_match .match-last').length) {
        console.log('[IC Enhancement Suite] :: No matches, hiding box');
        $ic('.potential_match').hide();
    }

    // Remove nearby question block
    if (opts.hideQuestionBlock) {
        $ic('.nearby-block.question').css('display', 'none');
    }

    // Open fancybox images originals
    $body.on('click','.fancybox-image', open_new);

    // Add 'Search with google' link to popup images
    $body.on('mouseover', '.fancybox-image', function(event) {
        ev = event;
        if ($ic(this).attr('src') && $ic(this).parent().find('.google-link').length === 0) {
            var href = $ic(this).attr('src');
            var link = $ic('<a class="google-link" href="http://www.google.com.hk/searchbyimage?image_url=' + encodeURIComponent(href) +'" target="_blank">Search with google</a>');
            $ic(this).parent().append(link);
        }
    });

    // Enhance Dialog (Options screen)
    $ic('.navigation').append('<a href="#" class="ic_enhance_suite">Enhance</a>');
    var $enhDialog = $ic('<div id="enhancedialog" title="Enhancements" class="dialog tabs-dialog" />');
    function createEnhanceDialog() {
        var dialogContent =  '<div id="enhance_tabs" class="tabs-no-padding">\n';
        for (var i = 0; i < optionLabels.length; i++) {
            var opt = optionLabels[i];
            dialogContent += '    <input type="checkbox" class="option_check" data-option="' + opt.optionKey + '" id="' + opt.identifier + '" name="' + opt.identifier + '" ' + (opts[opt.optionKey] ? 'checked="checked"' : '') + '>\n';
            dialogContent += '    <label for="' + opt.identifier + '" class="optional">' + opt.label + '</label>\n';
            dialogContent += '    <div class="clear"></div>\n';
        }
        // SUBMIT
        dialogContent += '    <dt></dt>\n';
        dialogContent += '    <a href="#" id="saveAndReloadOptions" class="button disabled">Save and reload</a>\n';
        dialogContent += '</div>';
        $enhDialog.html(dialogContent);
    }

    $body.append($enhDialog);
    $enhDialog.dialog({
        closeOnEscape: true,
        modal: true,
        autoOpen: false,
        width: 400
    });

    $ic('a.ic_enhance_suite').on('click', function (e){
        e.preventDefault();
        createEnhanceDialog();
        $enhDialog.dialog('open');
    });

    $body.on('click', '.option_check',function (e){
        $ic('#saveAndReloadOptions').removeClass('disabled');
    });

    $body.on('click', '#saveAndReloadOptions',function (e){
        e.preventDefault();
        if ($ic(this).hasClass('disabled')) {
            return false;
        }
        opts = { version : version };
        $ic('.option_check').each(function () {
            var key = $ic(this).data('option');
            opts[key] = $ic(this).is(':checked');
        });
        var json = JSON.stringify(opts);
        $.cookie('ic_enhance_options', json, { path: '/' });
        win.location.reload();
    });

    // Fix the inplace editor
    $('.inplace_view').each(function (){
        var $this = $(this);
        var html = $this.html();
        $this.html(html.replace('\n','<br /><br />'));
    });
    //$($('.inplace_view')[10]).html($($('.inplace_view')[10]).html().replace('\n','<br /><br />'))

    // DEBUG
    win.console.log("[IC Enhancement Suite] :: Succesfully loaded Suite");
}

var ic_ScriptObject = document.createElement("script");
ic_ScriptObject.textContent = "(" + ic_FunctionWrapper.toString() + ")();";
document.body.appendChild(ic_ScriptObject);