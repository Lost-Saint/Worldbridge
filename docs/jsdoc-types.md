# JSDoc Type Checking

This repository is plain JavaScript.

- keep source files in `.js`
- add `// @ts-check` to files you want the TypeScript checker to enforce
- use JSDoc for types
- keep shared shapes in declaration files instead of repeating unions inline

## Commands

```sh
pnpm typecheck
pnpm lint
pnpm lint:fix
```

## Shared Type Sources

- [`src/types/config.d.ts`](../src/types/config.d.ts): single source of truth for config keys and
  config value types
- [`src/types/runtime-globals.d.ts`](../src/types/runtime-globals.d.ts): ambient declarations for
  globals shared across extension scripts

## File Pattern

```js
// @ts-check

/** @typedef {import('../types/config').ConfigName} ConfigName */
/** @typedef {import('../types/config').TwpConfigApi} TwpConfigApi */
```

Use local JSDoc imports for file-specific types. If a shape is reused across files, add it to
`src/types/*.d.ts` instead of duplicating it.

## Single Source Of Truth Rule

When a config key, payload shape, or helper contract is used in more than one place, define it once
in `src/types/` or in the owning module and reference it from there. Do not repeat large string
unions or object shapes inline across multiple files.
