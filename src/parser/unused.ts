import ts, {
  CompilerHost,
  CompilerOptions,
  Diagnostic,
  SourceFile,
  sys,
} from 'typescript';

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
  allIds: Set<string>,
  importNodes: ImportNode[],
  fileName: string,
  sourceFile: SourceFile,
  sourceText: string,
  tsCompilerOptions?: CompilerOptions,
): NameUsage {
  const UNUSED_CODE = new Set(
    Object.values(UnusedCode).filter((v): v is number => typeof v === 'number'),
  );
  const unusedNames = new Set<string>();
  const unusedNodes = Array<ImportNode>();
  const options = prepareOptions(tsCompilerOptions);
  const host = mockHost(fileName, sourceFile, sourceText, options);
  const program = ts.createProgram([fileName], options, host);
  try {
    // https://github.com/microsoft/TypeScript/wiki/API-Breaking-Changes#program-interface-changes
    program
      .getSemanticDiagnostics(sourceFile)
      .filter(m => m.file === sourceFile && UNUSED_CODE.has(m.code))
      .forEach(m => transform(m, importNodes, unusedNames, unusedNodes));
  } catch (e) {
    return { usedNames: allIds };
  }
  return { unusedNames, unusedNodes };
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

function transform(
  m: Diagnostic,
  importNodes: ImportNode[],
  unusedNames: Set<string>,
  unusedNodes: ImportNode[],
) {
  const { code, start: pos, messageText: text } = m;
  if (pos === undefined || typeof text !== 'string') return;
  if (code === UnusedCode.SINGLE_1 || code === UnusedCode.SINGLE_2) {
    // ts(6133): 'XXX' is declared but its value is never read.
    // ts(6196): 'XXX' is declared but never used.
    const id = /^'(\w+)' is declared but/.exec(text)?.[1];
    if (!id) return;
    unusedNames.add(id);
  } else if (code === UnusedCode.ALL) {
    // ts(6192): All imports in import declaration are unused.
    const node = importNodes.find(n => n.withinDeclRange(pos));
    if (!node) return;
    node.allNames().forEach(n => unusedNames.add(n));
    unusedNodes.push(node);
  }
}
