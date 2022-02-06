<!-- markdownlint-configure-file
{
  "no-inline-html": {
    "allowed_elements": ["img"]
  }
}
-->

# JS/TS Import/Export Sorter <!-- omit in toc -->

[![Version](https://vsmarketplacebadge.apphb.com/version-short/dozerg.tsimportsorter.svg)](https://marketplace.visualstudio.com/items?itemName=dozerg.tsimportsorter) &nbsp; [![Installs](https://vsmarketplacebadge.apphb.com/installs/dozerg.tsimportsorter.svg)](https://marketplace.visualstudio.com/items?itemName=dozerg.tsimportsorter) &nbsp; [![Ratings](https://vsmarketplacebadge.apphb.com/rating-star/dozerg.tsimportsorter.svg)](https://marketplace.visualstudio.com/items?itemName=dozerg.tsimportsorter)

Automatically format **imports** and **exports** for **JavaScript** and **TypeScript** in VSCode.

- [Install Plugin](https://marketplace.visualstudio.com/items?itemName=dozerg.tsimportsorter)
- [Open Issues](https://github.com/daidodo/format-imports-vscode/issues)

## [7.4.x]

### Added

- Support formatting [Import Assertions](https://devblogs.microsoft.com/typescript/announcing-typescript-4-5/#import-assertions).
- Add `root` config to support monorepo projects.
- Add `preserve` option for `insertFinalNewline` config.
- Add `ignoreESLintRules` config to ignore specific ESLint rules.
- Add `always` option for `trailingComma` config.
- Support ESLint [eol-last](https://eslint.org/docs/rules/eol-last), [semi](https://eslint.org/docs/rules/semi) and [comma-dangle](https://eslint.org/docs/rules/comma-dangle) rules.
- Support `type` [modifiers](https://devblogs.microsoft.com/typescript/announcing-typescript-4-5/#type-on-import-names) on import names

### Changed

- Update default `GroupRules` to group [`node:` imports](https://nodejs.org/api/esm.html#esm_node_imports) separately.
- Fix Prettier option `"trailingComma": "es5"`.

# Table of contents <!-- omit in toc -->

- [Features](#features)
- [How to use](#how-to-use)
- [Configuration](#configuration)
  - [VSCode Settings](#vscode-settings)
  - [Config Files](#config-files)
- [ESLint Compatibility](#eslint-compatibility)
- [Monorepo Support](#monorepo-support)
- [Contribution](#contribution)
- [Thanks](#thanks)
- [License](#license)

# Features

- Auto format imports and exports on save or [code actions](https://code.visualstudio.com/docs/languages/javascript#_code-actions-on-save), or manually from command, shortcut or context menu.
- Group and sort imports by [custom rules](https://github.com/daidodo/format-imports/blob/main/README.md#grouping-rules), including [sort by paths or names](https://github.com/daidodo/format-imports/blob/main/docs/interfaces/Configuration.md#sortimportsby).
- Remove duplicated and unused names with [configurable exceptions](https://github.com/daidodo/format-imports/blob/main/README.md#keeping-unused-imports).
- [Ignore files or declarations](https://github.com/daidodo/format-imports/blob/main/README.md#ignoring-files-or-declarations) by config or inline comments.
- Respect [ESLint](https://eslint.org) and [eslint-plugin-import](https://github.com/benmosher/eslint-plugin-import) rules.
- Respect configs from [Prettier](https://prettier.io), [EditorConfig](https://editorconfig.org) and VS Code editor settings.
- Preserve `'use strict'`, `///` directives, shebang (`#!`) and comments.
- Support [Type-Only imports/exports](https://devblogs.microsoft.com/typescript/announcing-typescript-3-8/#type-only-imports-exports), [Type Modifier on names](https://devblogs.microsoft.com/typescript/announcing-typescript-4-5/#type-on-import-names) and [Import Assertions](https://devblogs.microsoft.com/typescript/announcing-typescript-4-5/#import-assertions).
- Support multi-root projects.

# How to use

- Auto format on save when `autoFormat` is set to `onSave` (this is the default).
- Auto format via [Code Actions on Save](https://code.visualstudio.com/docs/languages/javascript#_code-actions-on-save) (VSCode 1.44+)

  ```js
  "editor.codeActionsOnSave": ["source.organizeImports.sortImports"]
  ```

  or

  ```js
  "editor.codeActionsOnSave": {"source.organizeImports.sortImports": true}
  ```

- Press shortcut keys, default to `Alt+Shift+S`.
- Use `Sort Imports/Exports` command in the Command Palette (`Ctrl+Shift+P`).

  <img width="600" alt="1" src="https://user-images.githubusercontent.com/8170176/80916196-24598200-8d4f-11ea-99f5-208f46a9dcb5.png">

- Right click on editor content and select `Sort Imports/Exports`.

  <img width="350" alt="image" src="https://user-images.githubusercontent.com/8170176/80916268-874b1900-8d4f-11ea-97de-f18c52bb54c6.png">

# Configuration

The extension reads configurations from the following sources (in precedence from high to low):

- [ESLint configuration](https://eslint.org/docs/user-guide/configuring) if installed.
- `"importSorter"` section in `package.json`
- `import-sorter.json` (File name is configurable)
- [Prettier configuration](https://github.com/prettier/prettier-vscode#configuration) if installed
- `.editorconfig`
- VS Code `"editor"` and `"files"` settings
- VS Code `"tsImportSorter"` settings

## VSCode Settings

The following settings (and default values) are available in VSCode User Settings for this extension:

```js
// Configuration file name.
// Not available in 'import-sorter.json' or 'package.json'.
"tsImportSorter.configuration.configurationFileName": "import-sorter.json",

// When to auto format imports/exports. Valid values are 'off' or 'onSave'.
"tsImportSorter.configuration.autoFormat": "onSave",

// Whether to format exports as well.
"tsImportSorter.configuration.formatExports": true,

// Disable formatting for files matching regular expressions.
"tsImportSorter.configuration.exclude": ["node_modules"],

// Disable formatting for files matching glob patterns.
"tsImportSorter.configuration.excludeGlob": [],

// Sort import declarations by paths or first names. Valid values are 'paths' or 'names'.
"tsImportSorter.sortImportsBy": "paths",

// Grouping rules for path patterns for imports. {} is the fall-back group.
// Wiki: https://github.com/daidodo/format-imports/wiki/Grouping-Rules
"tsImportSorter.configuration.groupRules": [
  "^react(-dom)?$",
  "^@angular/",
  "^vue$",
  "^node:",
  {},
  "^[@]",
  "^[.]"
],

// Global Sorting rules. Valid values are 'none' or an object.
// Wiki: https://github.com/daidodo/format-imports/wiki/Sorting-Rules
"tsImportSorter.configuration.sortRules": {

  // Sorting rule for import paths. Valid values are 'none' or an array.
  "paths": ["_", "aA"],

  // Sorting rule for imported/exported names. Valid values are 'none' or an array.
  "names": ["_", "aA"]
}

// By default all unused imports are removed. Keep some or all them around with this
// setting via a list of regular expressions if you need.
// e.g. In order to keep all unused imports, use [".*"]
"tsImportSorter.configuration.keepUnused": [],

// Line wrapping style. Valid values are 'prettier' or an object.
// Wiki: https://github.com/daidodo/format-imports/wiki/Line-Wrapping-Style
"tsImportSorter.configuration.wrappingStyle": {

  // Max binding names per line before wrapping for imports. 0 for no limit.
  "maxBindingNamesPerLine": 1,

  // Max default and binding names per line before wrapping for imports. 0 for no limit.
  "maxDefaultAndBindingNamesPerLine": 2,

  // Max binding names per line before wrapping for exports. 0 for no limit.
  "maxExportNamesPerLine": 0,

  // Max names on wrapped lines. 0 for no limit.
  "maxNamesPerWrappedLine": 1,

  // Whether to ignore trailing comments when counting line length.
  "ignoreComments": false
}

// Number of empty lines between groups (NOT sub-groups).
"tsImportSorter.configuration.emptyLinesBetweenGroups": 1,

// Number of empty lines after the last import declaration.
"tsImportSorter.configuration.emptyLinesAfterAllImports": 1,

// Whether to remove the last slash when normalizing paths.
"tsImportSorter.configuration.removeLastSlashInPath": false,

// Whether to remove the last 'index' when normalizing paths.
"tsImportSorter.configuration.removeLastIndexInPath": false,

// Whether to enable debug mode and write detailed logs to VSCode output channel.
// Not available in 'import-sorter.json' or 'package.json'.
"tsImportSorter.configuration.development.enableDebug": false,
```

## Config Files

Most of the above settings, plus more in [Configuration](https://github.com/daidodo/format-imports/blob/main/docs/interfaces/Configuration.md) are also available in `import-sorter.json` or `package.json` under `"importSorter` section.

For examples:

_import-sorter.json:_

```json
{
  "autoFormat": "onSave",
  "quoteMark": "single",
  "wrappingStyle": {
    "maxBindingNamesPerLine": 2
  }
}
```

Or

_package.json:_

```json
{
  "importSorter": {
    "autoFormat": "onSave",
    "quoteMark": "single",
    "wrappingStyle": {
      "maxBindingNamesPerLine": 2
    }
  }
}
```

# ESLint Compatibility

If installed, [ESLint](https://eslint.org) and plugins rules will be detected and consulted, so that the result code will comply to the lint rules.

For how it works, please check the [ESLint Compatibility](https://github.com/daidodo/format-imports/wiki/ESLint-Compatibility) wiki.

# Monorepo Support

When reading config from `import-sorter.json` or `package.json`, Format-Imports will automatically look for them in the directory of the file to be formatted, and in successive parent directories all the way up to the root directory of the filesystem (unless `"root": true` is specified).

Multiple `import-sorter.json` or `package.json` files can be useful when you want different configurations for different sub projects of your monorepo, while common settings are kept in the root `import-sorter.json` or `package.json`. When there is a conflict, the sub project (more localized) config will take precedence.

# Contribution

This is an open source project so your contribution will be well appreciated.

Please refer to [CONTRIBUTING.md](CONTRIBUTING.md) for more information.

# Thanks

The inspiration came from [import-sorter](https://github.com/SoominHan/import-sorter).

# License

MIT © Zhao DAI <daidodo@gmail.com>
