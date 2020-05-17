<!-- markdownlint-configure-file
{
  "no-inline-html": {
    "allowed_elements": ["img"]
  }
}
-->

# JS/TS Import/Export Sorter

Automatically format **imports** and **exports** for **JavaScript** and **TypeScript** in VSCode.

- [Install Plugin](https://marketplace.visualstudio.com/items?itemName=dozerg.tsimportsorter)
- [Open Issues](https://github.com/daidodo/tsimportsorter/issues)

## Release Notes for 2.1

- Support keeping unused imports.
- Config changes:
  - Add `"keepUnused"`.

## Features

- Auto format imports and exports on save, or manually format with command, shortcut or context menu.
- Merge imports or exports if possible, and remove duplicated names.
- Delete unused import names with configurable exceptions, correctly handle `React` ([React](https://reactjs.org)) and `h` ([Stencil](https://stenciljs.com/)).
- Group and sort imports by customizable rules.
- Sort binding names in imports and exports.
- Support multi-root projects.
- Ignore specific files, imports or exports.
- Preserve `'use strict'`, `///` directives, shebang (`#!`) and global comments, e.g. license.
- Keep comments with imports or exports when moving.
- Respect configs from [Prettier](https://prettier.io), [EditorConfig](https://editorconfig.org) and VS Code editor settings.

## How to use

- Auto format on save when `autoFormat` is set to `onSave` (this is the default).
- Press shortcut keys, default to `Alt+Shift+S`.
- Use `Sort Imports/Exports` command in the Command Palette (`Ctrl+Shift+P`).

    <img width="600" alt="1" src="https://user-images.githubusercontent.com/8170176/80916196-24598200-8d4f-11ea-99f5-208f46a9dcb5.png">

- Right click on editor content and select `Sort Imports/Exports`.

    <img width="350" alt="image" src="https://user-images.githubusercontent.com/8170176/80916268-874b1900-8d4f-11ea-97de-f18c52bb54c6.png">

## Extension Settings

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
"tsImportSorter.configuration.maxBindingNamesPerLine": 1,

// Max default and binding names per line before wrapping for imports. 0 for no limit.
"tsImportSorter.configuration.maxDefaultAndBindingNamesPerLine": 2,

// Max binding names per line before wrapping for exports. 0 for no limit.
"tsImportSorter.configuration.maxExportNamesPerLine": 0,

// Max names on wrapped lines. 0 for no limit.
"tsImportSorter.configuration.maxNamesPerWrappedLine": 1,
```

## Configuration

JS/TS Import/Export Sorter reads configurations from the following sources (in precedence from high to low):

- `"importSorter"` section in `package.json`
- `import-sorter.json` (configurable)
- [Prettier configuration](https://github.com/prettier/prettier-vscode#configuration) if installed
- `.editorconfig`
- VS Code `"editor"` and `"files"` settings
- VS Code `"tsImportSorter"` settings

Here are all configs in `package.json` under `"importSorter"` section and their default values:

```javascript
{
  "importSorter": {
    // When to auto format imports/exports. Valid values are 'off' or 'onSave'.
    "autoFormat": "onSave",

    // Whether to format exports as well.
    "formatExports": true,

    // Disable formatting for files matching regular expressions.
    "exclude": ["node_modules"],

    // Disable formatting for files matching glob patterns.
    "excludeGlob": [],

    // Grouping rules for path patterns for imports. {} is the fall-back group.
    "groupRules": ["^react(-dom)?$", "^@angular/", "^vue$", {}, "^[@]", "^[.]"],

    "sortRules": {
      // Sorting rule for import paths. Valid values are 'none' or string array.
      "paths": ["_", "aA"],

      // Sorting rule for imported/exported names. Valid values are 'none' or string array.
      "names": ["_", "aA"]
    },

    // By default all unused imports are removed. Keep some or all them around with this setting if you need.
    "keepUnused": [],

    // Max line length before wrapping. 0 for no limit.
    "maxLineLength": 80,

    // Max binding names per line before wrapping for imports. 0 for no limit.
    "maxBindingNamesPerLine": 1,

    // Max default and binding names per line before wrapping for imports. 0 for no limit.
    "maxDefaultAndBindingNamesPerLine": 2,

    // Max binding names per line before wrapping for exports. 0 for no limit.
    "maxExportNamesPerLine": 0,

    // Max names on wrapped lines. 0 for no limit.
    "maxNamesPerWrappedLine": 1,

    // Number of spaces to replace a TAB.
    "tabSize": 2,

    // Indent lines with tabs or spaces. Valid values are 'tab' or 'space'.
    "tabType": "space",

    // Use single or double quotes. Valid values are 'single' or 'double'.
    "quoteMark": "single",

    // When to add trailing a comma for the last name. Valid values are 'none' or 'multiLine'.
    "trailingComma": "multiLine",

    // Whether to add semicolons at the end of statements.
    "hasSemicolon": true,

    // Whether to end files with a new line.
    "insertFinalNewline": true,

    // Whether to add spaces between brackets. true for '{ id }' and false for '{id}'.
    "bracketSpacing": true
  }
}
```

`import-sorter.json` has all configs above. Example:

```json
{
  "maxLineLength": 100,
  "quoteMark": "double",
  "tabSize": 4,
  "insertFinalNewline": false
}
```

### Multi-root projects support

JS/TS Import/Export Sorter respects [VS Code user and workspace settings](https://code.visualstudio.com/docs/getstarted/settings) and supports [multi-root workspaces](https://code.visualstudio.com/docs/editor/multi-root-workspaces).

`package.json` is searched in the following order:

- The same folder of the edited file.
- If not found, then go to the parent folder.
- Continue if still not found, till the root folder (`/`)

`import-sorter.json` is searched in a similar way if it's a relative path.

No search is needed if `"tsImportSorter.configuration.configurationFileName"` is an absolute path, e.g. `/path/to/import-sorter.json` or `C:\path\to\import-sorter.json`.

### Ignore files or import/export declarations

There are a few ways to exclude files from inspection:

1. Add path patterns to `exclude` or `excludeGlob` in user or workspace settings in VSCode.
  
    ```json
    "tsImportSorter.configuration.exclude": ["regexPattern"],
    "tsImportSorter.configuration.excludeGlob": ["globPattern"],
    ```

2. Add path patterns to `package.json` or `import-sorter.json`.

    - _All path patterns are **merged** together instead of overwritten._
    - _Use **forward-slash** (`/`) as path separator no matter in MacOS, *nix or Windows._

3. Add the following comment at the beginning of the source file and keep at least one empty line from the next statement:

```ts
// ts-import-sorter: disable

[Other code]
```

or

```ts
/* ts-import-sorter: disable */

[Other code]
```

_Note:_

- _Excluded paths and file disable-comments are **ignored** if the formatting is triggered manually, i.e. from Command Palette, editor context menu or shortcut._

To exclude a specific `import` or `export` declaration from formatting, please add the following as its leading or trailing comments:

```ts
// ts-import-sorter: disable
import Excluded from 'import/sorter';
```

or

```ts
export { Excluded } from 'import/sorter'; /* ts-import-sorter: disable */
```

To disable formatting for all exports, just set `"formatExports": false` in the config.

### Maximum names per line

Whether to wrap an `import` statement is decided by `maxBindingNamesPerLine` and `maxDefaultAndBindingNamesPerLine`, as well as `maxLineLength`.

Whether to wrap an `export` statement is decided by `maxExportNamesPerLine`, as well as `maxLineLength`.

#### `maxBindingNamesPerLine`

For a statement importing only *binding names*, this value determines how many names are allowed before wrapping.

For example, if you set:

```json
"maxBindingNamesPerLine": 2,
```

then

```typescript
import { A } from 'a';    // No wrap as there is 1 name
import { B, C } from 'b'; // No wrap as there are 2 names

import {
  D,
  E,
  F,
} from 'c';   // Wrapped as there are more than 2 names
```

#### `maxDefaultAndBindingNamesPerLine`

For a statement importing *default* and *binding names*, this value determines how many names are allowed before wrapping.

For example, if you set:

```json
"maxDefaultAndBindingNamesPerLine": 2,
```

then

```typescript
import A from 'a';        // No wrap as there is 1 name
import B, { C } from 'b'; // No wrap as there are 2 names
import D, {
  E,
  F,
} from 'c'; // Wrapped as there are more than 2 names
```

#### `maxExportNamesPerLine`

For `export {}` or `export {} from 'x'` statements, this value determines how many names are allowed before wrapping.

For example, if you set:

```json
"maxExportNamesPerLine": 2,
```

then

```typescript
export { A };             // No wrap as there is 1 name
export { B, C } from 'b'; // No wrap as there are 2 names
export {
  D,
  E,
  F,
} from 'c'; // Wrapped as there are more than 2 names
```

#### `maxNamesPerWrappedLine`

If an import/export statement is wrapped, this value decides how many names there are per line.

For example, if you set:

```json
"maxNamesPerWrappedLine": 2,
```

then

```typescript
import {
  A, B,
  C, D,
  E,
} from 'a'; // There are 2 names at most per wrapped line

export {
  A, B,
  C, D,
  E,
}; // There are 2 names at most per wrapped line
```

### Grouping Rules

JS/TS Import/Export Sorter can put imports into different groups separated by a blank line, based on the rules defined in `groupRules`.

Each grouping rule applies to either:

- Script imports, e.g. `import 'some/scripts'`, or
- Non-script imports, e.g. `import React, { FC } from 'react'`.

A grouping rule defines:

- Type of imports to apply: Script or non-script imports.
- Path pattern to match.
- [Sorting Rules](https://github.com/daidodo/tsimportsorter/wiki/Sorting-Rules) for paths and names within the group.
- Sub-groups to further adjust the order of imports.

_Notes:_

- _There are NO blank lines between sub-groups._
- _If you don't want blank lines between groups, the right way is to move groups to sub-groups._

For example, `"groupRules": ["^react$", {}, "^[.]"]` defines 3 groups (and their order):

- `"^react$"`: matches any *non-script* imports from exact path `"react"`.
- `{}`: is the fall-back group, i.e. any imports that don't match any other groups will fall into this group.
- `"^[.]"`: matches any *non-script* imports from paths starting with `"."`.

The following is an example of the results:

```ts
import React from 'react';

import { TextDocument } from 'vscode';

import MyInput from './MyInput';
```

_Notes:_

- _By default, script imports are in the first group if you don't explicitly define rules for them._
- _You can define a grouping rule for script imports via, e.g. `{"flag": "scripts", "regex": "[.]css$"}`._
- _Exports will NOT be grouped. Grouping Rules are only for imports._

For a complete guide, please refer to [the Wiki](https://github.com/daidodo/tsimportsorter/wiki/Grouping-Rules).

### Sorting Rules

You can customize sorting rules for all imports and exports, or imports within a group, on:

- How to compare import paths;
- How to compare imported/exported names;

_Note:_

- _Exports will NOT be sorted based on paths. Only names within an export are sorted._

You can decide:

- Whether to compare letters case-sensitively or -insensitively;
- The rank among lower-case letters, upper-case letters and `'_'`;

Here is an example:

```json
"sortRules": {
  "paths": ["_", "aA"],
  "names": ["_", "aA"]
}
```

The above `["_", "aA"]` means:

- Strings are compared case-insensitively, and lower-case goes first in case of a tie.
- `[`, `\`, `]`, `^`, `_` and `` ` ``(backtick) are in front of letters (`[a-zA-Z]`).

A sorted array might be `['_', 'a', 'A', 'b', 'B']`.

You can also disable sorting by specifying `"none"` in `sortRules`, e.g.:

```json
"sortRules": {
  "paths": "none",
  "names": "none"
}
```

If you set `paths` to `"none"`, import statements will not be sorted.

If you set `names` to `"none"`, names will not be sorted within an import or export statement.

_Note:_

- _Setting `paths` or `names` to `null` doesn't disable sorting but uses the fall-back sorting rules, i.e. `["AZ", "_", "az"]`._

For more details and how to construct your own rules, please read [the Wiki](https://github.com/daidodo/tsimportsorter/wiki/Sorting-Rules).

### Unused Imports Removal

By default all unused imports are removed. In some cases you might want to keep the import even if it's unused. For example to keep `import tw from 'twin.macro'`  you can do the following:

```json
"keepUnused": ["twin.macro"]
```

This is equivalent to a more verbose version:

```json
"keepUnused": [{ "path": "twin.macro" }]
```

Another example is `import styled, { css } from 'styled-components'` and if you want to keep `css` import while `styled` is removed if unused, you can achieve that with the following configuration:

```json
"keepUnused": [
  { "path": "styled-components", "names": ["css"] }
]
```

Both `path` and `names` are converted to regular expressions so you can get really wild here.

## Thanks

The initiative came from [import-sorter](https://github.com/SoominHan/import-sorter).

## License

MIT
