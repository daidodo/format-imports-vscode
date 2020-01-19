import assert from 'assert';
import fs from 'fs';
import path from 'path';
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import vscode from 'vscode';

// import * as myExtension from '../extension';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('Sample test', () => {
    assert.equal(-1, [1, 2, 3].indexOf(5));
    assert.equal(-1, [1, 2, 3].indexOf(0));
  });

  test('Examples test', () => {
    const dir = path.resolve(__dirname, './examples').replace(/\/out\//g, '/src/');
    const examples = [...new Set(fs.readdirSync(dir).map(s => s.slice(0, s.indexOf('.'))))];
    examples.forEach(n => {
      const origin = `${dir}/${n}.origin.ts`;
      const sorted = `${dir}/${n}.sorted.ts`;

      console.log('origin: ', origin);
      console.log('sorted: ', sorted);
    });
  });
});
