<!-- markdownlint-disable first-line-h1 -->

### Features

- Do not remove `export {}` if that's the only export, see [here](https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/unambiguous.md).
- Support rules from [awesome-eslint](https://github.com/dustinspecker/awesome-eslint).
- Support [benmosher/eslint-plugin-import](https://github.com/benmosher/eslint-plugin-import) rules. ([Link](https://github.com/SoominHan/import-sorter/issues/43))
- Support [Tibfib/eslint-plugin-import-helpers](https://github.com/Tibfib/eslint-plugin-import-helpers) rules. ([Link](https://github.com/SoominHan/import-sorter/issues/36)

- Group level comments. ([Link](https://github.com/SoominHan/import-sorter/issues/46))
- Import namespace alias. ([Link](https://github.com/SoominHan/import-sorter/issues/29))
- Standalone npm package, CLI version. ([Link](https://github.com/znikola/vscode-es6-typescript-import-sorter/issues/20), [Link](https://github.com/SoominHan/import-sorter/issues/57))
- Add a "sort-imports.on-focus-change" sorting option. ([Link](https://github.com/amatiasq/vsc-sort-imports/issues/30))
- Format files within a directory.
- Sort by file name instead of full path. ([Link](https://github.com/neilsoult/typescript-imports-sort/issues/3))
- Support for .vue files. ([Link](https://github.com/MLoughry/sort-typescript-imports/issues/31))
- Do not remove imports of commented code. ([Link](https://gitlab.com/smartive-private/christoph/typescript-hero/-/issues/460))
- Prevent organize import on parse error. ([Link](https://gitlab.com/smartive-private/christoph/typescript-hero/-/issues/406))
- Add setting for one import per line. ([Link](https://gitlab.com/smartive-private/christoph/typescript-hero/-/issues/351))
- Sort css imports to the bottom by default. ([Link](https://github.com/zeilmannnoah/orion-import-sorter/issues/1), [Ref](https://raygun.com/blog/css-preprocessors-examples/)).
- Support other IDEs. ([Link](https://github.com/SoominHan/import-sorter/issues/63))
- Webpack the extension. ([Link](https://github.com/znikola/vscode-es6-typescript-import-sorter/issues/52))

### Implementation

- Use Immutable.js.
- [File System](https://code.visualstudio.com/api/references/vscode-api#FileSystem)
- [TextDocument](https://code.visualstudio.com/api/references/vscode-api#TextDocument)

### Bugs

- Inner comments are removed after formatting. E.g. `import A /*inner comment*/ from 'a'`.

### DONE

- ~~Support ESLint plugin import/order. ([Link](https://github.com/SoominHan/import-sorter/issues/65), [Rule](https://eslint.org/docs/rules/sort-imports), [Rule](https://eslint.org/docs/rules/no-duplicate-imports), [API](https://github.com/eslint/eslintrc/blob/a75bacd9a743a7bbcdb8c59e5d4f9de3dc8b0f20/lib/config-array-factory.js#L16))~~
- ~~Organize Imports should sort by import name instead path. ([Link](https://github.com/microsoft/TypeScript/issues/23279), [Link](https://github.com/SoominHan/import-sorter/issues/40))~~
- ~~Infer 'flag' from sub-groups in GroupRule. ([Link](https://github.com/daidodo/tsimportsorter/issues/17))~~
- ~~Test coverage. ([Example](https://github.com/codecov/example-typescript-vscode-extension), [Doc](https://rpeshkov.net/blog/vscode-extension-coverage/))~~
- ~~Support [twin.macro](https://github.com/ben-rogerson/twin.macro). ([Link](https://github.com/daidodo/tsimportsorter/issues/12))~~
- ~~Write CONTRIBUTING.md.~~
- ~~Add config json schema.~~
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
