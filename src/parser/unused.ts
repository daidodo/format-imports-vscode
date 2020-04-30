import ts, {
  CompilerHost,
  CompilerOptions,
  Diagnostic,
  SourceFile,
  sys,
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
  tsCompilerOptions?: CompilerOptions,
) {
  const UNUSED_CODE = new Set(
    Object.values(UnusedCode).filter((v): v is number => typeof v === 'number'),
  );
  const options = prepareOptions(tsCompilerOptions);
  const host = mockHost(fileName, sourceFile, sourceText, options);
  const program = ts.createProgram([fileName], options, host);
  // https://github.com/microsoft/TypeScript/wiki/API-Breaking-Changes#program-interface-changes
  return program
    .getSemanticDiagnostics(sourceFile)
    .filter(m => m.file === sourceFile && UNUSED_CODE.has(m.code))
    .map(transform)
    .filter((r): r is UnusedId => !!r);
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
