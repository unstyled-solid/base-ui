// Read-only AST inventory for reviewing a new pinned source or a failed handler mapping.
import fs from 'node:fs/promises';
import { parseMdx, walk } from '../../content/transforms/parse.mjs';
const snapshot = JSON.parse(await fs.readFile('docs/upstream/snapshot.json', 'utf8'));
const nodes = new Map();
const expressions = [];
for (const record of snapshot.records.filter((r) => r.kind === 'page')) {
  const tree = parseMdx(await fs.readFile(record.destination, 'utf8'), record.source);
  walk(tree, (node) => {
    if (node.name) {
      const entry = nodes.get(node.name) ?? { name: node.name, count: 0, example: `${record.source}:${node.position.start.line}`, attributes: new Set() };
      entry.count++;
      for (const attr of node.attributes ?? []) entry.attributes.add(attr.name ?? attr.type);
      nodes.set(node.name, entry);
    }
    if (['mdxFlowExpression', 'mdxTextExpression'].includes(node.type) && node.data.estree.body.length) expressions.push({ source: record.source, value: node.value });
  });
}
console.log(JSON.stringify({ nodes: [...nodes.values()].filter((n) => !n.name.startsWith('Demo') && !n.name.startsWith('Types')).map((n) => ({ ...n, attributes: [...n.attributes] })), expressions }, null, 2));
