declare const twpLang: {
  fixTLanguageCode(langCode: string | null | undefined): string | null;
  codeToLanguage(langCode: string): string;
  getAlternativeService(
    serviceName: string,
    langCode: string | null | undefined,
  ): string | null;
  isRtlLanguage(langCode: string): boolean;
};

declare const twpI18n: {
  getMessage(
    messageName: string,
    substitutions?: string | string[] | null,
  ): string;
  updateUiMessages(temporaryLanguage?: string | null): Promise<void>;
  translateDocument(root?: Document | ShadowRoot): void;
};

declare const platformInfo: {
  isMobile: {
    Android: RegExpMatchArray | null;
    BlackBerry: RegExpMatchArray | null;
    iOS: RegExpMatchArray | null;
    Opera: RegExpMatchArray | null;
    Windows: RegExpMatchArray | null;
    any: boolean | RegExpMatchArray | null;
  };
  isDesktop: {
    any: boolean;
    Firefox: boolean;
  };
  isFirefox: boolean;
  isOpera: RegExpMatchArray | null;
};

declare const translationService: unknown;
declare const translationCache: unknown;
declare const textToSpeech: unknown;

declare function checkedLastError(): void;
declare function tabsCreate(url: string, callback?: () => void): void;

export {};
