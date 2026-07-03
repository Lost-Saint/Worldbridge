// @ts-check

'use strict';

/** @typedef {import('../types/config').ArrayConfigName} ArrayConfigName */
/** @typedef {import('../types/config').ConfigName} ConfigName */
/** @typedef {import('../types/config').ConfigObserver} ConfigObserver */
/** @typedef {import('../types/config').ConfigStore} ConfigStore */
/** @typedef {import('../types/config').MapConfigName} MapConfigName */
/** @typedef {import('../types/config').PageTranslatorServiceName} PageTranslatorServiceName */
/** @typedef {import('../types/config').PersistedConfigStore} PersistedConfigStore */
/** @typedef {import('../types/config').TwpConfigApi} TwpConfigApi */

const twpConfig = (function() {
  /** @type {ConfigObserver[]} */
  const observers = [];
  const defaultTargetLanguages = ['en', 'es', 'de'];

  /** @type {ConfigStore} */
  const defaultConfig = {
    uiLanguage: 'default',
    pageTranslatorService: 'google', // google yandex bing
    textTranslatorService: 'google', // google yandex bing deepl
    textToSpeechService: 'google', // google bing
    enabledServices: ['google', 'bing', 'yandex', 'deepl'],
    ttsSpeed: 1.0,
    ttsVolume: 1.0,
    targetLanguage: null,
    targetLanguageTextTranslation: null,
    targetLanguages: [], // "en", "es", "de"
    alwaysTranslateSites: [],
    neverTranslateSites: [],
    sitesToTranslateWhenHovering: [],
    langsToTranslateWhenHovering: [],
    alwaysTranslateLangs: [],
    neverTranslateLangs: [],
    customDictionary: new Map(),
    showTranslatePageContextMenu: 'yes',
    showTranslateSelectedContextMenu: 'yes',
    showButtonInTheAddressBar: 'yes',
    showOriginalTextWhenHovering: 'no',
    showTranslateSelectedButton: 'yes',
    whenShowMobilePopup: 'when-necessary', // when-necessary only-when-i-touch always-show
    useOldPopup: 'yes',
    darkMode: 'auto', // auto yes no
    popupBlueWhenSiteIsTranslated: 'yes',
    popupPanelSection: 1,
    showReleaseNotes: 'yes',
    dontShowIfIsNotValidText: 'yes',
    dontShowIfPageLangIsTargetLang: 'no',
    dontShowIfPageLangIsUnknown: 'no',
    dontShowIfSelectedTextIsTargetLang: 'no',
    dontShowIfSelectedTextIsUnknown: 'no',
    hotkeys: {}, // Hotkeys are obtained from the manifest file
    expandPanelTranslateSelectedText: 'no',
    translateTag_pre: 'yes',
    enableIframePageTranslation: 'yes',
    dontSortResults: 'no',
    translateDynamicallyCreatedContent: 'yes',
    autoTranslateWhenClickingALink: 'no',
    translateSelectedWhenPressTwice: 'no',
    translateTextOverMouseWhenPressTwice: 'no',
    translateClickingOnce: 'no',
    enableDiskCache: 'no',
    useAlternativeService: 'yes',
    customServices: [],
    showMobilePopupOnDesktop: 'no',
    popupMobileKeepOnScren: 'no',
    popupMobilePosition: 'top', // top bottom
    addPaddingToPage: 'no',
    proxyServers: {},
    lastTimeShowingReleaseNotes: null,
    installDateTime: null,
    originalUserAgent: null,
    deepl_confirmed: 'no',
    authorizationToOpenOptions: null,
  };

  /** @type {ConfigName[]} */
  const configNames = /** @type {ConfigName[]} */ (Object.keys(defaultConfig));

  /** @type {ConfigStore} */
  const config = structuredClone(defaultConfig);

  /** @type {Array<() => void>} */
  let onReadyObservers = [];
  let configIsReady = false;
  /** @type {(() => void) | null} */
  let onReadyResolvePromise = null;
  /** @type {Promise<void>} */
  const onReadyPromise = new Promise((resolve) => {
    onReadyResolvePromise = resolve;
  });

  function readyConfig() {
    configIsReady = true;
    onReadyObservers.forEach((callback) => callback());
    onReadyObservers = [];
    onReadyResolvePromise?.();
  }

  /**
   * @template {ConfigName} K
   * @param {K} key
   * @param {ConfigStore[K]} value
   */
  function assignConfigValue(key, value) {
    config[key] = value;
  }

  /** @type {TwpConfigApi} */
  const twpConfig = /** @type {TwpConfigApi} */ ({});

  /**
   * @param {(() => void) | null} [callback]
   * @returns {Promise<void>}
   */
  twpConfig.onReady = function(callback = null) {
    if (callback) {
      if (configIsReady) {
        callback();
      } else {
        onReadyObservers.push(callback);
      }
    }

    return onReadyPromise;
  };

  /**
   * @template {ConfigName} K
   * @param {K} name
   * @returns {ConfigStore[K]}
   */
  twpConfig.get = function(name) {
    return config[name];
  };

  /**
   * @template {ConfigName} K
   * @param {K} name
   * @param {ConfigStore[K]} value
   */
  twpConfig.set = function(name, value) {
    config[name] = value;

    /** @type {Partial<PersistedConfigStore>} */
    const storageValue = {};
    storageValue[name] = toPersistedValue(value);

    chrome.storage.local.set(storageValue);
    observers.forEach((callback) => callback(name, value));
  };

  /**
   * @returns {string}
   */
  twpConfig.export = function() {
    /** @type {Record<string, unknown>} */
    const exportedConfig = {
      timeStamp: Date.now(),
      version: chrome.runtime.getManifest().version,
    };

    for (const key of configNames) {
      exportedConfig[key] = toPersistedValue(twpConfig.get(key));
    }

    return JSON.stringify(exportedConfig, null, 4);
  };

  /**
   * @param {string} configJSON
   */
  twpConfig.import = function(configJSON) {
    /** @type {Partial<PersistedConfigStore>} */
    const newConfig = JSON.parse(configJSON);

    for (const key of configNames) {
      const value = newConfig[key];
      if (typeof value !== 'undefined') {
        twpConfig.set(key, fromPersistedValue(key, value));
      }
    }

    if (
      typeof browser !== 'undefined' &&
      typeof browser.commands !== 'undefined'
    ) {
      for (const name in config.hotkeys) {
        browser.commands.update({
          name,
          shortcut: config.hotkeys[name] ?? '',
        });
      }
    }

    chrome.runtime.reload();
  };

  twpConfig.restoreToDefault = function() {
    if (
      typeof browser !== 'undefined' &&
      typeof browser.commands !== 'undefined'
    ) {
      const commands = chrome.runtime.getManifest().commands || {};
      for (const name of Object.keys(commands)) {
        const info = commands[name];
        if (!info) {
          continue;
        }

        if (info.suggested_key && info.suggested_key.default) {
          browser.commands.update({
            name,
            shortcut: info.suggested_key.default,
          });
        } else {
          browser.commands.update({
            name,
            shortcut: '',
          });
        }
      }
    }

    twpConfig.import(JSON.stringify(defaultConfig));
  };

  /**
   * @param {ConfigObserver} callback
   */
  twpConfig.onChanged = function(callback) {
    observers.push(callback);
  };

  chrome.storage.onChanged.addListener((changes, areaName) => {
    twpConfig.onReady(() => {
      if (areaName !== 'local') {
        return;
      }

      for (const key of configNames) {
        const storageChange = changes[key];
        if (!storageChange || typeof storageChange.newValue === 'undefined') {
          continue;
        }

        const newValue = fromPersistedValue(key, storageChange.newValue);
        if (config[key] !== newValue) {
          assignConfigValue(key, newValue);
          observers.forEach((callback) => callback(key, newValue));
        }
      }
    });
  });

  chrome.i18n.getAcceptLanguages((acceptedLanguages) => {
    chrome.storage.local.get(null, (onGot) => {
      /** @type {Partial<PersistedConfigStore>} */
      const storedConfig = onGot;

      for (const key of configNames) {
        const value = storedConfig[key];
        if (typeof value !== 'undefined') {
          assignConfigValue(key, fromPersistedValue(key, value));
        }
      }

      if (config.targetLanguages.some((lang) => !lang)) {
        config.targetLanguages = [...defaultTargetLanguages];
        chrome.storage.local.set({
          targetLanguages: config.targetLanguages,
        });
      }

      for (const acceptedLanguage of acceptedLanguages) {
        if (config.targetLanguages.length >= 3) {
          break;
        }

        const lang = normalizeLanguageCode(acceptedLanguage);
        if (lang && config.targetLanguages.indexOf(lang) === -1) {
          config.targetLanguages.push(lang);
        }
      }

      for (const lang of defaultTargetLanguages) {
        if (config.targetLanguages.length >= 3) {
          break;
        }

        if (config.targetLanguages.indexOf(lang) === -1) {
          config.targetLanguages.push(lang);
        }
      }

      while (config.targetLanguages.length > 3) {
        config.targetLanguages.pop();
      }

      if (
        !config.targetLanguage ||
        config.targetLanguages.indexOf(config.targetLanguage) === -1
      ) {
        config.targetLanguage = config.targetLanguages[0];
      }

      if (
        !config.targetLanguageTextTranslation ||
        config.targetLanguages.indexOf(config.targetLanguageTextTranslation) ===
          -1
      ) {
        config.targetLanguageTextTranslation = config.targetLanguages[0];
      }

      config.targetLanguages = normalizeLanguageCodeList(config.targetLanguages);
      config.neverTranslateLangs = normalizeLanguageCodeList(
        config.neverTranslateLangs,
      );
      config.alwaysTranslateLangs = normalizeLanguageCodeList(
        config.alwaysTranslateLangs,
      );
      config.targetLanguage = normalizeLanguageCode(config.targetLanguage);
      config.targetLanguageTextTranslation = normalizeLanguageCode(
        config.targetLanguageTextTranslation,
      );

      if (config.targetLanguages.indexOf(config.targetLanguage || '') === -1) {
        config.targetLanguage = config.targetLanguages[0];
      }
      if (
        config.targetLanguages.indexOf(
          config.targetLanguageTextTranslation || '',
        ) === -1
      ) {
        config.targetLanguageTextTranslation = config.targetLanguages[0];
      }

      if (typeof chrome.commands !== 'undefined') {
        chrome.commands.getAll((results) => {
          try {
            for (const result of results) {
              if (result.name) {
                config.hotkeys[result.name] = result.shortcut;
              }
            }
            twpConfig.set('hotkeys', config.hotkeys);
          } catch (e) {
            console.error(e);
          } finally {
            readyConfig();
          }
        });
      } else {
        readyConfig();
      }
    });
  });

  /**
   * @param {string | null | undefined} lang
   * @returns {string | null}
   */
  function normalizeLanguageCode(lang) {
    return /** @type {string | null} */ (
      /** @type {any} */ (twpLang).fixTLanguageCode(lang) || null
    );
  }

  /**
   * @param {string[]} languages
   * @returns {string[]}
   */
  function normalizeLanguageCodeList(languages) {
    /** @type {string[]} */
    const normalizedLanguages = [];

    for (const lang of languages) {
      const normalizedLang = normalizeLanguageCode(lang);
      if (normalizedLang) {
        normalizedLanguages.push(normalizedLang);
      }
    }

    return normalizedLanguages;
  }

  /**
   * @param {ArrayConfigName} configName
   * @param {string} value
   */
  function addInArray(configName, value) {
    const array = twpConfig.get(configName);
    if (array.indexOf(value) === -1) {
      array.push(value);
      twpConfig.set(configName, array);
    }
  }

  /**
   * @param {MapConfigName} configName
   * @param {string} key
   * @param {string} value
   */
  function addInMap(configName, key, value) {
    const map = twpConfig.get(configName);
    if (typeof map.get(key) === 'undefined') {
      map.set(key, value);
      twpConfig.set(configName, map);
    }
  }

  /**
   * @param {ArrayConfigName} configName
   * @param {string} value
   */
  function removeFromArray(configName, value) {
    const array = twpConfig.get(configName);
    const index = array.indexOf(value);
    if (index > -1) {
      array.splice(index, 1);
      twpConfig.set(configName, array);
    }
  }

  /**
   * @param {MapConfigName} configName
   * @param {string} key
   */
  function removeFromMap(configName, key) {
    const map = twpConfig.get(configName);
    if (typeof map.get(key) !== 'undefined') {
      map.delete(key);
      twpConfig.set(configName, map);
    }
  }

  twpConfig.addSiteToTranslateWhenHovering = function(hostname) {
    addInArray('sitesToTranslateWhenHovering', hostname);
  };

  twpConfig.removeSiteFromTranslateWhenHovering = function(hostname) {
    removeFromArray('sitesToTranslateWhenHovering', hostname);
  };

  twpConfig.addLangToTranslateWhenHovering = function(lang) {
    addInArray('langsToTranslateWhenHovering', lang);
  };

  twpConfig.removeLangFromTranslateWhenHovering = function(lang) {
    removeFromArray('langsToTranslateWhenHovering', lang);
  };

  twpConfig.addSiteToAlwaysTranslate = function(hostname) {
    addInArray('alwaysTranslateSites', hostname);
    removeFromArray('neverTranslateSites', hostname);
  };

  twpConfig.removeSiteFromAlwaysTranslate = function(hostname) {
    removeFromArray('alwaysTranslateSites', hostname);
  };

  twpConfig.addSiteToNeverTranslate = function(hostname) {
    addInArray('neverTranslateSites', hostname);
    removeFromArray('alwaysTranslateSites', hostname);
    removeFromArray('sitesToTranslateWhenHovering', hostname);
  };

  twpConfig.addKeyWordTocustomDictionary = function(key, value) {
    addInMap('customDictionary', key, value);
  };

  twpConfig.removeSiteFromNeverTranslate = function(hostname) {
    removeFromArray('neverTranslateSites', hostname);
  };

  twpConfig.removeKeyWordFromcustomDictionary = function(keyWord) {
    removeFromMap('customDictionary', keyWord);
  };

  twpConfig.addLangToAlwaysTranslate = function(lang, hostname) {
    addInArray('alwaysTranslateLangs', lang);
    removeFromArray('neverTranslateLangs', lang);

    if (hostname) {
      removeFromArray('neverTranslateSites', hostname);
    }
  };

  twpConfig.removeLangFromAlwaysTranslate = function(lang) {
    removeFromArray('alwaysTranslateLangs', lang);
  };

  twpConfig.addLangToNeverTranslate = function(lang, hostname) {
    addInArray('neverTranslateLangs', lang);
    removeFromArray('alwaysTranslateLangs', lang);
    removeFromArray('langsToTranslateWhenHovering', lang);

    if (hostname) {
      removeFromArray('alwaysTranslateSites', hostname);
    }
  };

  twpConfig.removeLangFromNeverTranslate = function(lang) {
    removeFromArray('neverTranslateLangs', lang);
  };

  /**
   * @param {string} lang
   */
  function addTargetLanguage(lang) {
    const targetLanguages = twpConfig.get('targetLanguages');
    const normalizedLang = normalizeLanguageCode(lang);
    if (!normalizedLang) {
      return;
    }

    const index = targetLanguages.indexOf(normalizedLang);
    if (index === -1) {
      targetLanguages.unshift(normalizedLang);
      targetLanguages.pop();
    } else {
      targetLanguages.splice(index, 1);
      targetLanguages.unshift(normalizedLang);
    }

    twpConfig.set('targetLanguages', targetLanguages);
  }

  twpConfig.setTargetLanguage = function(lang, forTextToo = false) {
    const targetLanguages = twpConfig.get('targetLanguages');
    const normalizedLang = normalizeLanguageCode(lang);
    if (!normalizedLang) {
      return;
    }

    if (targetLanguages.indexOf(normalizedLang) === -1 || forTextToo) {
      addTargetLanguage(normalizedLang);
    }

    twpConfig.set('targetLanguage', normalizedLang);

    if (forTextToo) {
      twpConfig.setTargetLanguageTextTranslation(normalizedLang);
    }
  };

  twpConfig.setTargetLanguageTextTranslation = function(lang) {
    const normalizedLang = normalizeLanguageCode(lang);
    if (!normalizedLang) {
      return;
    }

    twpConfig.set('targetLanguageTextTranslation', normalizedLang);
  };

  /**
   * @template {ConfigName} K
   * @param {K} key
   * @param {PersistedConfigStore[K]} value
   * @returns {ConfigStore[K]}
   */
  function fromPersistedValue(key, value) {
    if (defaultConfig[key] instanceof Map) {
      return /** @type {ConfigStore[K]} */ (
        /** @type {unknown} */ (
          new Map(Object.entries(/** @type {Record<string, string>} */ (value)))
        )
      );
    }

    return /** @type {ConfigStore[K]} */ (/** @type {unknown} */ (value));
  }

  /**
   * @template {ConfigName} K
   * @param {ConfigStore[K]} value
   * @returns {PersistedConfigStore[K]}
   */
  function toPersistedValue(value) {
    if (value instanceof Map) {
      return /** @type {PersistedConfigStore[K]} */ (
        /** @type {unknown} */ (Object.fromEntries(value))
      );
    }

    return /** @type {PersistedConfigStore[K]} */ (
      /** @type {unknown} */ (value)
    );
  }

  /**
   * @returns {PageTranslatorServiceName}
   */
  twpConfig.swapPageTranslationService = function() {
    /** @type {PageTranslatorServiceName[]} */
    const pageTranslationServices = ['google', 'bing', 'yandex'];
    /** @type {PageTranslatorServiceName[]} */
    const pageEnabledServices = /** @type {PageTranslatorServiceName[]} */ (
      twpConfig
        .get('enabledServices')
        .filter((serviceName) =>
          pageTranslationServices.includes(
            /** @type {PageTranslatorServiceName} */ (serviceName),
          )
        )
    );

    const index = pageEnabledServices.indexOf(
      twpConfig.get('pageTranslatorService'),
    );

    if (index !== -1) {
      if (pageEnabledServices[index + 1]) {
        twpConfig.set('pageTranslatorService', pageEnabledServices[index + 1]);
      } else {
        twpConfig.set('pageTranslatorService', pageEnabledServices[0]);
      }
    } else {
      twpConfig.set('pageTranslatorService', pageEnabledServices[0]);
    }

    return twpConfig.get('pageTranslatorService');
  };

  return twpConfig;
})();
