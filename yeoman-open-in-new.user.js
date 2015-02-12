// ==UserScript==
// @name         Yeoman Userscript
// @namespace    https://github.com/j3lte/user-scripts
// @version      0.0.1
// @description  Adds functionalities to Yeoman website
// @author       j3lte
// @updateURL    https://github.com/j3lte/user-scripts/raw/master/yeoman-open-in-new.user.js
// @downloadURL  https://github.com/j3lte/user-scripts/raw/master/yeoman-open-in-new.user.js
// @match        http://yeoman.io/generators/
// @include      http://yeoman.io/generators/
// @license      MIT License https://raw.githubusercontent.com/j3lte/user-scripts/master/LICENSE
// @grant        unsafeWindow
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

    if (!$) return false;

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