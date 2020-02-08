import assert from 'assert';
import fs from 'fs';
import path from 'path';

import { Configuration } from '../../config';
import { fileConfig } from '../../config/importSorter';
import formatSource from '../../main';
import { assertNonNull } from '../../utils';

interface TestSuite {
  name: string;
  config?: Configuration;
  cases: TestCase[];
  suites: TestSuite[];
}

interface TestCase {
  name?: string;
  origin?: string; // origin can be undefined in default case
  result?: string;
}

const CONF = 'import-sorter.json';

suite('Extension Test Suite', () => {
  const dir = path.resolve(__dirname).replace(/\/out\//g, '/src/');
  const examples = getTestSuite(dir, 'examples');
  if (!examples) return;
  // Run all tests
  return runTestSuite(examples);
  // Alternatively, you can run a specific test case
  // return runTestSuite(examples, undefined, 'delete/tail/0-0');
});

function getTestSuite(dir: string, name: string): TestSuite | undefined {
  const path = `${dir}/${name}`;
  const entries = fs.readdirSync(path, { withFileTypes: true });
  const config = entries.find(({ name }) => name === CONF) && fileConfig(`${path}/${CONF}`);
  const suites = entries
    .filter(e => e.isDirectory())
    .map(({ name }) => getTestSuite(path, name))
    .filter((s): s is TestSuite => !!s);
  const map = new Map<string, TestCase>();
  entries
    .filter(e => e.isFile())
    .forEach(({ name }) => {
      const r = /^(.+\.)?(origin|result)\.ts$/.exec(name);
      if (!r) return;
      const [, n, t] = r;
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

function runTestSuite(ts: TestSuite, preConfig?: Configuration, specific?: string) {
  const { name, config: curConfig, cases, suites } = ts;
  const defResult = cases.find(c => !c.name)?.result;
  const config = curConfig && preConfig ? { ...preConfig, ...curConfig } : curConfig ?? preConfig;
  suite(name, () => {
    if (!specific) {
      cases.forEach(c => runTestCase(c, defResult, config));
      suites.forEach(s => runTestSuite(s, config));
    } else {
      const [n, ...rest] = specific.split('/');
      if (!rest.length) {
        const c = cases.find(c => (c.name ?? 'default') === n);
        assertNonNull(c);
        runTestCase(c, defResult, config);
      } else {
        const s = suites.find(s => s.name === n);
        assertNonNull(s);
        runTestSuite(s, config, rest.join('/'));
      }
    }
  });
}

function runTestCase(
  { name, origin, result }: TestCase,
  defResult?: string,
  config?: Configuration,
) {
  if (!name && !origin) return;
  test(name ?? 'default', () => {
    assertNonNull(origin);
    const res = result || defResult;
    const source = fs.readFileSync(origin).toString();
    const actual = formatSource(origin, source, config);
    if (actual === undefined) assert.equal(res, undefined);
    else if (res) {
      const expected = fs.readFileSync(res).toString();
      assert.equal(actual, expected);
    } else assert.equal(source, actual);
  });
}
