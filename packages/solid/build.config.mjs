// RC13 native SSR captures erased generic types in hoisted props. The pinned
// Babel backend is intentional, tested against actual production declarations
// and SSR -> browser hydration by scripts/distribution/build/smoke.mjs.
export default Object.freeze({
  compiler: 'babel',
  compilerVersion: '2.0.0-rc.13',
  babelVersion: '7.29.7',
  moduleName: '@solidjs/web',
  hydratable: true,
  dev: false,
  target: 'ES2022',
  docsDirectory: 'docs/public',
});
