import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const root = fileURLToPath(new URL('../../../', import.meta.url));
export const output = path.resolve(root, process.env.DOCS_OUTPUT ?? 'docs/generated/site');
if (!output.startsWith(path.join(root, 'docs/generated') + path.sep)) throw new Error('DOCS_OUTPUT must stay within docs/generated/');
export const sha = '19511bb171f3b360b006c94cf6d07e53cb446505';
export function basePath(value = process.env.DOCS_BASE ?? '/') {
  if (!/^\/(?:[A-Za-z0-9_-]+\/)*$/.test(value)) throw new Error('DOCS_BASE must be an absolute directory path with a trailing slash, e.g. /base-ui/');
  return value;
}
export function localUrl(url, base = '/') {
  if (/^(?:https?:|mailto:|tel:|#|\/\/)/i.test(url)) return url;
  if (/^[a-z][a-z\d+.-]*:/i.test(url)) throw new Error(`Unsafe URL: ${url}`);
  return url.startsWith('/') ? base + url.slice(1) : url;
}
export function routeFile(route) {
  if (!/^\/(?:[a-zA-Z0-9_-]+\/?)*$/.test(route)) throw new Error(`Unsafe route: ${route}`);
  return `${route.slice(1) || '.'}/index.html`;
}
