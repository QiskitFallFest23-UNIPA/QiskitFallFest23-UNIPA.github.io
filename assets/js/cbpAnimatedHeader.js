/**
 * cbpAnimatedHeader.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2013, Codrops
 * http://www.codrops.com
 */
var cbpAnimatedHeader = (function () {

    var docElem = document.documentElement,
        header = document.querySelector('#navbarHome.navbar-fixed-top'),
        didScroll = false,
        changeHeaderOn = 100;

    var dropdown = document.querySelector('.dropdown-menu.dropdown-menu-custom');

    function init() {
        window.addEventListener('scroll', function (event) {
            if (!didScroll) {
                didScroll = true;
                setTimeout(scrollPage, 250);
            }
        }, false);
    }

    function scrollPage() {
        var sy = scrollY();
        if (sy >= changeHeaderOn) {
            if (header !== null) {
                classie.add(header, 'navbar-shrink');
            }
            if (dropdown !== null) {
                classie.add(dropdown, 'dropdown-menu-custom-shrink');
            }
        }
        else {

            if (header !== null && header.classList.contains('navbar-shrink')) {
                classie.remove(header, 'navbar-shrink');
            }
            if (dropdown !== null && dropdown.classList.contains('dropdown-menu-custom-shrink')) {
                classie.remove(dropdown, 'dropdown-menu-custom-shrink');
            }
        }
        didScroll = false;
    }

    function scrollY() {
        return window.pageYOffset || docElem.scrollTop;
    }

    init();

})();