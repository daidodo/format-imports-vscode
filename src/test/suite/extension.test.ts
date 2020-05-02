import assert from 'assert';
import fs from 'fs';
import path, { sep } from 'path';
import { CompilerOptions } from 'typescript';
import {
  EndOfLine,
  workspace,
} from 'vscode';

import { Configuration } from '../../config';
import { merge } from '../../config/helper';
import { fileConfig } from '../../config/importSorter';
import { loadTsConfig } from '../../config/tsconfig';
import formatSource from '../../main';
import { assertNonNull } from '../../utils';

interface TestSuite {
  name: string;
  config?: Configuration;
  tsCompOpt?: CompilerOptions;
  cases: TestCase[];
  suites: TestSuite[];
}

interface TestCase {
  name?: string;
  origin?: string; // origin can be undefined in default case
  result?: string;
}

const CONF = 'import-sorter.json';
const TS_CONF = 'tsconfig.json';

suite('Integration Test Suite', () => {
  const dir = path.resolve(__dirname).replace(/(\\|\/)out(\\|\/)/g, `${sep}src${sep}`);
  const examples = getTestSuite(dir, 'examples');
  if (!examples) return;
  // Run all tests
  return runTestSuite(examples);
  // Or, run a specific test case
  // return runTestSuite(examples, 'insert-lines');
});

function getTestSuite(dir: string, name: string): TestSuite | undefined {
  const path = dir + sep + name;
  const entries = fs.readdirSync(path, { withFileTypes: true });
  const config = entries.find(({ name }) => name === CONF) && fileConfig(`${path}${sep}${CONF}`);
  const tsCompOpt =
    entries.find(({ name }) => name === TS_CONF) && loadTsConfig(`${path}${sep}${TS_CONF}`);
  const suites = entries
    .filter(e => e.isDirectory())
    .map(({ name }) => getTestSuite(path, name))
    .filter((s): s is TestSuite => !!s);
  const map = new Map<string, TestCase>();
  entries
    .filter(e => e.isFile())
    .forEach(({ name }) => {
      const r = /^(.+\.)?(origin|result)\.[jt]sx?$/.exec(name);
      if (!r) return;
      const [, n, t] = r;
      const p = path + sep + name;
      const k = n ? n.slice(0, n.length - 1) : '';
      const v = map.get(k) ?? { origin: '', name: k ? k : undefined };
      if (t === 'origin') v.origin = p;
      else v.result = p;
      map.set(k, v);
    });
  return { name, config, tsCompOpt, suites, cases: [...map.values()] };
}

function runTestSuite(ts: TestSuite, specific?: string, preConfig?: Configuration) {
  const { name, config: curConfig, tsCompOpt, cases, suites } = ts;
  const defResult = cases.find(c => !c.name && !c.origin)?.result;
  const config = curConfig && preConfig ? merge(preConfig, curConfig) : curConfig ?? preConfig;
  suite(name, () => {
    if (!specific) {
      cases.forEach(c => runTestCase(c, defResult, config, tsCompOpt));
      suites.forEach(s => runTestSuite(s, undefined, config));
    } else {
      const [n, ...rest] = specific.split('/').filter(s => !!s);
      if (!rest.length) {
        const c = cases.find(c => (c.name ?? 'default') === n);
        if (c) return runTestCase(c, defResult, config, tsCompOpt);
      }
      const s = suites.find(s => s.name === n);
      assertNonNull(s, `Test case/suite '${n}' not found in suite '${name}'`);
      runTestSuite(s, rest.join('/'), config);
    }
  });
}

function runTestCase(
  { name, origin, result }: TestCase,
  defResult?: string,
  config?: Configuration,
  tsCompOpt?: CompilerOptions,
) {
  if (!name && !origin) return;
  test(name ?? 'default', async () => {
    assertNonNull(origin, `Missing origin in test case '${name ?? 'default'}'`);
    const res = result || defResult;
    const doc = await workspace.openTextDocument(origin);
    const c = updateEol(config, doc.eol);
    const source = doc.getText();
    const expected = res ? fs.readFileSync(res).toString() : source;
    const actual = formatSource(origin, source, c, tsCompOpt) ?? source;
    assert.equal(actual, expected);
  });
}

function updateEol(config: Configuration | undefined, eol: EndOfLine) {
  const c: Configuration = { eol: eol === EndOfLine.CRLF ? 'CRLF' : 'LF' };
  return config ? merge(config, c) : c;
}
