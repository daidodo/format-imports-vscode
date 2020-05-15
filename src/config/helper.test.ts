import assert from 'assert';
import { sep } from 'path';

import {
  findFileFromPathAndParents,
  parentFolder,
} from './helper';

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
  assert.ok(
    findFileFromPathAndParents('index.js', __dirname).includes(__dirname + sep + 'index.js'),
  );
  assert.ok(
    findFileFromPathAndParents('index.js', __filename).includes(__dirname + sep + 'index.js'),
  );
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
