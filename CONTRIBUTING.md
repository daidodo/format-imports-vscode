<!-- markdownlint-configure-file
{
  "no-inline-html": {
    "allowed_elements": ["img"]
  }
}
-->

# How to Contribute

Thank you for helping improve the extension!

## Open an issue

Please use the following links to:

- [Request a New Feature](https://github.com/daidodo/tsimportsorter/issues/new?assignees=&labels=&template=feature_request.md&title=), or
- [Report a Bug](https://github.com/daidodo/tsimportsorter/issues/new?assignees=&labels=&template=bug_report.md&title=)

If you see the following message, please click "View logs & Report" and follow the instructions to [Report an Exception](https://github.com/daidodo/tsimportsorter/issues/new?assignees=&labels=&template=exception_report.md&title=).

<img width="400" alt="image" src="https://user-images.githubusercontent.com/8170176/82117797-9a57e300-976a-11ea-9aab-6dabb3a43abf.png">

### Debug Mode

From v4.1.0, a "Debug Mode" was introduced which prints detailed logs to the output channel:

<img width="546" alt="1" src="https://user-images.githubusercontent.com/8170176/102225664-6222a980-3edf-11eb-9aea-12ae7fca8117.png">

If you are experiencing some non-fatal issues, e.g. low performance or unexpected results, you can enable "Debug Mode" and send logs in a new issue to help us root-cause it.

<img width="522" alt="2" src="https://user-images.githubusercontent.com/8170176/102226074-d8bfa700-3edf-11eb-8e0b-8f6b4c8a62d5.png">

## Contribute to code

### Setup

1. Download the code and open the project folder in VS Code.
2. The following extensions are recommended for consistent code/doc style:

   - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
   - [EditorConfig for VS Code](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)
   - [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
   - [JS/TS Import/Export Sorter](https://marketplace.visualstudio.com/items?itemName=dozerg.tsimportsorter)
   - [markdownlint](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint)

### Test & Run

In the [Run view](https://code.visualstudio.com/docs/editor/debugging), there are 3 launch configurations:

- `Run Extension`: Start a contained instance of VS Code running the extension. Useful when you want to test it manually.
- `Integration Tests`: Run all or some integration tests. Results are shown in the Debug Console:

  <img width="600" alt="1" src="https://user-images.githubusercontent.com/8170176/102334626-cea4b380-3f86-11eb-8421-c0954c7acefc.png">

- `Unit Tests`: Run all unit tests. Results are shown in the Debug Console:

  <img width="400" alt="2" src="https://user-images.githubusercontent.com/8170176/102335128-6904f700-3f87-11eb-8ca3-c0a1d08cf716.png">

You can setup [break points](https://code.visualstudio.com/docs/editor/debugging#_breakpoints) and debug [step by step](https://code.visualstudio.com/docs/editor/debugging#_debug-actions).

### Code Structure

All source files are in `src/` and split into several modules:

- `extension.ts`: Main entry point of the extension, including commands, event handling, etc.
- `vscode/`: All code relating to VS Code Extension APIs, including user/workspace configurations, output channel logs, etc.
- `config/`: Configuration loading and merging, for e.g. `tsconfig.json`, Prettier and `import-sorter.json`.
- `format/`: Core logic for source parsing and formatting.
- `test/`: Integration and unit tests code and examples.
- `common/`: Common functionalities shared.

### Integration Test and Examples

After you've made some code changes to the core formatter, you should always add integrations test examples, and make sure they FAIL without your changes and PASS otherwise.

The test will take the `.origin.ts` file as input, format it, and compare the output with the corresponding `.result.ts` file, e.g. `abc.origin.ts` => `abc.result.ts`, `origin.ts` => `result.ts`.

All origin/result files are under `src/test/suite/examples/`. You can modify `src/test/suite/extension.test.ts` to control which examples to test:

- `runTestSuite(examples)` will test all examples.
- `runTestSuite(examples, 'some/folder')` will test all examples under `examples/some/folder`, including sub-folders.
- `runTestSuite(examples, 'folder/name')` will test single example `examples/folder/name.origin.ts`. (Please note `.origin.ts` is not included in the parameter)
- `runTestSuite(examples, 'folder/default')` will test single example `examples/folder/origin.ts`.

#### Configuration Files

You can provide custom config files to your examples to test all scenarios.

- **`import-sorter.json`**

Configurations from `import-sorter.json` will be MERGED from current folder to its parent and so on until `src/test/suite/examples/`. The closer to the example, the higher precedence.

That means you can put general configs in the parent folders, and example specific configs in the current folder. It's also ok there is no `import-sorter.json`, which means the parent's configs will be used.

- **`tsconfig.json`**

If you need to customize TypeScript compiler options for your examples, you can add a `tsconfig.json` file in your example folder.

Please note that `tsconfig.json` is NOT inheritable, which means parent folders' `tsconfig.json` will not affect the children. If there is no `tsconfig.json`, the TypeScript compiler options will be undefined.

Please check out `examples/js/jsx/` for examples.

- **`.eslintrc.json`**

To test ESLint related examples, you can add an `.eslintrc.json` to your example folder.

It is recommended that you always add `"root": true` in your `.eslintrc.json` to avoid unexpected rules from parent folders. That way, `.eslintrc.json` becomes non-inheritable, which means parent folders' `.eslintrc.json` will not affect the children, the same as `tsconfig.json`.

Please check out `examples/eslint/` for examples.

#### More Tips

There are a few convenient features to reduce boiler-plate code:

- If the output is the same as input, `.result.ts` can be omitted. E.g.:

  _abc.origin.ts:_

  ```ts
  // ts-import-sorter: disable

  import { A } from 'a';
  ```

  You don't need an `abc.result.ts` because the formatter won't change the code as it's disabled.

- If multiple `.origin.ts`s share the same output, you can merge them into one `result.ts`. E.g.:

  ```shell
  examples/folder
   ┣ 0-0.origin.ts
   ┣ 1-1.origin.ts
   ┣ 2-2.origin.ts
   ┗ result.ts
  ```

  All outputs for `0-0`, `1-1` and `2-2` will be compared with `result.ts`. Please note that it's ok to NOT have a `origin.ts` in place.

## Code Coverage

Code coverage has been implemented in [src/test/coverage.ts](https://github.com/daidodo/tsimportsorter/blob/master/src/test/coverage.ts)

After running unit/integ tests, code coverage should be generated under `coverage/` directory. Here's an snapshot of the `coverage/index.html`:

<img width="537" alt="1" src="https://user-images.githubusercontent.com/8170176/102989865-47b78400-450e-11eb-93dc-c52520efc5fc.png">

The recommendation is that you should always check it after your new feature has been implemented and add any tests to cover missing parts.
