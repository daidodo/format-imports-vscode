import ts, {
  CompilerHost,
  CompilerOptions,
  Diagnostic,
  SourceFile,
} from 'typescript';

import {
  logger,
  normalizePath,
} from '../utils';
import ImportNode from './ImportNode';

export interface NameUsage {
  usedNames?: Set<string>;
  unusedNames?: Set<string>;
  unusedNodes?: ImportNode[];
}

enum UnusedCode {
  SINGLE_1 = 6133,
  SINGLE_2 = 6196,
  ALL = 6192,
}

export function getUnusedIds(
  usedNames: Set<string>,
  importNodes: ImportNode[],
  fileName: string,
  sourceFile: SourceFile,
  tsCompilerOptions?: CompilerOptions,
): NameUsage {
  const UNUSED_CODE = new Set(
    Object.values(UnusedCode).filter((v): v is number => typeof v === 'number'),
  );
  const unusedNames = new Set<string>();
  const unusedNodes = Array<ImportNode>();
  const options = prepareOptions(tsCompilerOptions);
  const host = mockHost(fileName, sourceFile, options);
  const program = ts.createProgram([fileName], options, host);
  try {
    // https://github.com/microsoft/TypeScript/wiki/API-Breaking-Changes#program-interface-changes
    program
      .getSemanticDiagnostics(sourceFile)
      .filter(m => m.file === sourceFile && UNUSED_CODE.has(m.code))
      .forEach(m => transform(m, importNodes, unusedNames, unusedNodes));
    return { usedNames, unusedNames, unusedNodes };
  } catch (e) {
    logger('parser.getUnusedIds').error('getSemanticDiagnostics failed:', e);
    return { usedNames };
  }
}

function prepareOptions(options?: CompilerOptions): CompilerOptions {
  return {
    ...(options ?? {}),
    noEmit: true,
    noUnusedLocals: true,
    allowJs: true,
    checkJs: true,
  };
}

function mockHost(
  fileName: string,
  sourceFile: SourceFile,
  options: CompilerOptions,
): CompilerHost {
  const host = ts.createCompilerHost(options);
  // Normalize the path before comparing because it can be both '/' and '\' in Windows
  const fn = normalizePath(fileName);
  return {
    ...host,
    getSourceFile: f => (normalizePath(f) === fn ? sourceFile : undefined),
    // The following costs significant performance:
    // getSourceFile: (f, l, e, c) => {
    //   logger('parser.mockHost').debug('fileName:', f);
    //   return normalizePath(f) === fn ? sourceFile : host.getSourceFile(f, l, e, c);
    // },
  };
}

function transform(
  m: Diagnostic,
  importNodes: ImportNode[],
  unusedNames: Set<string>,
  unusedNodes: ImportNode[],
) {
  const { code, start: pos, messageText: text } = m;
  const log = logger('parser.transform');
  if (pos === undefined || typeof text !== 'string') return;
  if (code === UnusedCode.SINGLE_1 || code === UnusedCode.SINGLE_2) {
    // ts(6133): 'XXX' is declared but its value is never read.
    // ts(6196): 'XXX' is declared but never used.
    const id = /^'(\w+)' is declared but/.exec(text)?.[1];
    if (!id) {
      log.warn(`Cannot parse identifier for error code=${code} from message='${text}'`);
      return;
    }
    unusedNames.add(id);
  } else if (code === UnusedCode.ALL) {
    // ts(6192): All imports in import declaration are unused.
    const node = importNodes.find(n => n.withinDeclRange(pos));
    if (!node) {
      log.warn(`Cannot find node at pos=${pos} for error code=${code}`);
      return;
    }
    node.allNames().forEach(n => unusedNames.add(n));
    unusedNodes.push(node);
  }
}
