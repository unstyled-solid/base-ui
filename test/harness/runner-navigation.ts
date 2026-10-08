import type { Plugin } from 'vite';

/** A native _blank link must not instantiate a second tester on its channel. */
export function isAuxiliaryTesterNavigation(url: string, destination: string | undefined) {
  const parsed = new URL(url, 'http://harness.invalid');
  return destination === 'document' && parsed.pathname === '/' && parsed.searchParams.has('sessionId');
}

export function runnerNavigationBoundary(): Plugin {
  return {
    name: 'harness-auxiliary-tester-navigation',
    enforce: 'pre',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (!isAuxiliaryTesterNavigation(request.url ?? '/', request.headers['sec-fetch-dest'] as string | undefined)) return next();
        response.setHeader('Content-Type', 'text/html; charset=utf-8');
        response.end('<!doctype html><html><head><title>Auxiliary navigation</title></head><body></body></html>');
      });
    },
  };
}
