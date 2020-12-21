import assert from 'assert';
import { sep } from 'path';

import {
  findFileFromPathAndParents,
  parentFolder,
} from './helper';

suite('config/helper', () => {
  suite('findFileFromPathAndParents', () => {
    test('all', () => {
      assert.deepStrictEqual(findFileFromPathAndParents(undefined), []);
      assert.deepStrictEqual(findFileFromPathAndParents(null), []);
      assert.deepStrictEqual(findFileFromPathAndParents(''), []);
      assert.deepStrictEqual(findFileFromPathAndParents('/a/b/c'), ['/a/b/c']);
      assert.deepStrictEqual(findFileFromPathAndParents('C:\\a\\b'), ['C:\\a\\b']);
      assert.deepStrictEqual(findFileFromPathAndParents('some.file'), []);
      assert.deepStrictEqual(findFileFromPathAndParents('some.file', ''), []);
      assert.deepStrictEqual(findFileFromPathAndParents('non.existing.file', __dirname), []);
      assert.deepStrictEqual(findFileFromPathAndParents('non.existing.file', __filename), []);
      assert.ok(
        findFileFromPathAndParents('index.js', __dirname).includes(__dirname + sep + 'index.js'),
      );
      assert.ok(
        findFileFromPathAndParents('index.js', __filename).includes(__dirname + sep + 'index.js'),
      );
      assert.deepStrictEqual(findFileFromPathAndParents('package.json', __dirname).length, 1);
      assert.deepStrictEqual(findFileFromPathAndParents('package.json', __filename).length, 1);
      assert.deepStrictEqual(
        findFileFromPathAndParents('package.json', __dirname.replace(/\//g, '//')).length,
        1,
      );
    });
  });

  suite('parentFolder', () => {
    test('forward-slash', () => {
      assert.deepStrictEqual(parentFolder(undefined), '');
      assert.deepStrictEqual(parentFolder(null), '');
      assert.deepStrictEqual(parentFolder(''), '');
      assert.deepStrictEqual(parentFolder('a'), '');
      assert.deepStrictEqual(parentFolder('a/'), 'a');
      assert.deepStrictEqual(parentFolder('a/b'), 'a');
      assert.deepStrictEqual(parentFolder('/'), '');
      assert.deepStrictEqual(parentFolder('/a'), '/');
      assert.deepStrictEqual(parentFolder('/a/'), '/a');
      assert.deepStrictEqual(parentFolder('/a/b'), '/a');

      assert.deepStrictEqual(parentFolder('a//'), 'a');
      assert.deepStrictEqual(parentFolder('a//b'), 'a');
      assert.deepStrictEqual(parentFolder('//'), '');
      assert.deepStrictEqual(parentFolder('//a'), '/');
      assert.deepStrictEqual(parentFolder('//a//'), '/a');
      assert.deepStrictEqual(parentFolder('//a//b'), '/a');
    });
    test('back-slash', () => {
      assert.deepStrictEqual(parentFolder('a\\'), 'a');
      assert.deepStrictEqual(parentFolder('a\\b'), 'a');
      assert.deepStrictEqual(parentFolder('\\'), '');
      assert.deepStrictEqual(parentFolder('\\a'), '\\');
      assert.deepStrictEqual(parentFolder('\\a\\'), '\\a');
      assert.deepStrictEqual(parentFolder('\\a\\b'), '\\a');

      assert.deepStrictEqual(parentFolder('a\\\\'), 'a');
      assert.deepStrictEqual(parentFolder('a\\\\b'), 'a');
      assert.deepStrictEqual(parentFolder('\\\\'), '');
      assert.deepStrictEqual(parentFolder('\\\\a'), '\\');
      assert.deepStrictEqual(parentFolder('\\\\a\\\\'), '\\a');
      assert.deepStrictEqual(parentFolder('\\\\a\\\\b'), '\\a');

      assert.deepStrictEqual(parentFolder('C:'), '');
      assert.deepStrictEqual(parentFolder('C:\\'), 'C:');
      assert.deepStrictEqual(parentFolder('C:\\a'), 'C:');
      assert.deepStrictEqual(parentFolder('C:\\a\\'), 'C:\\a');
    });
  });
});
