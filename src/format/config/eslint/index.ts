import { UnionToIntersection } from 'utility-types';

import {
  Configuration,
  ESLintConfig,
} from '../../../config';
import { translateNewlineAfterImportRule } from './newlineAfterImport';
import { translateNoUselessPathSegmentsRule } from './noUselessPathSegments';
import { translateSortImportsRule } from './sortImports';

export type ESLintConfigProcessed = NonNullable<
  ReturnType<typeof translateESLintConfig>['processed']
>;

export function translateESLintConfig(config: Configuration, eslint: ESLintConfig | undefined) {
  if (!eslint) return { config };
  return apply(
    config,
    [translateSortImportsRule, eslint.sortImports],
    [translateNewlineAfterImportRule, eslint.newlineAfterImport],
    [translateNoUselessPathSegmentsRule, eslint.noUselessPathSegments],
  );
}

/* eslint-disable @typescript-eslint/ban-types */

/**
 * A translator is a function receives a `Configuration` and an option,
 * and returns the new `config` and `processed` data if there are any.
 */
type Translator<O extends object, P extends object> = (
  config: Configuration,
  option: O,
) => { config: Configuration; processed?: P };
/**
 * Pack translator and its option.
 */
type TranslatorWithOpt<O extends object, P extends object> = [Translator<O, P>, O];
type ProcessedAsUnion<T> = T extends TranslatorWithOpt<any, infer P>[] ? P : never;
/**
 * Given a number of translators with options, infer the processed data type.
 */
type Processed<T extends TranslatorWithOpt<any, any>[]> = Partial<
  UnionToIntersection<ProcessedAsUnion<T>>
>;

/**
 * Apply a number of `translations` to `config`.
 * @param config - The original configuration
 * @param translations - An array of translations.
 *                       Each translation consists of a *translator* and its *option*.
 * @returns The updated config and processed data if there are any
 */
function apply<T extends TranslatorWithOpt<any, any>[]>(
  config: Configuration,
  ...translations: T
): { config: Configuration; processed?: Processed<T> } {
  const [t, ...rest] = translations;
  if (!t) return { config };
  const [translator, opt] = t;
  const { config: c, processed } = applyOne(config, translator, opt);
  return applyNext(c, processed, ...rest);
}

function applyOne<O extends object, P extends object, PP extends object>(
  config: Configuration,
  translator: Translator<O, P>,
  opt: O,
  processed?: PP,
) {
  const { config: c, processed: p } = translator(config, opt);
  return { config: c, processed: merge(processed, p) };
}

function applyNext<T extends TranslatorWithOpt<any, any>[], P extends object>(
  config: Configuration,
  processed: P | undefined,
  ...translations: T
): { config: Configuration; processed: any } {
  const [t, ...rest] = translations;
  if (!t) return { config, processed };
  const [translator, opt] = t;
  const { config: c, processed: p } = applyOne(config, translator, opt, processed);
  return applyNext(c, merge(processed, p), ...rest);
}

function merge<T extends object, U extends object>(t: T | undefined, u: U | undefined) {
  return t ? (u ? { ...t, ...u } : t) : u;
}
