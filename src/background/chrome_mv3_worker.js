'use strict';

const OFFSCREEN_DOCUMENT_PATH = 'background/chrome_offscreen.html';

let creatingOffscreenDocument = null;

async function hasOffscreenDocument() {
  const offscreenUrl = chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH);
  if ('getContexts' in chrome.runtime) {
    const contexts = await chrome.runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT'],
      documentUrls: [offscreenUrl],
    });
    return contexts.length > 0;
  }

  const matchedClients = await clients.matchAll();
  return matchedClients.some((client) => client.url === offscreenUrl);
}

async function ensureOffscreenDocument() {
  if (await hasOffscreenDocument()) {
    return;
  }

  if (creatingOffscreenDocument) {
    await creatingOffscreenDocument;
    return;
  }

  creatingOffscreenDocument = chrome.offscreen.createDocument({
    url: OFFSCREEN_DOCUMENT_PATH,
    reasons: ['DOM_PARSER', 'AUDIO_PLAYBACK'],
    justification:
      'Translate text and play text-to-speech using DOM and audio APIs unavailable in the MV3 service worker.',
  });

  try {
    await creatingOffscreenDocument;
  } finally {
    creatingOffscreenDocument = null;
  }
}

globalThis.twpEnsureOffscreenDocument = ensureOffscreenDocument;

importScripts(
  '/lib/polyfill.js',
  '/lib/checkedLastError.js',
  '/lib/stuff.js',
  '/lib/languages.js',
  '/lib/config.js',
  '/lib/platformInfo.js',
  '/lib/i18n.js',
  '/background/translationCache.js',
  '/background/translationService.js',
  '/background/textToSpeech.js',
  '/background/background.js',
);
