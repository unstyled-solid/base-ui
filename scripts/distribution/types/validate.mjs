import fs from 'node:fs/promises';
import path from 'node:path';
import { assertExportMap, contracts, packageRoot, readJson } from './shared.mjs';
import { classifyAnalysis } from './attw.mjs';

async function tool(name) {
  try { return await import(name); }
  catch (error) {
    if (error.code === 'ERR_MODULE_NOT_FOUND') throw new Error(`Distribution validation tool ${name} is not installed. Dependency integration request is on bsolid-review-setup.`);
    throw error;
  }
}

async function main() {
  const mode = process.argv[2];
  if (mode === '--api-extractor') {
    const module = await tool('@microsoft/api-extractor');
    const { Extractor, ExtractorConfig } = module.default ?? module;
    const config = ExtractorConfig.loadFileAndPrepare(path.join(packageRoot, 'api-extractor.json'));
    const result = Extractor.invoke(config, { localBuild: true, showVerboseMessages: true });
    if (!result.succeeded || result.errorCount) throw new Error(`API Extractor failed with ${result.errorCount} errors and ${result.warningCount} warnings.`);
    console.log(`API Extractor validated generated declarations (${result.warningCount} unsuppressed warnings).`);
  } else if (mode === '--package') {
    // These tools need the genuine complete staged runtime package; never synthesize
    // DOM/server stubs just to pass package analysis.
    const { publint } = await tool('publint');
    const { Package, checkPackage } = await tool('@arethetypeswrong/core');
    const directory = path.join(packageRoot, 'build');
    const metadata = await readJson(path.join(directory, 'package.json'));
    const { exports: contract, pkg: contractPackage } = await contracts();
    assertExportMap(metadata.exports, contract, contractPackage);
    for (const entry of Object.values(metadata.exports)) {
      for (const target of Object.values(entry)) await fs.access(path.join(directory, target));
    }
    const lint = await publint({ pkgDir: directory });
    console.log(JSON.stringify({ publint: lint.messages }, null, 2));
    if (lint.messages.length) throw new Error(`publint reported ${lint.messages.length} package findings.`);
    const files = {};
    async function collect(location) {
      for (const entry of await fs.readdir(location, { withFileTypes: true })) {
        if (entry.name === 'node_modules') continue;
        const file = path.join(location, entry.name);
        if (entry.isDirectory()) await collect(file);
        else if (entry.isFile()) files[`/node_modules/${metadata.name}/${path.relative(directory, file).split(path.sep).join('/')}`] = await fs.readFile(file);
        else throw new Error(`Nonportable staged package entry ${file}`);
      }
    }
    await collect(directory);
    const analysis = await checkPackage(new Package(files, metadata.name, metadata.version), { entrypoints: Object.keys(metadata.exports) });
    const classification = classifyAnalysis(analysis);
    console.log(JSON.stringify({ types: analysis.types, ...classification }, null, 2));
    if (classification.failures.length) throw new Error(`AreTheTypesWrong reported ${classification.failures.length} supported or unclassified package findings.`);
  } else throw new Error('Usage: node scripts/distribution/types/validate.mjs --api-extractor | --package');
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
