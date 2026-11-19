import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
export async function exportInventory() {
  const contract = JSON.parse(await fs.readFile(path.join(root, 'distribution/exports.json')));
  const upstream = JSON.parse(await fs.readFile(path.join(root, contract.sourceManifest)));
  assert.deepEqual(Object.keys(upstream.exports).sort(), Object.keys(contract.exports).sort());
  const config = ts.readConfigFile(path.join(root, 'tsconfig.json'), ts.sys.readFile);
  const options = ts.parseJsonConfigFileContent(config.config, ts.sys, root).options;
  const resolve = async (prefix, target) => {
    let file = path.join(root, prefix, target);
    if (!ts.sys.fileExists(file) && file.endsWith('.tsx')) file = file.slice(0, -1);
    assert(ts.sys.fileExists(file), `Missing source entry ${file}`);
    return file;
  };
  const entries = await Promise.all(Object.entries(contract.exports).map(async ([key, entry]) => ({ key,
    upstream: await resolve('upstream/base-ui/packages/react', entry.upstream),
    target: await resolve('packages/solid', entry.target),
    declarations: await resolve('packages/solid/build/types', entry.target.slice(6).replace(/\.tsx?$/, '.d.ts')),
  })));
  const program = ts.createProgram(entries.flatMap(entry => [entry.upstream, entry.target, entry.declarations]), options);
  const checker = program.getTypeChecker();
  function symbols(file) {
    const result = [];
    function visit(symbol, prefix = '', seen = new Set()) {
      for (const exported of checker.getExportsOfModule(symbol)) {
        const name = prefix + exported.name;
        const actual = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
        const declarations = actual.declarations ?? [];
        // Merged class/namespace symbols expose TS's synthetic prototype as a
        // namespace member. It is not an authored export or missing source.
        if (exported.name === 'prototype' && !declarations.length) continue;
        result.push({ name, declarations: declarations.map(d => ({ file: path.relative(root, d.getSourceFile().fileName), line: d.getSourceFile().getLineAndCharacterOfPosition(d.getStart()).line + 1 })) });
        if ((actual.flags & ts.SymbolFlags.Module) && !seen.has(actual)) visit(actual, name + '.', new Set([...seen, actual]));
      }
    }
    visit(checker.getSymbolAtLocation(program.getSourceFile(file)));
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }
  return entries.map(entry => ({ key: entry.key, upstream: symbols(entry.upstream), target: symbols(entry.target), declarations: symbols(entry.declarations) }));
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const inventory = await exportInventory();
  console.log(JSON.stringify(inventory.map(entry => ({ key: entry.key,
    missing: entry.upstream.filter(s => !entry.target.some(t => t.name === s.name)).map(s => s.name),
    declarationMissing: entry.target.filter(s => !entry.declarations.some(t => t.name === s.name)).map(s => s.name),
  })).filter(e => e.missing.length || e.declarationMissing.length), null, 2));
}
