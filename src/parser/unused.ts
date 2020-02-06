import ts, {
  CompilerHost,
  CompilerOptions,
  SourceFile,
  sys,
  TranspileOptions,
} from 'typescript';

import { UnusedId } from './types';

export function getUnusedIds(
  fileName: string,
  sourceFile: SourceFile,
  sourceText: string,
  tsConfig: TranspileOptions,
) {
  const UNUSED_CODE = new Set([6133, 6196]);
  const options = prepareOptions(tsConfig);
  const host = mockHost(fileName, sourceFile, sourceText, options);
  const program = ts.createProgram([fileName], options, host);
  const semanticDiagnostic = ts.getPreEmitDiagnostics(program);
  return semanticDiagnostic
    .filter(
      m => m.file === sourceFile && UNUSED_CODE.has(m.code) && typeof m.messageText === 'string',
    )
    .map(m => ({ id: extractId(m.messageText as string), pos: m.start }))
    .filter((r): r is UnusedId => !!r.id && r.pos !== undefined);
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

function extractId(message: string) {
  // 'XXX' is declared but its value is never read.
  const r = /^'(\w+)' is declared but/.exec(message);
  return r?.[1];
}
