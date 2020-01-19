### Features

- JavaScript support.
- Deep dive on id reference.
- Respect `formatOnSave` and other config, e.g. `tabSize`.
- Sort exports.
- Group comments. ([Link](https://github.com/SoominHan/import-sorter/issues/46))
- Support ESLint plugin import/order. ([Link](https://github.com/SoominHan/import-sorter/issues/43))
- Folding imports. ([Link](https://github.com/SoominHan/import-sorter/pull/38))
- Different word limit for one- and multi-line imports. ([Link](https://github.com/SoominHan/import-sorter/issues/31))
- Import namespace alias. ([Link](https://github.com/SoominHan/import-sorter/issues/29))
- Wrap default import.([Link](https://github.com/SoominHan/import-sorter/issues/23))
- ~~Support absolute config paths. ([Link](https://github.com/SoominHan/import-sorter/issues/26))~~
- ~~Special comment to disable import sorter for a file or line.~~
- ~~`exclude` should be merged instead of replaced.~~
- ~~Lower case first or upper case first.~~
- ~~Handle implicit React.~~
- ~~Preserve comments after sorting.~~
- ~~Handle script imports.~~
- ~~Format leading spaces anyway.~~

### Implementation

- Use Immutable.js.
- Unit tests.
- Integration tests.
