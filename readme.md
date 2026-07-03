# <img src="https://github.com/FilipePS/Traduzir-paginas-web/blob/master/src/icons/icon-128.png" height="50"> Translate Web Pages

Translate pages in place with Google, Bing, or Yandex without opening a separate tab.

[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/FilipePS/Traduzir-paginas-web?label=latest%20version&sort=semver)](https://github.com/FilipePS/Traduzir-paginas-web/releases)
[![GitHub release date](https://img.shields.io/github/release-date/FilipePS/Traduzir-paginas-web?labely)](https://github.com/FilipePS/Traduzir-paginas-web/latest)
[![GitHub issues](https://img.shields.io/github/issues/FilipePS/Traduzir-paginas-web?color=red)](https://github.com/FilipePS/Traduzir-paginas-web/issues)
[![GitHub license](https://img.shields.io/github/license/FilipePS/Traduzir-paginas-web?color=lightgrey)](https://github.com/FilipePS/Traduzir-paginas-web/blob/master/LICENSE)

## What it does

- Translates full pages without leaving the current site.
- Supports multiple translation engines.
- Includes popup, options UI, background scripts, and content scripts for desktop and mobile flows.
- Ships Firefox and Chromium builds from the same source tree.

## Install

### Firefox

- Desktop: install from [Mozilla Add-ons](https://addons.mozilla.org/firefox/addon/traduzir-paginas-web/).
- Android:
  1. Install Firefox 120 or newer.
  2. Open the extension manager.
  3. Tap **Find more add-ons**.
  4. Search for **TWP**.
  5. Install **TWP - Translate For Mobile**.

### Chrome, Edge, and Brave

- Official store distribution is not currently listed here.
- Local development and packaged Chromium builds are supported from this repository.

## Development

### Requirements

- Node.js
- `pnpm` 11.x

### Install dependencies

```sh
pnpm install
```

### Load the extension for local debugging

- Firefox: load the `src/` directory as a temporary add-on.
- Chromium browsers: load `src/` as an unpacked extension if you want to test without the legacy compatibility build step.

The `src/` directory is the editable extension source. It already contains the generated
`src/lib/polyfill.js` bundle checked into the repository.

## Build

### Rebuild the polyfill bundle

The root [`polyfill.js`](./polyfill.js) file is the source entry. Webpack bundles it into
`src/lib/polyfill.js`.

```sh
pnpm polyfill
```

### Build distributable extension packages

```sh
pnpm build
```

This runs the Gulp pipeline and produces:

- Firefox build output in `build/TWP_<version>_Firefox`
- Firefox self-hosted build output in `build/TWP_<version>_Firefox_selfhosted`
- Chromium build output in `build/TWP_<version>_Chromium`
- Zip archives in `build/`

### Build with local source maps

```sh
pnpm build:local-sourcemaps
```

Use this when you want source maps stored locally in the build output instead of pointing at the
remote GitHub-hosted source map repository.

### Build and sign a Chromium package

```sh
pnpm build:sign
```

This opens a file picker for the signing key and writes a `.crx` package for the Chromium build.

## Quality checks

```sh
pnpm typecheck
pnpm format:check
```

## Project layout

- `src/`: extension source, manifests, pages, scripts, locales, and checked-in assets
- `src/manifest.json`: Firefox manifest
- `src/chrome_manifest.json`: Chromium manifest variant
- `src/lib/polyfill.js`: generated polyfill bundle used by the extension
- `extra/`: helper scripts that are not part of the extension build
- `build/`: generated output

## Screenshots

|                                           Menu 1                                            |                                           Menu 2                                            |                                         Translated                                          |
| :-----------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------: |
| <img src="https://addons.mozilla.org/user-media/previews/full/258/258434.png" height="200"> | <img src="https://addons.mozilla.org/user-media/previews/full/258/258435.png" height="200"> | <img src="https://addons.mozilla.org/user-media/previews/full/258/258436.png" height="200"> |

## Contributing

- UI translation contributions are handled through [Crowdin](https://crowdin.com/project/translate-web-pages).
- Code contributions should preserve the checked-in polyfill flow and browser-specific manifest setup.

## Privacy

The extension does not collect user data. To perform translations, page content is sent to the
selected translation provider. See [PRIVACY](./PRIVACY).

## Limitations

Some browser-owned pages cannot be translated, including
[support.mozilla.org](https://support.mozilla.org/) and
[addons.mozilla.org](https://addons.mozilla.org/), because the browser blocks extension access on
those origins.

## Donations

Support the project on [Patreon](https://www.patreon.com/filipeps).

[<img src="https://github.com/FilipePS/Traduzir-paginas-web/blob/master/src/icons/patreon.png" alt="Patreon" height="50">](https://www.patreon.com/filipeps)
