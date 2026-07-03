const js = require('@eslint/js');
const globals = require('globals');
const jsdoc = require('eslint-plugin-jsdoc');

const extensionGlobals = {
  ...globals.browser,
  ...globals.serviceworker,
  ...globals.webextensions,
  browser: 'readonly',
  chrome: 'readonly',
  platformInfo: 'readonly',
  tabsCreate: 'readonly',
  textToSpeech: 'readonly',
  translationCache: 'readonly',
  translationService: 'readonly',
  twpConfig: 'readonly',
  twpI18n: 'readonly',
  twpLang: 'readonly',
  checkedLastError: 'readonly',
};

const publicScriptGlobalPattern =
  '^(checkedLastError|disableDarkMode|enableDarkMode|platformInfo|tabsCreate|textToSpeech|translationCache|translationService|translateSelected|showTranslated|twpConfig|twpI18n|twpLang)$';

module.exports = [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'src/_locales/**',
      'src/lib/polyfill.js',
      'src/w3css/**',
    ],
  },
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'script',
      globals: extensionGlobals,
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-async-promise-executor': 'off',
      'no-case-declarations': 'off',
      'no-constant-condition': 'off',
      'no-empty': 'off',
      'no-fallthrough': 'off',
      'no-global-assign': 'off',
      'no-misleading-character-class': 'off',
      'no-redeclare': 'off',
      'no-undef': 'off',
      'no-useless-assignment': 'off',
      'no-useless-escape': 'off',
      'no-unused-vars': [
        'warn',
        {
          args: 'none',
          caughtErrors: 'none',
          ignoreRestSiblings: true,
          varsIgnorePattern: publicScriptGlobalPattern,
        },
      ],
    },
  },
  {
    files: ['src/lib/config.js'],
    plugins: {
      jsdoc,
    },
    rules: {
      'jsdoc/check-alignment': 'error',
      'jsdoc/check-param-names': 'error',
      'jsdoc/check-property-names': 'error',
      'jsdoc/check-syntax': 'error',
      'jsdoc/check-tag-names': 'error',
      'jsdoc/check-types': 'error',
      'jsdoc/no-undefined-types': 'error',
      'jsdoc/require-description': 'off',
      'jsdoc/require-param-description': 'off',
      'jsdoc/require-property-description': 'off',
      'jsdoc/require-returns-description': 'off',
    },
  },
  {
    files: ['eslint.config.js', 'gulpfile.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'script',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-redeclare': 'off',
      'no-unused-vars': [
        'warn',
        {
          args: 'none',
          caughtErrors: 'none',
          ignoreRestSiblings: true,
          varsIgnorePattern: publicScriptGlobalPattern,
        },
      ],
    },
  },
];
