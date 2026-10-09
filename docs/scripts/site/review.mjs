// Content review is separate from runtime/browser qualification. Each approval
// records the actual release overlay, source mapping, or resolved renderer seam.
// Unknown adaptation kinds stay pending; an empty integration report is not by
// itself permission to approve arbitrary source semantics.
const key = entry => `${entry.kind}@${entry.location}:${entry.detail}`;
const flatten = node => [node, ...(node.children ?? []).flatMap(flatten)];
const position = (page, node) => `${page.source}:${node.position?.start?.line ?? 1}:${node.position?.start?.column ?? 1}`;
const replacementKinds = new Set(['framework-language', 'framework-metadata', 'generated-react-index', 'handler:react-production-error']);
const mappedKinds = new Set(['framework-language', 'public-component-reference', 'source-snippet', 'incomplete-code-example', 'react-render', 'react-hook', 'react-className', 'react-ref', 'publication-identity', 'class-spelling']);

export function reviewReleasePage(page, { rendered, handlers, api }) {
  const result = { ...page };
  const decisions = [];
  const approved = new Set(page.semanticOverlay?.reviewedAdaptations ?? []);
  const mappings = page.semanticOverlay?.mappings ?? [];
  const covered = new Map();
  for (const mapping of mappings) {
    if (!mapping.sourceNode || (!mapping.disposition.startsWith('reviewed-') && !mapping.disposition.startsWith('framework-only-'))) continue;
    for (const node of flatten(mapping.sourceNode)) covered.set(position(page, node), mapping.disposition);
  }
  const activeNodes = page.nodes ?? [];
  const astNodes = flatten(page.ast);
  const symbols = new Set((api?.modules ?? []).flatMap(module => module.exports.map(entry => entry.name)));
  const familySymbols = api?.modules?.find(module => module.entrypoint === `./${page.route.split('/').at(-1)}`)?.exports.map(entry => entry.name) ?? [];
  const description = page.metadata.description ?? page.subtitle ?? '';
  const metadataReviewed = !/\bReact\b|baseui-solid2|@base-ui\/react/.test(description);
  for (const adaptation of page.adaptations ?? []) {
    const id = key(adaptation);
    let basis = approved.has(id) ? 'source-linked native adaptation' : null;
    const mappedKind = mappedKinds.has(adaptation.kind) || (adaptation.kind.startsWith('handler:') && handlers.includes(adaptation.kind.slice('handler:'.length)));
    if (!basis && mappedKind && covered.has(adaptation.location)) basis = covered.get(adaptation.location);
    if (!basis && adaptation.kind.startsWith('handler:')) {
      const handler = adaptation.kind.slice('handler:'.length);
      const active = activeNodes.some(node => node.location === adaptation.location && node.handler === handler);
      if (active && handlers.includes(handler) && rendered.issues.length === 0) basis = 'registered handler with resolved public render output';
    }
    if (!basis && adaptation.kind === 'framework-metadata' && metadataReviewed) basis = 'emitted metadata uses reviewed Solid description; original metadata retained as evidence';
    if (!basis && adaptation.kind === 'framework-language') {
      const node = astNodes.find(node => position(page, node) === adaptation.location && typeof node.value === 'string');
      const name = node?.value.replace(/\(\)$/, '');
      if (name && (symbols.has(name) || familySymbols.some(symbol => symbol.endsWith('.' + name)))) basis = 'documented compatibility name exists in generated Solid API declarations';
      if (!basis && node && page.route === '/solid/overview/community' && page.releaseContent?.version === 1 && /React components/.test(node.value) && astNodes.some(node => node.type === 'text' && /upstream React Base/.test(node.value))) basis = 'explicitly scoped upstream React ecosystem listing';
    }
    if (!basis && page.releaseOverlay && replacementKinds.has(adaptation.kind)) basis = page.releaseOverlay.kind;
    if (!basis && page.releaseContent?.version === 1 && ['platform-accessibility-claims', 'community-support'].includes(adaptation.kind)) basis = 'explicit alpha coverage limits and project GitHub support overlay';
    if (basis) { approved.add(id); decisions.push({ adaptation: id, basis }); }
  }
  const pending = (page.adaptations ?? []).filter(entry => !approved.has(key(entry)));
  result.semanticOverlay = { ...page.semanticOverlay, reviewedAdaptations: [...approved] };
  result.releaseReview = { decisions, pending: pending.map(key) };
  result.publishable = rendered.issues.length === 0 && pending.length === 0 && !(page.semanticOverlay?.pending?.length);
  return result;
}
