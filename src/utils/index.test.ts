import assert from 'assert';
import { sep } from 'path';

import {
  findFileFromPathAndParents,
  normalizePath,
  parentFolder,
} from './';

suite('utils', () => {
  suite('normalizePath', () => {
    test('forward-slash', () => {
      assert.deepEqual(normalizePath(undefined), '');
      assert.deepEqual(normalizePath(null), '');
      assert.deepEqual(normalizePath(''), '');
      assert.deepEqual(normalizePath('a'), 'a');
      assert.deepEqual(normalizePath('a/'), 'a/');
      assert.deepEqual(normalizePath('a/b'), 'a/b');
      assert.deepEqual(normalizePath('a/b/'), 'a/b/');
      assert.deepEqual(normalizePath('a/b/.'), 'a/b');
      assert.deepEqual(normalizePath('a/b/./'), 'a/b/');
      assert.deepEqual(normalizePath('a/b/./..'), 'a');
      assert.deepEqual(normalizePath('a/b/./../'), 'a/');
      assert.deepEqual(normalizePath('a/b/..'), 'a');
      assert.deepEqual(normalizePath('a/b/../'), 'a/');
      assert.deepEqual(normalizePath('a/b/../.'), 'a');
      assert.deepEqual(normalizePath('a/b/.././'), 'a/');
      assert.deepEqual(normalizePath('.'), './');
      assert.deepEqual(normalizePath('./'), './');
      assert.deepEqual(normalizePath('./a'), './a');
      assert.deepEqual(normalizePath('./a/'), './a/');
      assert.deepEqual(normalizePath('./a/b'), './a/b');
      assert.deepEqual(normalizePath('./a/b/'), './a/b/');
      assert.deepEqual(normalizePath('./a/b/.'), './a/b');
      assert.deepEqual(normalizePath('./a/b/./'), './a/b/');
      assert.deepEqual(normalizePath('./a/b/./..'), './a');
      assert.deepEqual(normalizePath('./a/b/./../'), './a/');
      assert.deepEqual(normalizePath('./a/b/..'), './a');
      assert.deepEqual(normalizePath('./a/b/../'), './a/');
      assert.deepEqual(normalizePath('./a/b/../.'), './a');
      assert.deepEqual(normalizePath('./a/b/.././'), './a/');
      assert.deepEqual(normalizePath('..'), '../');
      assert.deepEqual(normalizePath('../'), '../');
      assert.deepEqual(normalizePath('../a'), '../a');
      assert.deepEqual(normalizePath('../a/'), '../a/');
      assert.deepEqual(normalizePath('../a/b'), '../a/b');
      assert.deepEqual(normalizePath('../a/b/'), '../a/b/');
      assert.deepEqual(normalizePath('../a/b/.'), '../a/b');
      assert.deepEqual(normalizePath('../a/b/./'), '../a/b/');
      assert.deepEqual(normalizePath('../a/b/./..'), '../a');
      assert.deepEqual(normalizePath('../a/b/./../'), '../a/');
      assert.deepEqual(normalizePath('../a/b/..'), '../a');
      assert.deepEqual(normalizePath('../a/b/../'), '../a/');
      assert.deepEqual(normalizePath('../a/b/../.'), '../a');
      assert.deepEqual(normalizePath('../a/b/.././'), '../a/');
      assert.deepEqual(normalizePath('./.'), './');
      assert.deepEqual(normalizePath('././'), './');
      assert.deepEqual(normalizePath('./..'), '../');
      assert.deepEqual(normalizePath('./../'), '../');
      assert.deepEqual(normalizePath('../.'), '../');
      assert.deepEqual(normalizePath('.././'), '../');
      assert.deepEqual(normalizePath('../..'), '../../', '../..');
      assert.deepEqual(normalizePath('../../'), '../../');
      assert.deepEqual(normalizePath('a//b'), 'a/b');
      assert.deepEqual(normalizePath('a//b//'), 'a/b/');
    });
    test('back-slash', () => {
      assert.deepEqual(normalizePath('a'), 'a');
      assert.deepEqual(normalizePath('a\\'), 'a/');
      assert.deepEqual(normalizePath('a\\b'), 'a/b');
      assert.deepEqual(normalizePath('a\\b\\'), 'a/b/');
      assert.deepEqual(normalizePath('a\\b\\.'), 'a/b');
      assert.deepEqual(normalizePath('a\\b\\.\\'), 'a/b/');
      assert.deepEqual(normalizePath('a\\b\\.\\..'), 'a');
      assert.deepEqual(normalizePath('a\\b\\.\\..\\'), 'a/');
      assert.deepEqual(normalizePath('a\\b\\..'), 'a');
      assert.deepEqual(normalizePath('a\\b\\..\\'), 'a/');
      assert.deepEqual(normalizePath('a\\b\\..\\.'), 'a');
      assert.deepEqual(normalizePath('a\\b\\..\\.\\'), 'a/');
      assert.deepEqual(normalizePath('.'), './');
      assert.deepEqual(normalizePath('.\\'), './');
      assert.deepEqual(normalizePath('.\\a'), './a');
      assert.deepEqual(normalizePath('.\\a\\'), './a/');
      assert.deepEqual(normalizePath('.\\a\\b'), './a/b');
      assert.deepEqual(normalizePath('.\\a\\b\\'), './a/b/');
      assert.deepEqual(normalizePath('.\\a\\b\\.'), './a/b');
      assert.deepEqual(normalizePath('.\\a\\b\\.\\'), './a/b/');
      assert.deepEqual(normalizePath('.\\a\\b\\.\\..'), './a');
      assert.deepEqual(normalizePath('.\\a\\b\\.\\..\\'), './a/');
      assert.deepEqual(normalizePath('.\\a\\b\\..'), './a');
      assert.deepEqual(normalizePath('.\\a\\b\\..\\'), './a/');
      assert.deepEqual(normalizePath('.\\a\\b\\..\\.'), './a');
      assert.deepEqual(normalizePath('.\\a\\b\\..\\.\\'), './a/');
      assert.deepEqual(normalizePath('..'), '../');
      assert.deepEqual(normalizePath('..\\'), '../');
      assert.deepEqual(normalizePath('..\\a'), '../a');
      assert.deepEqual(normalizePath('..\\a\\'), '../a/');
      assert.deepEqual(normalizePath('..\\a\\b'), '../a/b');
      assert.deepEqual(normalizePath('..\\a\\b\\'), '../a/b/');
      assert.deepEqual(normalizePath('..\\a\\b\\.'), '../a/b');
      assert.deepEqual(normalizePath('..\\a\\b\\.\\'), '../a/b/');
      assert.deepEqual(normalizePath('..\\a\\b\\.\\..'), '../a');
      assert.deepEqual(normalizePath('..\\a\\b\\.\\..\\'), '../a/');
      assert.deepEqual(normalizePath('..\\a\\b\\..'), '../a');
      assert.deepEqual(normalizePath('..\\a\\b\\..\\'), '../a/');
      assert.deepEqual(normalizePath('..\\a\\b\\..\\.'), '../a');
      assert.deepEqual(normalizePath('..\\a\\b\\..\\.\\'), '../a/');
      assert.deepEqual(normalizePath('.\\.'), './');
      assert.deepEqual(normalizePath('.\\.\\'), './');
      assert.deepEqual(normalizePath('.\\..'), '../');
      assert.deepEqual(normalizePath('.\\..\\'), '../');
      assert.deepEqual(normalizePath('..\\.'), '../');
      assert.deepEqual(normalizePath('..\\.\\'), '../');
      assert.deepEqual(normalizePath('..\\..'), '../../', '../..');
      assert.deepEqual(normalizePath('..\\..\\'), '../../');
      assert.deepEqual(normalizePath('C:\\'), 'C:/');
      assert.deepEqual(normalizePath('C:\\a'), 'C:/a');
      assert.deepEqual(normalizePath('C:\\a\\'), 'C:/a/');
      assert.deepEqual(normalizePath('a\\\\b'), 'a/b');
      assert.deepEqual(normalizePath('a\\\\b\\\\'), 'a/b/');
    });
  });

  test('findFileFromPathAndParents', () => {
    assert.deepEqual(findFileFromPathAndParents(undefined), []);
    assert.deepEqual(findFileFromPathAndParents(null), []);
    assert.deepEqual(findFileFromPathAndParents(''), []);
    assert.deepEqual(findFileFromPathAndParents('/a/b/c'), ['/a/b/c']);
    assert.deepEqual(findFileFromPathAndParents('C:\\a\\b'), ['C:\\a\\b']);
    assert.deepEqual(findFileFromPathAndParents('some.file'), []);
    assert.deepEqual(findFileFromPathAndParents('some.file', ''), []);
    assert.deepEqual(findFileFromPathAndParents('non.existing.file', __dirname), []);
    assert.deepEqual(findFileFromPathAndParents('non.existing.file', __filename), []);
    assert.deepEqual(findFileFromPathAndParents('index.js', __dirname), [
      __dirname + sep + 'index.js',
    ]);
    assert.deepEqual(findFileFromPathAndParents('index.js', __filename), [
      __dirname + sep + 'index.js',
    ]);
    assert.deepEqual(findFileFromPathAndParents('package.json', __dirname).length, 1);
    assert.deepEqual(findFileFromPathAndParents('package.json', __filename).length, 1);
    assert.deepEqual(
      findFileFromPathAndParents('package.json', __dirname.replace(/\//g, '//')).length,
      1,
    );
  });

  suite('parentFolder', () => {
    test('forward-slash', () => {
      assert.deepEqual(parentFolder(undefined), '');
      assert.deepEqual(parentFolder(null), '');
      assert.deepEqual(parentFolder(''), '');
      assert.deepEqual(parentFolder('a'), '');
      assert.deepEqual(parentFolder('a/'), 'a');
      assert.deepEqual(parentFolder('a/b'), 'a');
      assert.deepEqual(parentFolder('/'), '');
      assert.deepEqual(parentFolder('/a'), '/');
      assert.deepEqual(parentFolder('/a/'), '/a');
      assert.deepEqual(parentFolder('/a/b'), '/a');

      assert.deepEqual(parentFolder('a//'), 'a');
      assert.deepEqual(parentFolder('a//b'), 'a');
      assert.deepEqual(parentFolder('//'), '');
      assert.deepEqual(parentFolder('//a'), '/');
      assert.deepEqual(parentFolder('//a//'), '/a');
      assert.deepEqual(parentFolder('//a//b'), '/a');
    });
    test('back-slash', () => {
      assert.deepEqual(parentFolder('a\\'), 'a');
      assert.deepEqual(parentFolder('a\\b'), 'a');
      assert.deepEqual(parentFolder('\\'), '');
      assert.deepEqual(parentFolder('\\a'), '\\');
      assert.deepEqual(parentFolder('\\a\\'), '\\a');
      assert.deepEqual(parentFolder('\\a\\b'), '\\a');

      assert.deepEqual(parentFolder('a\\\\'), 'a');
      assert.deepEqual(parentFolder('a\\\\b'), 'a');
      assert.deepEqual(parentFolder('\\\\'), '');
      assert.deepEqual(parentFolder('\\\\a'), '\\');
      assert.deepEqual(parentFolder('\\\\a\\\\'), '\\a');
      assert.deepEqual(parentFolder('\\\\a\\\\b'), '\\a');

      assert.deepEqual(parentFolder('C:'), '');
      assert.deepEqual(parentFolder('C:\\'), 'C:');
      assert.deepEqual(parentFolder('C:\\a'), 'C:');
      assert.deepEqual(parentFolder('C:\\a\\'), 'C:\\a');
    });
  });
});
