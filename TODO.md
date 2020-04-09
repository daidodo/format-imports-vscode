### Features

- Sort exports.
- Group level comments. ([Link](https://github.com/SoominHan/import-sorter/issues/46))
- Support ESLint plugin import/order. ([Link](https://github.com/SoominHan/import-sorter/issues/43))
- Import namespace alias. ([Link](https://github.com/SoominHan/import-sorter/issues/29))
- Add config json schema.
- Feature Request - Standalone CLI version. ([Link](https://github.com/SoominHan/import-sorter/issues/57))
- Add a "sort-imports.on-focus-change" sorting option. ([Link](https://github.com/amatiasq/vsc-sort-imports/issues/30))
- Format files within a directory.

### Implementation

- Use Immutable.js.
- Unit tests.
- [File System](https://code.visualstudio.com/api/references/vscode-api#FileSystem)
- [TextDocument](https://code.visualstudio.com/api/references/vscode-api#TextDocument)

### Bugs

- Test `unused/deep` fails on Windows 10 + VS Code 1.42.1.

### DONE

- ~~Support TSLint plugin import order. ([Link](https://github.com/SoominHan/import-sorter/issues/60))~~
- ~~Useless alias (renaming). ([Link](https://eslint.org/docs/rules/no-useless-rename))~~
- ~~Support glob in exclude path pattern.~~
- ~~Write Integration tests.~~
- ~~Build Integration test mechanism.~~
- ~~Different word limit for one- and multi-line imports. ([Link](https://github.com/SoominHan/import-sorter/issues/31))~~
- ~~Consider trailing comments when calc against max line length.~~
- ~~Multi Root Workspace support.~~
- ~~Newline: \n or \n\r~~
- ~~Respect `formatOnSave` and other config, e.g. `tabSize`.~~
- ~~Deep dive on id reference.~~
- ~~JavaScript support.~~
- ~~Wrap default import.([Link](https://github.com/SoominHan/import-sorter/issues/23))~~
- ~~Support absolute config paths. ([Link](https://github.com/SoominHan/import-sorter/issues/26))~~
- ~~Special comment to disable import sorter for a file or line.~~
- ~~`exclude` should be merged instead of replaced.~~
- ~~Handle implicit React.~~
- ~~Preserve comments after sorting.~~
- ~~Handle script imports.~~
- ~~Format leading spaces anyway.~~

### CANCELLED

- ~~Folding imports. ([Link](https://github.com/SoominHan/import-sorter/pull/38))~~
