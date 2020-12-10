import assert from 'assert';
import fs from 'fs';
import path, { sep } from 'path';
import { CompilerOptions } from 'typescript';
import {
  EndOfLine,
  workspace,
} from 'vscode';

import { assertNonNull } from '../../common';
import {
  Configuration,
  ESLintConfig,
  mergeConfig,
} from '../../config';
import { loadESLintConfig } from '../../config/eslint';
import { fileConfig } from '../../config/importSorter';
import { loadTsConfig } from '../../config/tsconfig';
import { formatSource } from '../../format';

interface TestSuite {
  name: string;
  config?: Configuration;
  tsCompOpt?: CompilerOptions;
  eslintConfig?: ESLintConfig;
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
const ESLINT_CONF = '.eslintrc.json';

suite('Integration Test Suite', () => {
  const dir = path.resolve(__dirname).replace(/(\\|\/)out(\\|\/)/g, `${sep}src${sep}`);
  const examples = getTestSuite(dir, 'examples');
  if (!examples) return;
  // Run all tests
  return runTestSuite(examples);
  // Or, run a specific test case
  // return runTestSuite(examples, 'eslint');
});

function getTestSuite(dir: string, name: string): TestSuite | undefined {
  const path = dir + sep + name;
  const entries = fs.readdirSync(path, { withFileTypes: true });
  // Search and load 'import-sorter.json' under path.
  const config = entries.find(({ name }) => name === CONF) && fileConfig(path + sep + CONF);
  // Search and load 'tsconfig.json' under path.
  const tsCompOpt =
    entries.find(({ name }) => name === TS_CONF) && loadTsConfig(path + sep + TS_CONF);
  // Search and load '.eslintrc.json' under path.
  const eslintConfig =
    entries.find(({ name }) => name === ESLINT_CONF) && loadESLintConfig(path + sep + ESLINT_CONF);
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
  return { name, config, tsCompOpt, eslintConfig, suites, cases: [...map.values()] };
}

function runTestSuite(ts: TestSuite, specific?: string, preConfig?: Configuration) {
  const { name, config: curConfig, tsCompOpt, eslintConfig, cases, suites } = ts;
  const defResult = cases.find(c => !c.name && !c.origin)?.result;
  const config =
    curConfig && preConfig ? mergeConfig(preConfig, curConfig) : curConfig ?? preConfig;
  suite(name, () => {
    if (!specific) {
      cases.forEach(c => runTestCase(c, defResult, config, tsCompOpt, eslintConfig));
      suites.forEach(s => runTestSuite(s, undefined, config));
    } else {
      const [n, ...rest] = specific.split('/').filter(s => !!s);
      if (!rest.length) {
        const c = cases.find(c => (c.name ?? 'default') === n);
        if (c) return runTestCase(c, defResult, config, tsCompOpt, eslintConfig);
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
  eslintConfig?: ESLintConfig,
) {
  if (!name && !origin) return;
  test(name ?? 'default', async () => {
    assertNonNull(origin, `Missing origin in test case '${name ?? 'default'}'`);
    const res = result || defResult;
    const doc = await workspace.openTextDocument(origin);
    const c = updateEol(config, doc.eol);
    const allConfig = { config: c, eslintConfig, tsCompilerOptions: tsCompOpt };
    const source = doc.getText();
    const expected = res ? fs.readFileSync(res).toString() : source;
    const actual = formatSource(origin, source, allConfig) ?? source;
    assert.strictEqual(actual, expected);
  });
}

function updateEol(config: Configuration | undefined, eol: EndOfLine) {
  const c: Configuration = { eol: eol === EndOfLine.CRLF ? 'CRLF' : 'LF' };
  return config ? mergeConfig(config, c) : c;
}
