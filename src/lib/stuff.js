/**
 * Opens a URL in a new tab, using the appropriate opener strategy for mobile vs desktop.
 * @param {string} url
 * @param {(tab: chrome.tabs.Tab) => void} [callback]
 */
function tabsCreate(url, callback) {
  const userAgent = navigator.userAgent;
  const isMobile = userAgent.match(/Android/i) ||
    userAgent.match(/BlackBerry/i) ||
    userAgent.match(/iPhone|iPad|iPod/i) ||
    userAgent.match(/Opera Mini/i) ||
    userAgent.match(/IEMobile/i) ||
    userAgent.match(/WPDesktop/i);

  if (isMobile) {
    chrome.tabs.create({ url }, callback);
  } else {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const openerTabId = tabs[0]?.id ? tabs[0].id : null;
      chrome.tabs.create({ url, openerTabId }, callback);
    });
  }
}
