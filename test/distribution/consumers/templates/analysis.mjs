import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { publint } from 'publint';
import { Package, checkPackage } from '@arethetypeswrong/core';
import { classifyAnalysis } from './attw.mjs';

const input = JSON.parse(await fs.readFile('input.json', 'utf8'));
const directory = path.resolve('node_modules', input.name);
const lint = await publint({ pkgDir: directory });
await fs.writeFile('publint-result.json', JSON.stringify(lint, null, 2));
const files = {};
for (const file of input.inventory) files[`/node_modules/${input.name}/${file.file}`] = await fs.readFile(path.join(directory, file.file));
const analysis = await checkPackage(new Package(files, input.name, input.version), { entrypoints: Object.keys(input.exports) });
// Preserve the entire analysis before applying the shared, exact resolver policy.
await fs.writeFile('attw-result.json', JSON.stringify(analysis, null, 2));
const classification = classifyAnalysis(analysis);
await fs.writeFile('attw-classification.json', JSON.stringify(classification, null, 2));
assert.equal(lint.messages.length, 0, 'publint findings (full diagnostics preserved)');
assert.equal(classification.failures.length, 0, 'ATTW supported/unclassified findings (full analysis preserved)');
