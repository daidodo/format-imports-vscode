# TypeScript Import Sorter

Automatically sort imports for **TypeScript** source code.

Based on [import-sorter](https://github.com/SoominHan/import-sorter). Thanks!

## Features

- Auto sort on save. No need for commands or clicks.
- Auto merge imports, deduplicate names.
- Auto delete unused names and handle `React` with JSX properly.
- Group by customizable rules.
- Preserve leading and trailing comments with imports.
- Handle script imports properly.
- Support config both in `package.json` and `import-sorter.json`.

## Extension Settings

All config and their default value:

```{.json}
// Configuration file name.
"tsImportSorter.configuration.configurationFileName": "import-sorter.json",

// Disable sorting for files matching regex expressions.
"tsImportSorter.configuration.exclude": [],

// Grouping rules for path patterns. Everything else has a default level of 20.
"tsImportSorter.configuration.groupRules.": [
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

// Maximum line length before binding names are wrapped. 0 for no limit.
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

TsImportSorter can loads configurations from both `package.json` and `import-sorter.json` (by default) automatically.

`package.json` examples:

```{.json}
"importSorter": {
  "configurationFileName": "import-sorter.json",
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
  "tabSize": 2;
  "tabType": "space",
  "quoteMark": "single",
  "trailingComma": "multiLine",
  "hasSemicolon": true
},
```

`import-sorter.json` example:

```{.json}
{
  "maximumLineLength": 100,
  "maximumWordsPerLine": 1,
  "tabSize": 2,
  "tabType": "space"
}
```

### Search Order

`package.json` and `import-sorter.json` are searched in the following order:

- The same folder of the edited file.
- If not found, then go to the parent folder.
- Continue if still not found, till the root folder (`/`)

The configurations in both files will merge together, and `package.json` will win in any conflicts.

So if you want global settings, just put a `import-sorter.json` in your workspace folder, and any rules in local `package.json` will still be respected.

## License

MIT
