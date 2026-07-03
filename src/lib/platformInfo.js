'use strict';

/**
 * Shared browser and device detection flags derived from the persisted original
 * user agent when available.
 */
const platformInfo = {};

/**
 * Populates platform flags once config is available so every script can make
 * consistent browser-specific decisions.
 *
 * @returns {void}
 */
twpConfig.onReady(function() {
  if (chrome.tabs) {
    twpConfig.set('originalUserAgent', navigator.userAgent);
  }

  let userAgent;
  if (twpConfig.get('originalUserAgent')) {
    userAgent = twpConfig.get('originalUserAgent');
  } else {
    userAgent = navigator.userAgent;
  }

  platformInfo.isMobile = {
    Android: userAgent.match(/Android/i),
    BlackBerry: userAgent.match(/BlackBerry/i),
    iOS: userAgent.match(/iPhone|iPad|iPod/i),
    Opera: userAgent.match(/Opera Mini/i),
    Windows: userAgent.match(/IEMobile/i) || userAgent.match(/WPDesktop/i),
  };
  platformInfo.isMobile.any = platformInfo.isMobile.Android ||
    platformInfo.isMobile.BlackBerry ||
    platformInfo.isMobile.iOS ||
    platformInfo.isMobile.Opera ||
    platformInfo.isMobile.Windows;

  platformInfo.isDesktop = {
    any: !platformInfo.isMobile.any,
    Firefox: typeof browser !== 'undefined',
  };

  platformInfo.isFirefox = typeof browser !== 'undefined';
  platformInfo.isOpera = userAgent.match(/OPR/i);
});
