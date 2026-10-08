import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { output } from './paths.mjs';

const report = JSON.parse(await fs.readFile(path.join(output, 'report.json'), 'utf8'));
const base = report.base;
const directory = path.join(output, 'dist');
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (!url.pathname.startsWith(base)) { res.writeHead(404); return res.end('Outside configured base'); }
  let file = decodeURIComponent(url.pathname.slice(base.length));
  if (file.includes('..')) { res.writeHead(400); return res.end(); }
  if (!path.extname(file)) file = `${file.replace(/\/$/, '')}/index.html`.replace(/^\//, '');
  let bytes;
  try { bytes = await fs.readFile(path.join(directory, file)); }
  catch { res.statusCode = 404; file = '404.html'; bytes = await fs.readFile(path.join(directory, file)); }
  const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2' };
  res.setHeader('Content-Type', mime[path.extname(file)] ?? 'text/plain'); res.end(bytes);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await chromium.launch({ headless: true });
  const nojs = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await nojs.newPage();
  const response = await staticPage.goto(`${origin}${base}solid/components/button#anatomy`);
  assert.equal(response.status(), 200);
  assert.equal(await staticPage.locator('main h1').innerText(), 'Button');
  assert.ok((await staticPage.locator('main').innerText()).includes('Usage guidelines'));
  assert.equal(await staticPage.locator('#anatomy').count(), 1);
  await staticPage.setViewportSize({ width: 390, height: 844 });
  await staticPage.locator('.SiteMobileNav summary').click();
  assert.ok(await staticPage.locator('.SiteMobileNav a').first().isVisible());
  const missing = await staticPage.goto(`${origin}${base}does-not-exist`);
  assert.equal(missing.status(), 404);
  assert.equal(await staticPage.locator('main h1').innerText(), 'Page not found');
  await nojs.close();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${origin}${base}solid/components/button`);
  const search = page.getByRole('button', { name: 'Search docs' });
  await search.focus(); await page.keyboard.press('Enter');
  await page.getByRole('dialog').waitFor();
  assert.equal(await page.locator('#search-query').evaluate((el) => el === document.activeElement), true);
  await page.getByRole('searchbox').fill('button');
  await page.getByRole('dialog').getByRole('link', { name: 'Button', exact: true }).waitFor();
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  await page.waitForFunction(() => document.activeElement?.textContent === 'Search docs');
  assert.equal(await search.evaluate((el) => el === document.activeElement), true);
  assert.deepEqual(errors, []);
  console.log(`PASS Chromium: ${base} deep link + anchor, no-JS prose/mobile navigation, 404 status, Solid RC13 search, keyboard open/Escape/focus restoration, no browser errors`);
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
