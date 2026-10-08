import { defineConfig, type Plugin } from 'vite';
import solid from '@solidjs/vite-plugin';
import tailwind from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';
import { root, output, basePath } from './scripts/site/paths.mjs';
import { generate } from './scripts/site/generate.mjs';

const base = basePath();
const generated = await generate({ base });
function sitePlugin(): Plugin {
  return {
    name: 'source-tracked-static-docs',
    resolveId(id) { if (id === 'virtual:docs-demo-runtime') return '\0' + id; },
    load(id) {
      if (id !== '\0virtual:docs-demo-runtime') return;
      const runtime = path.join(root, 'docs/demos/shared/runtime.tsx');
      return fs.existsSync(runtime) ? `export { mountDemo } from ${JSON.stringify(runtime)};` : 'export function mountDemo(host, id) { throw new Error(`Missing docs/demos/shared/runtime.tsx mountDemo(host, id) for ${id}; coordinate bsolid-docs-demos`); }';
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://localhost');
        if (!url.pathname.startsWith(base)) return next();
        const route = decodeURIComponent(url.pathname.slice(base.length));
        if (route.includes('..') || route.includes('\\')) { res.statusCode = 400; return res.end('Invalid path'); }
        if (route === 'islands.js') {
          const transformed = await server.transformRequest('/@fs/' + path.join(root, 'docs/site/islands.tsx'));
          res.setHeader('Content-Type', 'text/javascript'); return res.end(transformed?.code ?? '');
        }
        let file = path.join(output, route);
        if (!path.extname(file)) file = path.join(file, 'index.html');
        if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
          if (path.extname(route) || route.startsWith('@') || route.startsWith('node_modules')) return next();
          file = path.join(output, '404.html'); res.statusCode = 404;
        }
        const types: Record<string, string> = { '.html': 'text/html', '.css': 'text/css', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };
        res.setHeader('Content-Type', types[path.extname(file)] ?? 'application/octet-stream');
        let content: string | Buffer = fs.readFileSync(file);
        if (file.endsWith('.html')) content = await server.transformIndexHtml(url.pathname, content.toString());
        res.end(content);
      });
    },
    generateBundle(_options, bundle) {
      for (const file of JSON.parse(fs.readFileSync(path.join(output, 'files.json'), 'utf8')) as string[]) {
        // Build reports contain source locations, not public deployable content.
        if (file === 'report.json') continue;
        let source: string | Buffer = fs.readFileSync(path.join(output, file));
        if (file.endsWith('.html')) {
          const css = Object.values(bundle).filter(item => item.type === 'asset' && item.fileName.endsWith('.css')).map(item => `<link rel="stylesheet" href="${base}${item.fileName}">`).join('');
          source = source.toString().replace('</head>', css + '</head>');
        }
        this.emitFile({ type: 'asset', fileName: file.replace(/^\.\//, ''), source });
      }
      for (const item of Object.values(bundle)) {
        if (item.type === 'chunk' && Object.keys(item.modules).some((id) => /(?:node_modules\/(?:\.pnpm\/)?(?:react(?:-dom)?@|next@|solid-js@1\.|@solidjs\/router)|upstream\/base-ui\/)/.test(id))) this.error(`Forbidden browser dependency in ${item.fileName}`);
      }
    },
  };
}
export default defineConfig({
  root: path.join(root, 'docs/site'), base,
  // Match the library's verified RC13 harness compiler backend.
  plugins: [solid({ compiler: 'babel' }), tailwind(), sitePlugin()],
  css: { postcss: { plugins: [] } },
  build: {
    outDir: path.join(output, 'dist'), emptyOutDir: true,
    rolldownOptions: { input: path.join(root, 'docs/site/islands.tsx'), output: { entryFileNames: 'islands.js', chunkFileNames: 'assets/[name]-[hash].js', assetFileNames: 'assets/[name]-[hash][extname]' } },
  },
  server: { fs: { allow: [root] } },
});
