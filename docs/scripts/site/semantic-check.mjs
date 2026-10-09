import { readPages, preparePublicPages } from './generate.mjs';
const failures = [];
for (const page of preparePublicPages(await readPages())) {
  if (!page.route.startsWith('/solid/')) continue;
  function visit(node) {
    if (node.type === 'code' && !node.data?.frameworkContext && /React\.|\bclassName\b|render=\{\s*</.test(node.value)) failures.push({route:page.route,line:node.position?.start?.line,source:node.value});
    if (node.type === 'code' && !node.data?.frameworkContext && /(?:from\s*|import\s*\(\s*)['"]baseui-solid2(?:\/|['"])/.test(node.value)) failures.push({route:page.route,reason:'Private workspace import in public example'});
    for (const child of node.children ?? []) visit(child);
  }
  visit(page.ast);
}
console.log(JSON.stringify(failures,null,2));
if (failures.length) process.exitCode = 1;
