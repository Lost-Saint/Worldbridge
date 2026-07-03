export type ToggleSetting = 'yes' | 'no';
export type ThemeSetting = 'auto' | ToggleSetting;

export type PageTranslatorServiceName = 'google' | 'bing' | 'yandex';
export type TextTranslatorServiceName =
  | PageTranslatorServiceName
  | 'deepl'
  | 'libre';
export type TextToSpeechServiceName = 'google' | 'bing';
export type MobilePopupSetting =
  | 'when-necessary'
  | 'only-when-i-touch'
  | 'always-show';
export type PopupMobilePosition = 'top' | 'bottom';

export interface LibreCustomService {
  name: 'libre';
  url: string;
  apiKey: string;
}

export interface DeepLFreeApiCustomService {
  name: 'deepl_freeapi';
  apiKey: string;
}

export type CustomService = LibreCustomService | DeepLFreeApiCustomService;

export interface GoogleProxyServers {
  translateServer: string | null;
  ttsServer: string | null;
}

export interface ProxyServers {
  google?: GoogleProxyServers;
}

export interface ConfigStore {
  uiLanguage: string;
  pageTranslatorService: PageTranslatorServiceName;
  textTranslatorService: TextTranslatorServiceName;
  textToSpeechService: TextToSpeechServiceName;
  enabledServices: TextTranslatorServiceName[];
  ttsSpeed: number | string;
  ttsVolume: number | string;
  targetLanguage: string | null;
  targetLanguageTextTranslation: string | null;
  targetLanguages: string[];
  alwaysTranslateSites: string[];
  neverTranslateSites: string[];
  sitesToTranslateWhenHovering: string[];
  langsToTranslateWhenHovering: string[];
  alwaysTranslateLangs: string[];
  neverTranslateLangs: string[];
  customDictionary: Map<string, string>;
  showTranslatePageContextMenu: ToggleSetting;
  showTranslateSelectedContextMenu: ToggleSetting;
  showButtonInTheAddressBar: ToggleSetting;
  showOriginalTextWhenHovering: ToggleSetting;
  showTranslateSelectedButton: ToggleSetting;
  whenShowMobilePopup: MobilePopupSetting;
  useOldPopup: ToggleSetting;
  darkMode: ThemeSetting;
  popupBlueWhenSiteIsTranslated: ToggleSetting;
  popupPanelSection: number;
  showReleaseNotes: ToggleSetting;
  dontShowIfIsNotValidText: ToggleSetting;
  dontShowIfPageLangIsTargetLang: ToggleSetting;
  dontShowIfPageLangIsUnknown: ToggleSetting;
  dontShowIfSelectedTextIsTargetLang: ToggleSetting;
  dontShowIfSelectedTextIsUnknown: ToggleSetting;
  hotkeys: Record<string, string | undefined>;
  expandPanelTranslateSelectedText: ToggleSetting;
  translateTag_pre: ToggleSetting;
  enableIframePageTranslation: ToggleSetting;
  dontSortResults: ToggleSetting;
  translateDynamicallyCreatedContent: ToggleSetting;
  autoTranslateWhenClickingALink: ToggleSetting;
  translateSelectedWhenPressTwice: ToggleSetting;
  translateTextOverMouseWhenPressTwice: ToggleSetting;
  translateClickingOnce: ToggleSetting;
  enableDiskCache: ToggleSetting;
  useAlternativeService: ToggleSetting;
  customServices: CustomService[];
  showMobilePopupOnDesktop: ToggleSetting;
  popupMobileKeepOnScren: ToggleSetting;
  popupMobilePosition: PopupMobilePosition;
  addPaddingToPage: ToggleSetting;
  proxyServers: ProxyServers;
  lastTimeShowingReleaseNotes: number | null;
  installDateTime: number | null;
  originalUserAgent: string | null;
  deepl_confirmed: ToggleSetting;
  authorizationToOpenOptions: string | null;
}

export type ConfigName = keyof ConfigStore;
export type ArrayConfigName =
  | 'alwaysTranslateSites'
  | 'neverTranslateSites'
  | 'sitesToTranslateWhenHovering'
  | 'langsToTranslateWhenHovering'
  | 'alwaysTranslateLangs'
  | 'neverTranslateLangs';
export type MapConfigName = {
  [K in ConfigName]: ConfigStore[K] extends Map<string, string> ? K : never;
}[ConfigName];

export type PersistedConfigValue<K extends ConfigName> =
  ConfigStore[K] extends Map<string, string>
    ? Record<string, string>
    : ConfigStore[K];

export type PersistedConfigStore = {
  [K in ConfigName]: PersistedConfigValue<K>;
};

export type ConfigObserver = <K extends ConfigName>(
  name: K,
  value: ConfigStore[K],
) => void;

export interface TwpConfigApi {
  onReady(callback?: (() => void) | null): Promise<void>;
  get<K extends ConfigName>(name: K): ConfigStore[K];
  set<K extends ConfigName>(name: K, value: ConfigStore[K]): void;
  export(): string;
  import(configJSON: string): void;
  restoreToDefault(): void;
  onChanged(callback: ConfigObserver): void;
  addSiteToTranslateWhenHovering(hostname: string): void;
  removeSiteFromTranslateWhenHovering(hostname: string): void;
  addLangToTranslateWhenHovering(lang: string): void;
  removeLangFromTranslateWhenHovering(lang: string): void;
  addSiteToAlwaysTranslate(hostname: string): void;
  removeSiteFromAlwaysTranslate(hostname: string): void;
  addSiteToNeverTranslate(hostname: string): void;
  addKeyWordTocustomDictionary(key: string, value: string): void;
  removeSiteFromNeverTranslate(hostname: string): void;
  removeKeyWordFromcustomDictionary(keyWord: string): void;
  addLangToAlwaysTranslate(lang: string, hostname?: string): void;
  removeLangFromAlwaysTranslate(lang: string): void;
  addLangToNeverTranslate(lang: string, hostname?: string): void;
  removeLangFromNeverTranslate(lang: string): void;
  setTargetLanguage(lang: string, forTextToo?: boolean): void;
  setTargetLanguageTextTranslation(lang: string): void;
  swapPageTranslationService(): PageTranslatorServiceName;
}
