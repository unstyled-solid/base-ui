import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { inventory } from './inventory.mjs';
import { manualPlatforms, protocols } from './model.mjs';
import { options, owned, cache } from './prepare.mjs';

const args = options(process.argv.slice(2), ['--output']);
const data = await inventory();
const rows = manualPlatforms.flatMap((platform) => protocols.map((protocol) => ({
  id: `${platform.id}:${protocol}`, status: 'blocked', artifactSha256: null,
  os: platform.os, osVersion: null, at: platform.at, atVersion: null,
  browser: platform.browser, browserVersion: null, operator: null, executedAt: null,
  physicalDevice: false, emulated: false, deviceModel: null,
  recording: null, transcript: null,
  familyResults: data.families.map((family) => ({ family, status: 'blocked', fixtureUrl: null, steps: [],
    expected: [], observedSpeech: [], observedFocus: [], blocker: 'Not executed; see protocol and canonical source inventory.' })),
} )));
const path = owned(resolve(args['--output'] ?? resolve(cache, 'manual-evidence.json')));
await mkdir(dirname(path), { recursive: true });
await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log(`Manual template (all blocked): ${path}`);
