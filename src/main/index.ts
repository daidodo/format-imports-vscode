import ts, {
  CompilerOptions,
  ScriptTarget,
} from 'typescript';

import {
  ComposeConfig,
  configForCompose,
  Configuration,
} from '../config';
import {
  apply,
  EditManager,
} from '../edit';
import {
  ExportNode,
  getUnusedIds,
  ImportNode,
  parseSource,
  RangeAndEmptyLines,
  UnusedId,
} from '../parser';
import {
  Sorter,
  sortExports,
  sortImports,
} from '../sort';

export default function formatSource(
  fileName: string,
  sourceText: string,
  config: Configuration,
  tsCompilerOptions?: CompilerOptions,
) {
  const sourceFile = ts.createSourceFile(fileName, sourceText, ScriptTarget.Latest);
  const { importNodes, importsInsertPoint: point, exportNodes } = parseSource(
    sourceFile,
    sourceText,
    config,
  );
  const editManager = new EditManager([...importNodes, ...exportNodes]);
  if (editManager.empty()) return undefined;
  const composeConfig = configForCompose(config);
  const unusedIds = () => getUnusedIds(fileName, sourceFile, sourceText, tsCompilerOptions);
  const { text, sorter } = formatImports(importNodes, point, unusedIds, config, composeConfig);
  if (text && point) editManager.insert({ range: point, text, trailingNewLines: 2 });
  const edits = formatExports(exportNodes, config, composeConfig, sorter);
  edits.forEach(e => editManager.insert(e));

  return apply(sourceText, sourceFile, editManager.generateEdits(composeConfig));
}

function formatImports(
  importNodes: ImportNode[],
  insertPoint: RangeAndEmptyLines | undefined,
  unusedIds: () => UnusedId[],
  config: Configuration,
  composeConfig: ComposeConfig,
) {
  if (!insertPoint || !importNodes.length) return {};
  const { groups, sorter } = sortImports(importNodes, unusedIds(), config);
  const { nl } = composeConfig;
  const text = groups.compose(composeConfig, nl + nl);
  return { text, sorter, composeConfig };
}

function formatExports(
  exportNodes: ExportNode[],
  config: Configuration,
  composeConfig: ComposeConfig,
  sorter?: Sorter,
) {
  if (!exportNodes.length) return [];
  sortExports(exportNodes, config, sorter);
  return exportNodes
    .filter(n => !n.empty())
    .map(n => ({ range: n.range, text: n.compose(composeConfig) }));
}
