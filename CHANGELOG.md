<!-- markdownlint-configure-file
{
  "no-duplicate-heading": {
    "siblings_only": true
  }
}
-->

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- [Stacked changes]

-->

## [3.0.0] - 2020-08-21

### Added

- Add `"named"` option to group's `flag` config.
- Infer a group's `flag` from its parent and sub-groups when not set.

## [2.2.0] - 2020-07-10

### Added

- Add `EmptyLinesBetweenGroups` config.

## [2.1.4] - 2020-05-23

### Added

- Support [Type-Only imports/exports](https://devblogs.microsoft.com/typescript/announcing-typescript-3-8/#type-only-imports-exports).

## [2.1.0] - 2020-05-17

### Added

- Support keeping unused imports.
- Add `keepUnused` config.

## [2.0.0] - 2020-05-03

### Added

- Support formatting exports.
- Add `"formatExports"`.
- Add `"maxExportNamesPerLine"`.
- Support `'none'` as [Sorting Rules](https://github.com/daidodo/tsimportsorter/wiki/Sorting-Rules).
- Support `h` ([Stencil](https://stenciljs.com/)).

### Changed

- Rename `"maximumBindingNamesPerLine"` to `"maxBindingNamesPerLine"`.
- Rename `"maximumDefaultAndBindingNamesPerLine"` to `"maxDefaultAndBindingNamesPerLine"`.
- Rename `"maximumNamesPerWrappedLine"` to `"maxNamesPerWrappedLine"`.
- Rename `"maximumLineLength"` to `"maxLineLength"`.

## [1.2.6] - 2020-04-17

### Added

- Support [Sorting Rules](https://github.com/daidodo/tsimportsorter/wiki/Sorting-Rules).
- Add `"tsImportSorter.configuration.sortRules.paths"`.
- Add `"tsImportSorter.configuration.sortRules.names"`.
- Support shebang (`#!`).

## [1.2.1] - 2020-04-06

### Changed

- Change `"tsImportSorter.configuration.groupRules"` content.
- Improve [Grouping Rules](https://github.com/daidodo/tsimportsorter/wiki/Grouping-Rules).
- Support sub-groups.

## [1.1.0] - 2020-03-21

### Added

- Command / shortcut / context menu support.
- Add `"tsImportSorter.configuration.autoFormat"`.
- Support glob patterns to exclude files.

### Removed

- Auto format when `"editor.formatOnSave"` is `true`.

## [1.0.0] - 2020-01-29

### Added

- Support regex patterns to exclude files.
- Support comments to exclude files or imports.
- Add Javascript support.
- Preserve global comments and `'use strict'`.
- Respect VS Code `editor` config.
- Respect Prettier and EditorConfig config.
- Support multi-root projects.

## [0.0.2] - 2020-01-18

### Added

- Auto sort on save. No need for commands or clicks.
- Auto merge imports, deduplicate names.
- Auto delete unused names and handle `React` with JSX properly.
- Group by customizable rules.
- Preserve leading and trailing comments with imports.
- Support config both in `package.json` and `import-sorter.json`.
