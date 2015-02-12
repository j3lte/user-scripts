// ==UserScript==
// @name         InnerCircle Enhancement Suite
// @namespace    https://github.com/j3lte/user-scripts
// @version      0.3.6
// @description  Adds functionalities to InnerCircle
// @author       j3lte
// @updateURL    https://github.com/j3lte/user-scripts/raw/master/yeoman-open-in-new.user.js
// @downloadURL  https://github.com/j3lte/user-scripts/raw/master/yeoman-open-in-new.user.js
// @match        http://http://yeoman.io/generators/
// @include      http://http://yeoman.io/generators/
// @icon         https://raw.githubusercontent.com/j3lte/user-scripts/master/ic_plus.png
// @license      MIT License https://raw.githubusercontent.com/j3lte/user-scripts/master/LICENSE
// @grant        unsafeWindow
// @date         01.26.2015
// ==/UserScript==

function _functionWrapper() {

    // Define global version
    var version = '0.0.1';

    // Variables
    var win = window;
    var $;

    if (typeof unsafeWindow !== 'undefined') {
        win = unsafeWindow;
    }

    if (typeof unsafeWindow === 'undefined' ) {
        $ = jQuery;
    } else {
        $ = unsafeWindow.jQuery || jQuery
    }

    // Body element
    var $body = $('body');

    function open_new() {
        $(this).target = '_blank';
        if ($(this).prop('href')) {
            win.open($(this).prop('href'));
        }
        return false;
    }

    $body.on('click', '#plugins-all td a', open_new);

}

var ic_ScriptObject = document.createElement('script');
ic_ScriptObject.textContent = '(' + _functionWrapper.toString() + ')();';
document.body.appendChild(ic_ScriptObject);