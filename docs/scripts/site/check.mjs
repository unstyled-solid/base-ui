import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';
import { output } from './paths.mjs';

export async function check({ publish = false, dist = false } = {}) {
  const report = JSON.parse(await fs.readFile(path.join(output, 'report.json'), 'utf8'));
  const directory = dist ? path.join(output, 'dist') : output;
  const failures = [];
  failures.push(...report.issues.map(issue => `${issue.location}: ${issue.kind}: ${issue.detail}`));
  const docs = new Map();
  const routes = [...report.routes, { route: '/', file: 'index.html' }];
  for (const route of routes) {
    const html = await fs.readFile(path.join(directory, route.file), 'utf8');
    const doc = new JSDOM(html).window.document;
    docs.set(route.route, doc);
    if (!doc.querySelector('main h1') || !doc.querySelector('head title') || !doc.querySelector('link[rel=canonical]')) failures.push(`${route.route}: missing static heading/title/canonical`);
    const ids = new Set();
    for (const e of doc.querySelectorAll('[id]')) { if (ids.has(e.id)) failures.push(`${route.route}: duplicate id ${e.id}`); ids.add(e.id); }
    if (doc.querySelector('script:not([type=module]),script[src*="react"],script[src*="next"]')) failures.push(`${route.route}: unexpected executable source`);
  }
  for (const [route, doc] of docs) {
    for (const e of doc.querySelectorAll('a[href],link[href],img[src],script[src]')) {
      const href = e.getAttribute('href') ?? e.getAttribute('src');
      const url = new URL(href, `https://site.invalid${report.base}${route.slice(1)}`);
      if (url.origin !== 'https://site.invalid') continue;
      if (!url.pathname.startsWith(report.base)) { failures.push(`${route}: link escapes base ${href}`); continue; }
      let destination = '/' + url.pathname.slice(report.base.length).replace(/\/$/, '');
      if (destination.endsWith('/index.html')) destination = destination.slice(0, -11) || '/';
      const target = docs.get(destination);
      if (target) {
        if (url.hash && !target.getElementById(decodeURIComponent(url.hash.slice(1)))) failures.push(`${route}: missing fragment ${href}`);
      } else {
        // Module is built only by Vite; generation checks other static resources.
        if (!dist && destination === '/islands.js') continue;
        try { await fs.access(path.join(directory, destination.slice(1))); }
        catch { failures.push(`${route}: missing local destination ${href}`); }
      }
    }
  }
  if (publish) {
    if (!report.origin || report.origin.endsWith('.invalid')) failures.push('Set DOCS_ORIGIN to the canonical deployment origin');
  }
  return { routes: report.routes.length, failures: [...new Set(failures)] };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  if (args.some((a) => !['--publish', '--dist'].includes(a))) throw new Error(`Unknown check arguments ${args.join(' ')}`);
  const result = await check({ publish: args.includes('--publish'), dist: args.includes('--dist') });
  if (result.failures.length) { console.error(`${result.failures.length} site check failures:\n${result.failures.join('\n')}`); process.exitCode = 1; }
  else console.log(`PASS: ${result.routes} static routes, metadata, anchors, local links and deployment base${args.includes('--dist') ? ', Vite artifacts' : ''}`);
}
