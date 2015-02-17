// ==UserScript==
// @name         Google Play Books Fullscreen button
// @namespace    https://github.com/j3lte/user-scripts
// @version      0.0.1
// @description  Add fullscreen button to Google Play Books
// @author       j3lte
// @updateURL    https://github.com/j3lte/user-scripts/raw/master/play-books-fullscreen.user.js
// @downloadURL  https://github.com/j3lte/user-scripts/raw/master/play-books-fullscreen.user.js
// @match        https://play.google.com/books/*
// @include      https://play.google.com/books/*
// @license      MIT License https://raw.githubusercontent.com/j3lte/user-scripts/master/LICENSE
// @grant        unsafeWindow
// ==/UserScript==

function toggleFullScreen() {
  if (!document.fullscreenElement &&    // alternative standard method
      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}

var css = '#block { display: block; position: absolute; width: 16px; height: 16px; z-index: 100000; background: rgba(0,0,0,0.25); right: 2px; bottom: 2px; padding: 2px; }';

if (typeof GM_addStyle !== 'undefined') {
    GM_addStyle(css);
} else if (typeof PRO_addStyle !== 'undefined') {
    PRO_addStyle(css);
} else if (typeof addStyle !== 'undefined') {
    addStyle(css);
} else {
    var node = document.createElement('style');
    node.type = 'text/css';
    node.appendChild(document.createTextNode(css));
    var heads = document.getElementsByTagName('head');
    if (heads.length > 0) {
        heads[0].appendChild(node);
    } else {
        // no head yet, stick it whereever
        document.documentElement.appendChild(node);
    }
}

document.addEventListener ('DOMContentLoaded', DOM_ContentReady);

function DOM_ContentReady () {
    var div = document.createElement('div');
    div.id = 'block';

    document.getElementsByTagName('body')[0].appendChild(div);

    var base64_string = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABiUlEQVQ4T81Tu04CURCduey6REsNxj/whf6CQKQg7ApobWliY2NF1EpDZ2VhY2VLzMJuAglB4BOMj+gnCGpF5JFd7pir7GYRQ9DKaW7u3HPOnZmcQU1LEPQDETP5vH7g3H864/FEhjFIuxyPQMOy5OViMfsySiAajQb8/sk7AAgIHPYFGiKBCPftditSKpXEfSg0TZsl8l0j0hIAfHE0LXHc6bTOFGWqIh6I8AGxFzEMo+5VEGQArADgosB0u+9hWVb20AEJAOesyhgsAGDVMPSwVyAe36gyhmucwyNjPOR84AoIcCqVmrMsO9vr2buFQkH06UYsFgv6fNJ5s6ls1WrZZ3eIowY2zttABeMQvmP+mUAymZy2LH6JKO2b5tWTt1xV3Zwnsk9lmW3ruv42NERVVWcAfGVEWCWCimnmIoM+SFYAKARAN0R83TTN174TtbRlKReSZJcRaWVMI90C2BHOYefTykRUR8TZ31jZ5TjLJBK2PRH86zI57Z4YRu5olB/E7gDAoYP5AFGEu1ds4g9EAAAAAElFTkSuQmCC";
    var img = document.createElement("img");
    img.src = "data:image/png;base64," + base64_string;
    var preview = document.getElementById("img_preview");
    div.appendChild(img);

    div.addEventListener("click", function(e) {
      toggleFullScreen();
    }, false);
}