// Display/copy only. Ranges are recorded by the server-side TypeScript AST;
// no parser or TypeScript runtime is shipped to the browser.
export const publicSourceAdaptation = {
  kind: 'module-specifier-identity',
  version: 1,
  from: 'baseui-solid2',
  to: '@unstyled-solid/base-ui',
};

export function publicModuleSpecifier(specifier) {
  return specifier === publicSourceAdaptation.from || specifier.startsWith(`${publicSourceAdaptation.from}/`)
    ? publicSourceAdaptation.to + specifier.slice(publicSourceAdaptation.from.length)
    : specifier;
}

export function applyPublicSource(source, edits) {
  let end = source.length;
  let result = '';
  for (const edit of [...edits].reverse()) {
    if (!Number.isInteger(edit.start) || !Number.isInteger(edit.end) || edit.start < 0 || edit.end > end || edit.end <= edit.start || source.slice(edit.start, edit.end) !== edit.original || typeof edit.specifier !== 'string' || publicModuleSpecifier(edit.specifier) !== edit.replacement || edit.specifier === edit.replacement) {
      throw new Error('Stale or invalid public demo source adaptation; regenerate the demo catalog');
    }
    result = edit.replacement + source.slice(edit.end, end) + result;
    end = edit.start;
  }
  return source.slice(0, end) + result;
}
