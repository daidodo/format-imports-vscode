<!-- markdownlint-configure-file
{
  "no-inline-html": {
    "allowed_elements": ["img"]
  }
}
-->

# JS/TS Import/Export Sorter <!-- omit in toc -->

Automatically format **imports** and **exports** for **JavaScript** and **TypeScript** in VSCode.

- [Install Plugin](https://marketplace.visualstudio.com/items?itemName=dozerg.tsimportsorter)
- [Open Issues](https://github.com/daidodo/tsimportsorter/issues)

## [7.0] Release Notes

### Added

- Config `wrappingStyle` which can be either a preset style `"prettier"` or an object of:
  - `maxBindingNamesPerLine`
  - `maxDefaultAndBindingNamesPerLine`
  - `maxExportNamesPerLine`
  - `maxNamesPerWrappedLine`

### Removed

- Top level config:
  - `maxBindingNamesPerLine`
  - `maxDefaultAndBindingNamesPerLine`
  - `maxExportNamesPerLine`
  - `maxNamesPerWrappedLine`

# Table of contents <!-- omit in toc -->

- [Features](#features)
- [How to use](#how-to-use)
- [Extension Settings](#extension-settings)
- [Configuration](#configuration)
  - [ESLint Compatibility](#eslint-compatibility)
- [Contribution](#contribution)
- [Thanks](#thanks)
- [License](#license)

# Features

- Auto format imports and exports on save, or manually from command, shortcut or context menu.
- Group and sort imports by [custom rules](https://github.com/daidodo/format-imports/blob/main/README.md#grouping-rules), including [sort by paths or names](https://github.com/daidodo/format-imports/blob/main/docs/interfaces/configuration.md#sortimportsby).
- Remove duplicated and unused names with [configurable exceptions](https://github.com/daidodo/format-imports/blob/main/README.md#unused-imports-removal).
- [Ignore files or declarations](https://github.com/daidodo/format-imports/blob/main/README.md#ignoring-files-or-declarations) by config or inline comments.
- Respect [ESLint](https://eslint.org) and [eslint-plugin-import](https://github.com/benmosher/eslint-plugin-import) rules.
- Respect configs from [Prettier](https://prettier.io), [EditorConfig](https://editorconfig.org) and VS Code editor settings.
- Preserve `'use strict'`, `///` directives, shebang (`#!`) and comments.
- Support [Type-Only imports/exports](https://devblogs.microsoft.com/typescript/announcing-typescript-3-8/#type-only-imports-exports).
- Support multi-root projects.

# How to use

- Auto format on save when `autoFormat` is set to `onSave` (this is the default).
- Press shortcut keys, default to `Alt+Shift+S`.
- Use `Sort Imports/Exports` command in the Command Palette (`Ctrl+Shift+P`).

  <img width="600" alt="1" src="https://user-images.githubusercontent.com/8170176/80916196-24598200-8d4f-11ea-99f5-208f46a9dcb5.png">

- Right click on editor content and select `Sort Imports/Exports`.

  <img width="350" alt="image" src="https://user-images.githubusercontent.com/8170176/80916268-874b1900-8d4f-11ea-97de-f18c52bb54c6.png">

# Extension Settings

All VS Code settings under `"tsImportSorter"` section and their default values:

```json
// Configuration file name.
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
"tsImportSorter.configuration.groupRules": [
  "^react(-dom)?$",
  "^@angular/",
  "^vue$",
  {},
  "^[@]",
  "^[.]"
],

// Sorting rule for import paths. Valid values are 'none' or string array.
"tsImportSorter.configuration.sortRules.paths": ["_", "aA"],

// Sorting rule for imported/exported names. Valid values are 'none' or string array.
"tsImportSorter.configuration.sortRules.names": ["_", "aA"],

// By default all unused imports are removed. Keep some or all them around with this setting if you need.
"tsImportSorter.configuration.keepUnused": [],

// Max binding names per line before wrapping for imports. 0 for no limit.
"tsImportSorter.configuration.wrappingStyle.maxBindingNamesPerLine": 1,

// Max default and binding names per line before wrapping for imports. 0 for no limit.
"tsImportSorter.configuration.wrappingStyle.maxDefaultAndBindingNamesPerLine": 2,

// Max binding names per line before wrapping for exports. 0 for no limit.
"tsImportSorter.configuration.wrappingStyle.maxExportNamesPerLine": 0,

// Max names on wrapped lines. 0 for no limit.
"tsImportSorter.configuration.wrappingStyle.maxNamesPerWrappedLine": 1,

// Number of empty lines between groups (NOT sub-groups).
"tsImportSorter.configuration.emptyLinesBetweenGroups": 1,

// Number of empty lines after the last import declaration.
"tsImportSorter.configuration.emptyLinesAfterAllImports": 1,

// Whether to remove the last slash when normalizing paths.
"tsImportSorter.configuration.removeLastSlashInPath": false,

// Whether to remove the last 'index' when normalizing paths.
"tsImportSorter.configuration.removeLastIndexInPath": false,

// Whether to enable debug mode and print detailed logs to the output channel.
"tsImportSorter.configuration.development.enableDebug": false,
```

# Configuration

JS/TS Import/Export Sorter reads configurations from the following sources (in precedence from high to low):

- [ESLint configuration](https://eslint.org/docs/user-guide/configuring) if installed.
- `"importSorter"` section in `package.json`
- `import-sorter.json` (File name is configurable)
- [Prettier configuration](https://github.com/prettier/prettier-vscode#configuration) if installed
- `.editorconfig`
- VS Code `"editor"` and `"files"` settings
- VS Code `"tsImportSorter"` settings

Please refer to [Configuration](https://github.com/daidodo/format-imports/blob/main/docs/interfaces/configuration.md) interface for all fields can be set in `import-sorter.json` and `package.json` under `"importSorter"` section.

## ESLint Compatibility

If installed, [ESLint](https://eslint.org) and plugins rules will be detected and consulted, so that the result code will comply to the lint rules.

For more info about how it works, please check the [ESLint Compatibility](https://github.com/daidodo/format-imports/wiki/ESLint-Compatibility) wiki.

# Contribution

This is an open source project so your contribution will be well appreciated.

Please refer to [CONTRIBUTING.md](CONTRIBUTING.md) for more information.

# Thanks

The initiative came from [import-sorter](https://github.com/SoominHan/import-sorter).

# License

MIT © Zhao DAI <daidodo@gmail.com>
