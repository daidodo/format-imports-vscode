# JS/TS Import Sorter

Automatically format imports for **JavaScript** and **TypeScript**. ([Install](https://marketplace.visualstudio.com/items?itemName=dozerg.tsimportsorter))

## Features

- Auto format on save, or manually format with command/shortcut/context menu.
- Auto merge imports, remove unused or duplicated names.
- Group and sort imports by customizable rules.
- Support multi-root projects.
- Ignore specific files or imports.
- Preserve `'use strict'`, `///` directives and global comments, e.g. license.
- Recognize JSX elements and keep `React` import.
- Keep comments with imports when reordering.
- Respect config from [Prettier](https://prettier.io), [EditorConfig](https://editorconfig.org) and VS Code editor settings.

### Example

Before:

```typescript
import { window } from 'vscode';
import sortImports from '../sort';
import { TextDocument } from 'vscode';
import { getEdits
 } from '@edit';
import { getDeleteEdits } from '@edit';
import { getUnusedIds
, parseSource } from '../parser';
import { TextDocumentWillSaveEvent, TextEditor, Workspace, ImportEqualsDeclaration } from 'vscode';
import loadConfig from '@config';
import ts from 'typescript';
import composeInsertSource from '../compose';
```

After:

```typescript
import ts from 'typescript';
import {
  TextDocument,
  TextDocumentWillSaveEvent,
  TextEditor,
  window,
  Workspace,
} from 'vscode';

import loadConfig from '@config';
import {
  getDeleteEdits,
  getEdits,
} from '@edit';

import composeInsertSource from '../compose';
import {
  getUnusedIds,
  parseSource,
} from '../parser';
import sortImports from '../sort';
```

_Note: Code style is configurable._

## How to use
* Auto format on save when `autoFormat` is set to `onSave` (this is default).
* Use `Sort Imports` command in the Command Palette (`Ctrl+Shift+P`).

<img width="600" alt="1" src="https://user-images.githubusercontent.com/8170176/77234449-674c0580-6ba6-11ea-84f4-5e02ef88a8f3.png">

* Right click on editor content and select `Sort Imports`.

<img width="300" alt="3" src="https://user-images.githubusercontent.com/8170176/77234533-1c7ebd80-6ba7-11ea-9bed-dcfadaea9bdf.png">

* Press shortcut keys, default `Alt+Shift+S`.



## Extension Settings

All VS Code settings under `"tsImportSorter"` section and their default values:

```json
// Configuration file name.
"tsImportSorter.configuration.configurationFileName": "import-sorter.json",

// When to auto format imports. Valid values are 'off' or 'onSave'.
"tsImportSorter.configuration.autoFormat": "onSave",

// Disable sorting for files matching regular expressions.
"tsImportSorter.configuration.exclude": [],

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

// Sorting rule for import paths.
"tsImportSorter.configuration.sortRules.paths": ["_", "aA"],

// Sorting rule for imported names.
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

Here are all config in `package.json` under `"importSorter"` section and their default values:

```json
{
  "importSorter": {
    // When to auto format imports. Valid values are 'off' or 'onSave'.
    "autoFormat": "onSave",

    // Disable sorting for files matching regular expressions.
    "exclude": [],

    // Disable formatting for files matching glob patterns.
    "excludeGlob": [],

    // Grouping rules for path patterns. {} is the fall-back group.
    "groupRules": ["^react(-dom)?$", "^@angular/", "^vue$", {}, "^[@]", "^[.]"],

    "sortRules": {
      // Sorting rule for import paths.
      "paths": ["_", "aA"],

      // Sorting rule for imported names.
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

`import-sorter.json` has all config above, too. Example:

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

If `"tsImportSorter.configuration.configurationFileName"` is an absolute path, e.g. `/path/to/import-sorter.json` or `C:\path\to\import-sorter.json`, no search is needed.

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

_Note: Exclude paths and file disable-comments are **ignored** if the formation is triggered manually, i.e. from Command Palette, editor context menu or shortcut._

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
JS/TS Import Sorter uses import path for grouping.

More details can be found in the [wiki](https://github.com/daidodo/tsimportsorter/wiki/Grouping-Rules).
#### Ex. 1: All in one group

```json
"groupRules": []  // or null
```

#### Ex. 2: Custom groups

```json
"groupRules": ["^a", "^b"]
```

Will produce:

```typescript
import A from 'axx';  // Group "^a"

import B from 'bxx';  // Group "^b"

import X from 'xxx';  // Fall-back group
```

_Note:_
* _Fall-back group is at the end by default._

#### Ex. 3: Reorder fall-back group

```json
"groupRules": ["^a", {}, "^b"]
```

Will produce:

```typescript
import A from 'axx';  // Group "^a"

import X from 'xxx';  // Fall-back group

import B from 'bxx';  // Group "^b"
```

#### Ex. 4: Sub-groups

You can adjust the order of imports within a group via sub-groups.

```json
"groupRules": [["^b", "^a"], "^c"]
```

Will produce:

```typescript
// Group ["^b", "^a"]
import B from 'bxx';  // Sub-group "^b"
import A from 'axx';  // Sub-group "^a"

import C from 'cxx';  // Group "^c"

import X from 'xxx';  // Fall-back group
```

#### Ex. 5: Fall-back sub-group

```json
"groupRules": [
  { "regex": "^[ab]", "subGroups":["^b"] },
]
```

Will produce:

```typescript
// Group "^[ab]"
import B from 'bxx';  // Sub-group "^b"
import A from 'axx';  // Fall-back sub-group

import X from 'xxx';  // Fall-back group
```

_Note:_
- _Fall-back sub-group is at the end of the parent group by default._
- _Fall-back group is at the end by default._

#### Ex. 6: Reorder fall-back sub-group

```json
"groupRules": [
  { "regex": "^[abc]", "subGroups":["^a", {}, "^b"] },
]
```

Will produce:

```typescript
// Group "^[abc]"
import A from 'axx';  // Sub-group "^a"
import C from 'cxx';  // Fall-back sub-group
import B from 'bxx';  // Sub-group "^b"

import X from 'xxx';  // Fall-back group
```

_Note:_
* _Fall-back group is at the end by default._

### Sorting Rules

The sorting rules for import paths and imported names *within a group/sub-group* are also adjustable. You can decide:
* Whether to compare letters case-sensitively or case-insensitively;
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

For more details and how to construct your own rules, please read the [wiki](https://github.com/daidodo/tsimportsorter/wiki/Sorting-Rules).


## Thanks

The initiative came from [import-sorter](https://github.com/SoominHan/import-sorter).

## License

MIT
