import assert from 'assert';
import fs from 'fs';
import path from 'path';
import vscode from 'vscode';

import { fileConfig } from '../../config/importSorter';
import formatSource from '../../main';

suite('Extension Test Suite', () => {
  test('Examples test', () => {
    const dir = path.resolve(__dirname, './examples').replace(/\/out\//g, '/src/');
    const cases = fs.readdirSync(dir);
    vscode.window.showInformationMessage(`Found ${cases.length} test cases`);
    cases.forEach(c => {
      const origin = `${dir}/${c}/origin.ts`;
      const result = `${dir}/${c}/result.ts`;
      const conf = `${dir}/${c}/import-sorter.json`;

      const config = fileConfig(conf);
      const sourceText = fs.readFileSync(origin).toString();

      const actual = formatSource(origin, sourceText, config);
      const expected = fs.readFileSync(result).toString();

      assert.equal(actual, expected, `examples/${c}`);
    });
  });
});
