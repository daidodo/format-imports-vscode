import assert from 'assert';
import fs, { Dirent } from 'fs';
import path from 'path';
import { window } from 'vscode';

import { Configuration } from '../../config';
import { fileConfig } from '../../config/importSorter';
import formatSource from '../../main';

interface TestSuite {
  name: string;
  config?: Configuration;
  cases: TestCase[];
  suites: TestSuite[];
}

interface TestCase {
  name?: string;
  origin: string;
  result?: string;
}

const CONF = 'import-sorter.json';

suite('Extension Test Suite', () => {
  suite('Examples', () => {
    window.showInformationMessage('Examples test started.');
    getAllTestSuites().forEach(s => runTestSuite(s));
  });
});

function getAllTestSuites() {
  const dir = path.resolve(__dirname, './examples').replace(/\/out\//g, '/src/');
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .map(e => getTestSuite(dir, e))
    .filter((s): s is TestSuite => !!s);
}

function getTestSuite(dir: string, entry: Dirent): TestSuite | undefined {
  if (!entry.isDirectory()) return;
  const { name } = entry;
  const path = `${dir}/${name}`;
  const entries = fs.readdirSync(path, { withFileTypes: true });
  const config = entries.find(({ name }) => name === CONF) && fileConfig(`${path}/${CONF}`);
  const suites = entries
    .filter(e => e.isDirectory())
    .map(e => getTestSuite(path, e))
    .filter((s): s is TestSuite => !!s);
  const map = new Map<string, TestCase>();
  entries
    .filter(e => e.isFile())
    .forEach(({ name }) => {
      const r = /^(.+\.)?(origin|result)\.ts$/.exec(name);
      if (!r) return;
      const [_, n, t] = r;
      const p = `${path}/${name}`;
      const k = n ? n.slice(0, n.length - 1) : '';
      const v = map.get(k) ?? { origin: '' };
      if (t === 'origin') {
        v.origin = p;
        v.name = k ? k : undefined;
      } else v.result = p;
      map.set(k, v);
    });
  return { name, config, suites, cases: [...map.values()] };
}

function runTestSuite(ts: TestSuite, preConfig?: Configuration) {
  const { name, config: curConfig, cases, suites } = ts;
  const config = curConfig && preConfig ? { ...preConfig, ...curConfig } : curConfig ?? preConfig;
  suite(name, () => {
    cases.forEach(c => runTestCase(c, config));
    suites.forEach(s => runTestSuite(s, config));
  });
}

function runTestCase({ name, origin, result }: TestCase, config?: Configuration) {
  test(name ?? 'default', () => {
    const source = fs.readFileSync(origin).toString();
    const actual = formatSource(origin, source, config);
    if (actual === undefined) assert.equal(result, undefined);
    else if (result) {
      const expected = fs.readFileSync(result).toString();
      assert.equal(actual, expected);
    } else assert.equal(source, actual);
  });
}
