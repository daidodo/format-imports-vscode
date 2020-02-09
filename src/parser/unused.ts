import ts, {
  CompilerHost,
  CompilerOptions,
  Diagnostic,
  SourceFile,
  sys,
  TranspileOptions,
} from 'typescript';

import { UnusedId } from './types';

export enum UnusedCode {
  SINGLE_1 = 6133,
  SINGLE_2 = 6196,
  ALL = 6192,
}

export function getUnusedIds(
  fileName: string,
  sourceFile: SourceFile,
  sourceText: string,
  tsConfig: TranspileOptions,
) {
  const UNUSED_CODE = new Set(
    Object.values(UnusedCode).filter((v): v is number => typeof v === 'number'),
  );
  const options = prepareOptions(tsConfig);
  const host = mockHost(fileName, sourceFile, sourceText, options);
  const program = ts.createProgram([fileName], options, host);
  const semanticDiagnostic = ts.getPreEmitDiagnostics(program);
  return semanticDiagnostic
    .filter(m => m.file === sourceFile && UNUSED_CODE.has(m.code))
    .map(transform)
    .filter((r): r is UnusedId => !!r);
}

function prepareOptions(tsConfig: TranspileOptions) {
  // Remove 'moduleResolution' to fix 'Unexpected moduleResolution: node' issue.
  const { moduleResolution, ...rest } = tsConfig.compilerOptions ?? {};
  return {
    ...(rest ?? {}),
    noEmit: true,
    noUnusedLocals: true,
  };
}

function mockHost(
  fileName: string,
  sourceFile: SourceFile,
  sourceText: string,
  options: CompilerOptions,
): CompilerHost {
  return {
    fileExists: fn => fn === fileName,
    readFile: fn => (fn === fileName ? sourceText : undefined),
    getSourceFile: fn => (fn === fileName ? sourceFile : undefined),
    getDefaultLibFileName: () => ts.getDefaultLibFileName(options),
    writeFile: () => undefined,
    getCurrentDirectory: () => '',
    getDirectories: () => [],
    getCanonicalFileName: fn => (sys.useCaseSensitiveFileNames ? fn : fn.toLowerCase()),
    useCaseSensitiveFileNames: () => sys.useCaseSensitiveFileNames,
    getNewLine: () => '\n',
  };
}

function transform(m: Diagnostic): UnusedId | undefined {
  const { code, start: pos, messageText: text } = m;
  if (pos === undefined || typeof text !== 'string') return;
  switch (code as UnusedCode) {
    case UnusedCode.SINGLE_1:
    case UnusedCode.SINGLE_2: {
      // ts(6133): 'XXX' is declared but its value is never read.
      // ts(6196): 'XXX' is declared but never used.
      const id = /^'(\w+)' is declared but/.exec(text)?.[1];
      if (!id) return;
      return { code, id, pos };
    }
    case UnusedCode.ALL:
      return { code, pos }; // ts(6192): All imports in import declaration are unused.
  }
  return;
}
