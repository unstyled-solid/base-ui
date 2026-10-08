import { readPages } from './generate.mjs';
import { adaptPage } from '../../content/handbooks/overlays.mjs';
const failures = [];
for (const source of await readPages()) {
  if (!source.route.startsWith('/solid/')) continue;
  const page = adaptPage(source);
  function visit(node) {
    if (node.type === 'code' && !node.data?.frameworkContext && /React\.|\bclassName\b|render=\{\s*</.test(node.value)) failures.push({route:page.route,line:node.position?.start?.line,source:node.value});
    for (const child of node.children ?? []) visit(child);
  }
  visit(page.ast);
}
console.log(JSON.stringify(failures,null,2));
if (failures.length) process.exitCode = 1;
