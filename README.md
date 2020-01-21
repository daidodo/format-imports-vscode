# TS Import Sorter

Automatically sort imports for **JavaScript** and **TypeScript** source code. ([Install](https://marketplace.visualstudio.com/items?itemName=dozerg.tsimportsorter))

## Features

- Auto sort on save.
- Auto merge imports, remove unused or duplicated names.
- Recognize JSX elements and keep `React` import.
- Preserve `use strict` and comments.
- Group React, Angular or Vue imports separately.
- Customizable grouping rules.
- Ignore specific files or imports.
- Support config both in `package.json` and `import-sorter.json`.

## Extension Settings

All config and their default values:

```json
// Configuration file name.
"tsImportSorter.configuration.configurationFileName": "import-sorter.json",

// Disable sorting for files matching regex expressions.
"tsImportSorter.configuration.exclude": [],

// Grouping rules for path patterns. Everything else has a default level of 20.
"tsImportSorter.configuration.groupRules": [
  {
    "regex": "^react(-dom)?$",
    "level": 10
  },
  {
    "regex": "^@angular/",
    "level": 11
  },
  {
    "regex": "^vue$",
    "level": 12
  },
  {
    "regex": "^[@]",
    "level": 30
  },
  {
    "regex": "^[.]",
    "level": 40
  }
],

// Maximum line length before import declarations are wrapped. 0 for no limit.
"tsImportSorter.configuration.maximumLineLength": 100,

// Maximum words per line before binding names are wrapped. 0 for no limit.
"tsImportSorter.configuration.maximumWordsPerLine": 1,

// Number of spaces to replace a TAB.
"tsImportSorter.configuration.tabSize": 2,

// If set to "tab", TAB will be kept. If set to "space", TAB will be replaced by SPACEs.
"tsImportSorter.configuration.tabType": "space",

// If set to "single", 'path' will be used to quote paths. If set to "double", "path" will be used to quote paths.
"tsImportSorter.configuration.quoteMark": "single",

// If set to "multiLine", there will be a comma after the last binding name in a new line. Or "none" for no comma.
"tsImportSorter.configuration.trailingComma": "multiLine",

// Whether there is a semicolon at the end of import declarations.
"tsImportSorter.configuration.hasSemicolon": true,
```

## Configuration

TS Import Sorter can load configurations from both `package.json` and `import-sorter.json` (configurable) automatically.

`package.json` example:

```json
"importSorter": {
  "exclude": ["regexPattern"],
  "groupRules": [
    {
      "regex": "^react$",
      "level": 10
    },
    {
      "regex": "^[@]",
      "level": 30
    },
    {
      "regex": "^[.]",
      "level": 40
    }
  ],
  "maximumLineLength": 100,
  "maximumWordsPerLine": 1,
  "tabSize": 2,
  "tabType": "space",
  "quoteMark": "single",
  "trailingComma": "multiLine",
  "hasSemicolon": true
},
```

`import-sorter.json` example:

```json
{
  "maximumLineLength": 100,
  "maximumWordsPerLine": 1,
  "tabSize": 2,
  "tabType": "space"
}
```

### Search Order

`package.json` is searched in the following order:

- The same folder of the edited file.
- If not found, then go to the parent folder.
- Continue if still not found, till the root folder (`/`)

`import-sorter.json` is searched in a similar way if it's a relative path.

If `tsImportSorter.configuration.configurationFileName` is an absolute path, e.g. `/path/to/import-sorter.json`, no search is needed.

The configurations in both files will merge together, and `package.json` will win in any conflicts.

So if you want global settings, just put a `import-sorter.json` in your workspace folder, and any rules in local `package.json` will still be respected.

### Ignore files or import declarations

There are a few ways to exclude files from inspection:

- Add file path pattern to extension config in VSCode.
  ```json
  "tsImportSorter.configuration.exclude": ["pathPattern"],
  ```
- Add file path pattern to `package.json` or `import-sorter.json`.
- Add the following comment at the beginning of the source file and keep at least one empty line from the next statement:

```ts
// ts-import-sorter: disable

[Other code]
```

or

```ts
/* ts-import-sorter: disable */

[Other code]
```

To exclude a specific `import` declaration from sorting, please add the following as its leading or trailing comments:

```ts
// ts-import-sorter: disable
import Excluded from 'import/sorter';
```

or

```ts
import Excluded from 'import/sorter'; /* ts-import-sorter: disable */
```

## Thanks

The initiative came from [import-sorter](https://github.com/SoominHan/import-sorter).

## License

MIT
