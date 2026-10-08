// Reviewed ownership policy. Ticket sourcePaths are read references, not ownership.
// Each override remains visible alongside displaced target-allowlist claims.
const serialized = {
  autocomplete: ['forms'], combobox: ['input', 'multiple', 'popup'], dialog: ['handles'],
  drawer: ['gestures', 'keyboard'], field: ['control'], 'filter-dropdown': ['parts'],
  menu: ['filtering', 'items'], 'navigation-menu': ['interactions', 'layout'],
  'number-field': ['editing', 'scrub'], 'otp-field': ['editing'], popover: ['handles'],
  'preview-card': ['handles'], 'scroll-area': ['gestures'], select: ['interactions', 'layout'],
  slider: ['gestures', 'keyboard'], toast: ['accessibility', 'layout'], tooltip: ['handles'],
};
const exclusion = (pattern, owner, reason) => ({ pattern, owner, reason, disposition: 'excluded-with-reason' });
const framework = (pattern, reason) => ({ pattern, owner: 'bsolid-lifecycle', reason, disposition: 'framework-only' });
const translated = (pattern, owner, target, reason, replace) => ({ pattern, owner, target, reason, replace, disposition: 'translated' });

export const policy = {
  serializedFamilies: Object.entries(serialized).map(([family, stages]) => ({
    owner: `bsolid-c-${family}`, stages: [`bsolid-c-${family}`, ...stages.map((s) => `bsolid-c-${family}-${s}`)],
  })),
  overrides: [
    translated('packages/react/src/index.test.tsx', 'bsolid-integration', 'test/integration/exports.test.tsx', 'Root export assertions belong to cross-family integration.'),
    ...['index.ts', 'types.ts', 'utils.ts'].map((leaf) => ({ ...translated(`packages/react/src/floating-ui-react/${leaf}`, 'bsolid-integration', `packages/solid/src/floating-ui-react/${leaf}`, 'docs/contracts.md delegates shared floating facades to integration; allowlist extension requires coordination.'), seam: 'bsolid-bootstrap-command-handoff' })),
    translated('packages/react/src/floating-ui-react/components/FloatingRootStore.ts', 'bsolid-floating-core', 'packages/solid/src/floating-ui-react/components/createFloatingRoot.ts', 'React store implementation becomes native owned floating root state.'),
    translated('packages/react/src/floating-ui-react/components/FloatingTreeStore.ts', 'bsolid-floating-core', 'packages/solid/src/floating-ui-react/components/createFloatingTree.ts', 'React store implementation becomes native owned floating tree state.'),
    translated('packages/react/src/floating-ui-react/hooks/useHoverShared.ts', 'bsolid-dismiss', 'packages/solid/src/floating-ui-react/hooks/hoverShared.ts', 'Dismiss lane owns shared hover state under its renamed leaf.'),
    translated('packages/react/src/utils/resolveClassName.ts', 'bsolid-render', 'packages/solid/src/utils/resolveClass.ts', 'Solid class spelling replaces React className.'),
    translated('packages/utils/src/store/**', 'bsolid-state', 'packages/solid/src/utils/state/', 'Store/selectors/subscription behavior maps to native state; React subscription machinery is not copied.', '^packages/utils/src/store/'),
    ...['fastHooks', 'getReactElementRef', 'reactVersion', 'safeReact', 'useForcedRerendering', 'useIsoLayoutEffect', 'useOnFirstRender', 'useOnMount', 'useRefWithInit', 'useValueAsRef'].map((stem) => framework(`packages/utils/src/${stem}.*`, 'React lifecycle/ref/version machinery has no Solid runtime equivalent; preserve observable consumers through native setup ownership and Solid refs. Tests remain inventoried, not counted as passing.')),
    translated('packages/utils/src/testUtils.ts', 'bsolid-harness', 'test/harness/utils.ts', 'Framework test helpers are translated by the harness.'),
    translated('packages/utils/src/generateId.ts', 'bsolid-lifecycle', 'packages/solid/src/utils/createId.ts', 'Stable Solid IDs require SSR/hydration evidence; no global React ID generator copied.'),
    ...[
      ['public-types', 'bsolid-dist-types', 'test/distribution/types/'],
      ['bundle-size', 'bsolid-dist-shaking', 'test/distribution/tree-shaking/'],
      ['node-resolution', 'bsolid-dist-pack', 'test/distribution/consumers/'],
      ['screen-reader', 'bsolid-accessibility', 'test/qualification/accessibility/'],
    ].map(([folder, owner, target]) => translated(`test/${folder}/**`, owner, target, 'Qualification fixtures map to their dedicated consumer/type/accessibility owner.', `^test/${folder}/`)),
    ...['setupVitest.ts', 'vite.shared.config.mjs', 'vite.d.ts', 'tsconfig.json', 'package.json'].map((leaf) => translated(`test/${leaf}`, 'bsolid-harness', `test/harness/upstream/${leaf}`, 'Shared upstream test configuration informs the native Solid harness.')),
  ],
  rules: [
    { pattern: 'docs/**', owner: 'bsolid-docs-content', targetPrefix: 'docs/upstream/', disposition: 'translated', reason: 'Docs-content owns source intake/provenance; imported assets and React/Next transformations require its own manifest. This is a planned input mapping, not executable reuse.' },
    { pattern: 'packages/react/test/**', owner: 'bsolid-harness', targetPrefix: 'test/harness/upstream/', disposition: 'translated', reason: 'Upstream conformance/renderer fixtures require Solid harness adaptation; runtime collection remains unresolved.' },
    ...['packages/react/*', 'packages/react/scripts/**', 'packages/utils/*'].map((pattern) => exclusion(pattern, 'bsolid-dist-contract', 'React package build/release metadata informs the independent Solid distribution contract; not shipped verbatim. Runtime and nested source inputs are handled separately.')),
    ...['test/**'].map((pattern) => ({ pattern, owner: 'bsolid-browser', targetPrefix: 'test/qualification/browser/upstream/', disposition: 'translated', reason: 'Qualification source inputs, not passing cases; browser, accessibility, packed-consumer and type owners must refine target mappings before execution.' })),
    ...['scripts/**', '.github/**', '.circleci/**', '.agents/**', '.claude/**', '.codex/**', '.vscode/**', 'playground/**', 'examples/**', 'netlify/**'].map((pattern) => exclusion(pattern, 'bsolid-upstream-impact', 'Upstream development/automation or experimental application asset is retained as a reconciliation input, not part of the published Solid library. Changes require impact triage.')),
    ...['greptile.json', 'nx.json'].map((pattern) => exclusion(pattern, 'bsolid-dist-contract', 'React repository review/build orchestration is not reused in the Solid toolchain; retained for reconciliation.')),
    ...['.browserslistrc', '.editorconfig', '.gitattributes', '.gitignore', '.lintignore', '.npmrc', '.remarkrc.mjs', '.vale.ini', 'AGENTS.md', 'CHANGELOG.md', 'CHANGELOG.old.md', 'CLAUDE.md', 'CONTRIBUTING.md', 'README.md', 'SECURITY.md', 'babel.config.mjs', 'eslint.config.mjs', 'lerna.json', 'netlify.toml', 'package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', 'prettier.config.mjs', 'renovate.json', 'skills-lock.json', 'stylelint.config.mjs', 'tsconfig.base.json', 'tsconfig.json', 'vitest.config.mts', 'vitest.shared.mts'].map((pattern) => exclusion(pattern, 'bsolid-dist-contract', 'Pinned upstream repository/toolchain metadata is tracked for impact; Solid workspace versions and build commands are independently owned.')),
    { pattern: 'LICENSE', owner: 'bsolid-dist-contract', disposition: 'pure-adapted', reason: 'MIT license and copyright notices must be preserved in distribution.', targetPrefix: '' },
  ],
};
