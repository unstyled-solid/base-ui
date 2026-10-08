export const SOURCE_SHA = '19511bb171f3b360b006c94cf6d07e53cb446505';
export const VERSION = 'bsolid-docs-content/1';
export const PUBLIC_ROOT = 'docs/src/app/(docs)/react';
export const SNAPSHOT = 'docs/upstream/base-ui';
export const OUTPUT = 'docs/upstream/generated';
export const PACKAGE = 'baseui-solid2'; // Private workspace identity, not a publication claim.

export const tools = {
  unified: '11.0.5', 'remark-parse': '11.0.0', 'remark-mdx': '3.1.1',
  'remark-gfm': '4.0.1', 'unist-util-visit': '5.0.0',
  'hast-util-heading-rank': '3.0.0', 'hast-util-to-string': '3.0.1',
  postcss: '8.5.6', 'postcss-value-parser': '4.2.0', typescript: '5.9.3',
};
export const helpers = [
  'docs/src/mdx/remarkHeadingTags.mjs',
  'docs/src/components/QuickNav/remarkQuickNavExcludeHeading.mjs',
  'docs/src/components/QuickNav/rehypeSlug.mjs',
  'docs/scripts/generateLlmTxt/mdxNodeHelpers.mjs',
];
export const exclusions = [
  { id: 'private-routes', pattern: 'docs/src/app/(private)/**', reason: 'Experiments, test and playground routes are not public documentation.' },
  { id: 'careers', pattern: 'docs/src/app/**/careers/**', reason: 'Upstream recruitment is not Solid documentation.' },
  { id: 'analytics', pattern: '**/{analytics,GoogleAnalytics,gtag}*', reason: 'No upstream analytics integration is imported.' },
  { id: 'deployment-credentials', pattern: '**/{.env*,.vercel,deploy*,credentials*}', reason: 'No deployment configuration or credentials are imported.' },
  { id: 'react-type-output', pattern: '**/types.md', reason: 'React generated API output is inventory-only; Solid declarations must generate API tables.' },
  { id: 'next-shell', pattern: 'docs/src/app/**/{layout,page}.{ts,tsx}', reason: 'Next shell/marketing routes require site-owned implementation; not imported as executable code.' },
  { id: 'react-renderer-boundary', pattern: 'docs/src/{components/**,utils/createDemo.ts,utils/createTypes.tsx}', reason: 'Capture referenced renderers/factories as source evidence, stop runtime traversal and inventory their imports; the site supplies Solid handlers.' },
];

export const nativeTags = new Set('a abbr b blockquote br caption code col colgroup dd del details div dl dt em figcaption figure h1 h2 h3 h4 h5 h6 hr i img kbd li link mark ol p pre s samp small span strong sub summary sup table tbody td th thead tr u ul video source'.split(' '));
// Explicit bounded handlers; adding an import alone never authorizes a new node.
export const customHandlers = {
  Subtitle: 'subtitle', Meta: 'metadata', TypeRef: 'solid-type-reference',
  TypePropRef: 'solid-prop-reference', 'QuickNav.Root': 'quick-nav-root',
  'QuickNav.Trigger': 'quick-nav-trigger', 'QuickNav.Popup': 'quick-nav-popup',
  InstallationBlock: 'private-install-instructions', ReleaseTimeline: 'react-release-history',
  ErrorCode: 'react-production-error', ErrorDisplay: 'react-production-error',
};

export function sourceRoute(file) {
  if (!file.startsWith(`${PUBLIC_ROOT}/`)) return '/production-error';
  return `/react${file.slice(PUBLIC_ROOT.length).replace(/\/page\.mdx$/, '')}`;
}
export function targetRoute(route) {
  if (/^\/react\/overview\/releases(?:[/?#]|$)/.test(route)) return `/upstream${route}`;
  return route.replace(/^\/react(?=[/?#]|$)/, '/solid');
}
export function pageDisposition(file) {
  if (file.includes('/overview/releases/')) return 'upstream-react-history';
  if (!file.startsWith(`${PUBLIC_ROOT}/`)) return 'upstream-reference-only';
  return 'semantic-review-required';
}
