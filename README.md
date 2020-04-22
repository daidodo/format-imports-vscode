# JS/TS Import Sorter

Automatically format imports for **JavaScript** and **TypeScript** in VSCode.
- [Install Plugin](https://marketplace.visualstudio.com/items?itemName=dozerg.tsimportsorter)
- [Open Issues](https://github.com/daidodo/tsimportsorter/issues)

## Features

- Auto format on save, or manually format with command / shortcut / context menu.
- Merge imports and remove duplicated names.
- Delete unused names, but keep `React` ([React](https://reactjs.org)) or `h` ([Stencil](https://stenciljs.com/)) if used.
- Group and sort imports by customizable rules.
- Support multi-root projects.
- Ignore specific files or imports.
- Preserve `'use strict'`, `///` directives, shebang (`#!`) and global comments, e.g. license.
- Keep comments with imports when reordering.
- Respect configs from [Prettier](https://prettier.io), [EditorConfig](https://editorconfig.org) and VS Code editor settings.

## How to use
* Auto format on save when `autoFormat` is set to `onSave` (this is the default).
* Press shortcut keys, default to `Alt+Shift+S`.
* Use `Sort Imports` command in the Command Palette (`Ctrl+Shift+P`).

<img width="600" alt="1" src="https://user-images.githubusercontent.com/8170176/77234449-674c0580-6ba6-11ea-84f4-5e02ef88a8f3.png">

* Right click on editor content and select `Sort Imports`.

<img width="300" alt="3" src="https://user-images.githubusercontent.com/8170176/77234533-1c7ebd80-6ba7-11ea-9bed-dcfadaea9bdf.png">


## Extension Settings

All VS Code settings under `"tsImportSorter"` section and their default values:

```json
// Configuration file name.
"tsImportSorter.configuration.configurationFileName": "import-sorter.json",

// When to auto format imports. Valid values are 'off' or 'onSave'.
"tsImportSorter.configuration.autoFormat": "onSave",

// Disable formatting for files matching regular expressions.
"tsImportSorter.configuration.exclude": ["node_modules"],

// Disable formatting for files matching glob patterns.
"tsImportSorter.configuration.excludeGlob": [],

// Grouping rules for path patterns. {} is the fall-back group.
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

// Sorting rule for imported names. Valid values are 'none' or string array.
"tsImportSorter.configuration.sortRules.names": ["_", "aA"],

// Max binding names per line before wrapping. 0 for no limit.
"tsImportSorter.configuration.maximumBindingNamesPerLine": 1,

// Max default and binding names per line before wrapping. 0 for no limit.
"tsImportSorter.configuration.maximumDefaultAndBindingNamesPerLine": 2,

// Max names on wrapped lines. 0 for no limit.
"tsImportSorter.configuration.maximumNamesPerWrappedLine": 1,
```

## Configuration

JS/TS Import Sorter reads configurations from the following sources (in precedence from high to low):

- `"importSorter"` section in `package.json`
- `import-sorter.json` (configurable)
- [Prettier configuration](https://github.com/prettier/prettier-vscode#configuration) if installed
- `.editorconfig`
- VS Code `"editor"` and `"files"` settings
- VS Code `"tsImportSorter"` settings

Here are all configs in `package.json` under `"importSorter"` section and their default values:

```json
{
  "importSorter": {
    // When to auto format imports. Valid values are 'off' or 'onSave'.
    "autoFormat": "onSave",

    // Disable formatting for files matching regular expressions.
    "exclude": ["node_modules"],

    // Disable formatting for files matching glob patterns.
    "excludeGlob": [],

    // Grouping rules for path patterns. {} is the fall-back group.
    "groupRules": ["^react(-dom)?$", "^@angular/", "^vue$", {}, "^[@]", "^[.]"],

    "sortRules": {
      // Sorting rule for import paths. Valid values are 'none' or string array.
      "paths": ["_", "aA"],

      // Sorting rule for imported names. Valid values are 'none' or string array.
      "names": ["_", "aA"]
    },

    // Max line length before wrapping. 0 for no limit.
    "maximumLineLength": 80,

    // Max binding names per line before wrapping. 0 for no limit.
    "maximumBindingNamesPerLine": 1,

    // Max default and binding names per line before wrapping. 0 for no limit.
    "maximumDefaultAndBindingNamesPerLine": 2,

    // Max names on wrapped lines. 0 for no limit.
    "maximumNamesPerWrappedLine": 1,

    // Number of spaces to replace a TAB.
    "tabSize": 2,

    // Indent lines with tabs or spaces. Valid values are 'tab' or 'space'.
    "tabType": "space",

    // Use single or double quotes. Valid values are 'single' or 'double'.
    "quoteMark": "single",

    // Whether to add trailing commas when multi-line. Valid values are 'none' or 'multiLine'.
    "trailingComma": "multiLine",

    // Whether to add semicolons at the ends of statements.
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
  "maximumLineLength": 100,
  "quoteMark": "double",
  "tabSize": 4,
  "insertFinalNewline": false
}
```

### Multi-root projects support

JS/TS Import Sorter respects [VS Code user and workspace settings](https://code.visualstudio.com/docs/getstarted/settings) and supports [multi-root workspaces](https://code.visualstudio.com/docs/editor/multi-root-workspaces).

`package.json` is searched in the following order:

- The same folder of the edited file.
- If not found, then go to the parent folder.
- Continue if still not found, till the root folder (`/`)

`import-sorter.json` is searched in a similar way if it's a relative path.

No search is needed if `"tsImportSorter.configuration.configurationFileName"` is an absolute path, e.g. `/path/to/import-sorter.json` or `C:\path\to\import-sorter.json`.

### Ignore files or import declarations

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
* _Excluded paths and file disable-comments are **ignored** if the formatting is triggered manually, i.e. from Command Palette, editor context menu or shortcut._

To exclude a specific `import` declaration from sorting, please add the following as its leading or trailing comments:

```ts
// ts-import-sorter: disable
import Excluded from 'import/sorter';
```

or

```ts
import Excluded from 'import/sorter'; /* ts-import-sorter: disable */
```

### Maximum names per line

When deciding whether to wrap an import statement or not, JS/TS Import Sorter looks up both `maximumLineLength` and the following values:


#### `maximumBindingNamesPerLine`

For a statement importing only *binding names*, this value determines how many names are allowed before wrapping.

For example, if you set:

```json
"maximumBindingNamesPerLine": 2,
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

#### `maximumDefaultAndBindingNamesPerLine`

For a statement importing *default* and *binding names*, this value determines how many names are allowed before wrapping.

For example, if you set:

```json
"maximumDefaultAndBindingNamesPerLine": 2,
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

#### `maximumNamesPerWrappedLine`

If an import statement is wrapped, this value decides how many names there are per line.

For example, if you set:

```json
"maximumNamesPerWrappedLine": 2,
```

then

```typescript
import {
  A, B,
  C, D,
  E,
} from 'a'; // There are 2 names at most per wrapped line
```

### Grouping Rules

JS/TS Import Sorter can put imports into different groups separated by a blank line, based on the rules defined in `groupRules`.

Each grouping rule applies to either:

- Script imports, e.g. `import 'some/scripts'`, or
- Non-script imports, e.g. `import React, { FC } from 'react'`.

A grouping rule defines:
- Type of imports to apply: Script or non-script imports.
- Path pattern to match.
- [Sorting Rules](https://github.com/daidodo/tsimportsorter/wiki/Sorting-Rules) for paths and names within the group.
- Sub-groups to further adjust the order of imports.

_Note:_
* _There is NO blank lines between sub-groups._

For example, `"groupRules": ["^react$", {}, "^[.]"]` defines 3 grouping rules (and their order):
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

For a complete guide, please refer to [the Wiki](https://github.com/daidodo/tsimportsorter/wiki/Grouping-Rules).

### Sorting Rules

You can customize sorting rules for all imports, or imports within a group, on:
* How to compare import paths;
* How to compare imported names;

You can decide:
* Whether to compare letters case-sensitively or -insensitively;
* The rank among lower-case letters, upper-case letters and `'_'`;

Here is an example:

```json
"sortRules": {
  "paths": ["_", "aA"],
  "names": ["_", "aA"]
}
```

The above `["_", "aA"]` means:
* Strings are compared case-insensitively, and lower-case goes first in case of a tie.
* `[`, `\`, `]`, `^`, `_` and `` ` ``(backtick) are in front of letters (`[a-zA-Z]`).

A sorted array might be `['_', 'a', 'A', 'b', 'B']`.

You can also disable sorting by specifying `"none"` in `sortRules`, e.g.:

```json
"sortRules": {
  "paths": "none",
  "names": "none"
}
```

If you set `paths` to `"none"`, import statements will not be sorted.

If you set `names` to `"none"`, names will not be sorted within an import statement.

_Note:_
* _Setting `paths` or `names` to `null` doesn't disable sorting but uses the fall-back sorting rules, i.e. `["AZ", "_", "az"]`._

For more details and how to construct your own rules, please read [the Wiki](https://github.com/daidodo/tsimportsorter/wiki/Sorting-Rules).

## Thanks

The initiative came from [import-sorter](https://github.com/SoominHan/import-sorter).

## License

MIT
