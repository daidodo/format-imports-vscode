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

## [2.0.0] - 2020-05-03

### Added

- Support formatting exports.
- Add `"formatExports"`.
- Add `"maxExportNamesPerLine"`.

### Changed

- Rename `"maximumBindingNamesPerLine"` to `"maxBindingNamesPerLine"`.
- Rename `"maximumDefaultAndBindingNamesPerLine"` to `"maxDefaultAndBindingNamesPerLine"`.
- Rename `"maximumNamesPerWrappedLine"` to `"maxNamesPerWrappedLine"`.
- Rename `"maximumLineLength"` to `"maxLineLength"`.

## [1.2.6] - 2020-04-17

### Added

- Add [Sorting Rules](https://github.com/daidodo/tsimportsorter/wiki/Sorting-Rules) support.
- Add `"tsImportSorter.configuration.sortRules.paths"`.
- Add `"tsImportSorter.configuration.sortRules.names"`.

## [1.2.0] - 2020-04-06

### Added

- Add Sub-group support.

### Changed

- Change `"tsImportSorter.configuration.groupRules"`.
- Improve [Grouping Rules](https://github.com/daidodo/tsimportsorter/wiki/Grouping-Rules).

## [1.1.0] - 2020-03-21

### Added

- Command / shortcut / context menu support.
- `"tsImportSorter.configuration.autoFormat"`.

### Removed

- Auto format when `"editor.formatOnSave"` is `true`.

## [1.0.0] - 2020-01-29

- First stable version.

## [0.0.2] - 2020-01-18

- First version with full functionality.
