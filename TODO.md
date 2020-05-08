<!-- markdownlint-disable first-line-h1 -->

### Features

- Test coverage.
- Write CONTRIBUTING.md.
- Group level comments. ([Link](https://github.com/SoominHan/import-sorter/issues/46))
- Support ESLint plugin import/order. ([Link](https://github.com/SoominHan/import-sorter/issues/43))
- Import namespace alias. ([Link](https://github.com/SoominHan/import-sorter/issues/29))
- Add config json schema.
- Feature Request - Standalone CLI version. ([Link](https://github.com/SoominHan/import-sorter/issues/57))
- Add a "sort-imports.on-focus-change" sorting option. ([Link](https://github.com/amatiasq/vsc-sort-imports/issues/30))
- Format files within a directory.
- Organize Imports should sort by import name instead path. ([Link](https://github.com/microsoft/TypeScript/issues/23279))
- Sort by file name instead of full path. ([Link](https://github.com/neilsoult/typescript-imports-sort/issues/3))
- Support for .vue files. ([Link](https://github.com/MLoughry/sort-typescript-imports/issues/31))
- Do not remove imports of commented code. ([Link](https://gitlab.com/smartive-private/christoph/typescript-hero/-/issues/460))
- Prevent organize import on parse error. ([Link](https://gitlab.com/smartive-private/christoph/typescript-hero/-/issues/406))
- Add setting for one import per line. ([Link](https://gitlab.com/smartive-private/christoph/typescript-hero/-/issues/351))
- Sort css imports to the bottom by default. ([Link](https://github.com/zeilmannnoah/orion-import-sorter/issues/1), [Ref](https://raygun.com/blog/css-preprocessors-examples/)).

### Implementation

- Use Immutable.js.
- [File System](https://code.visualstudio.com/api/references/vscode-api#FileSystem)
- [TextDocument](https://code.visualstudio.com/api/references/vscode-api#TextDocument)

### Bugs

- Inner comments are removed after formatting. E.g. `import A /*inner comment*/ from 'a'`.

### DONE

- ~~Debug logs, open issue template, easy way to copy/paste logs for bug fix.~~
- ~~Test `unused/deep` fails on Windows 10 + VS Code 1.42.1.~~
- ~~Unit tests.~~
- ~~Sort exports. ([Link](https://github.com/daidodo/tsimportsorter/issues/6#issuecomment-619185391), [Doc](https://github.com/tc39/proposal-export-ns-from))~~
- ~~Required `h` import missing (StencilJS). ([Link](https://gitlab.com/smartive-private/christoph/typescript-hero/-/issues/488))~~
- ~~Provide an option to not sort "Plain import". ([Link](https://gitlab.com/smartive-private/christoph/typescript-hero/-/issues/454))~~
- ~~Shebangs are moved after imports. ([Link](https://github.com/MLoughry/sort-typescript-imports/issues/37))~~
- ~~Option to ignore `node_modules`. ([Link](https://github.com/amatiasq/vsc-sort-imports/issues/38))~~
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

- ~~Option to not normalize `"."` and `".."`. ([Link](https://github.com/SoominHan/import-sorter/issues/48))~~
- ~~Folding imports. ([Link](https://github.com/SoominHan/import-sorter/pull/38))~~
