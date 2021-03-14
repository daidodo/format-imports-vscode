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

- [Request a New Feature](https://github.com/daidodo/format-imports-vscode/issues/new?assignees=&labels=&template=feature_request.md&title=), or
- [Report a Bug](https://github.com/daidodo/format-imports-vscode/issues/new?assignees=&labels=&template=bug_report.md&title=)

If you see the following message, please click "View logs & Report" and follow the instructions to [Report an Exception](https://github.com/daidodo/format-imports-vscode/issues/new?assignees=&labels=&template=exception_report.md&title=).

<img width="400" alt="image" src="https://user-images.githubusercontent.com/8170176/82117797-9a57e300-976a-11ea-9aab-6dabb3a43abf.png">

### Debug Mode

From v4.1.0, a "Debug Mode" was introduced which prints detailed logs to the output channel:

<img width="546" alt="1" src="https://user-images.githubusercontent.com/8170176/102225664-6222a980-3edf-11eb-9aea-12ae7fca8117.png">

If you are experiencing some non-fatal issues, e.g. low performance or unexpected results, you can enable "Debug Mode" and send logs in a new issue to help us root-cause it.

<img width="522" alt="2" src="https://user-images.githubusercontent.com/8170176/102226074-d8bfa700-3edf-11eb-8e0b-8f6b4c8a62d5.png">

## Contribute to code

All source files are in `src/`:

- `extension.ts`: Main entry point of the extension, including commands, event handling, etc.
- `vscode/`: All code relating to VS Code Extension APIs, including user/workspace configurations, output channel logs, etc.

This extension is built on [Format-Imports](https://github.com/daidodo/format-imports) APIs. Please check out its [CONTRIBUTING.md](https://github.com/daidodo/format-imports/blob/main/CONTRIBUTING.md) for how the formatting works.
