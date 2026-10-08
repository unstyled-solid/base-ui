import { snippets } from './snippets.mjs';
import { installation, overviewText } from '../overview/guidance.mjs';
import { utilityText } from '../utils/guidance.mjs';
import { adaptSnippet } from './source-snippets.mjs';

export const sourceSha = '19511bb171f3b360b006c94cf6d07e53cb446505';
export const ownedPages = ['overview/quick-start', 'overview/accessibility',
  ...['composition', 'styling', 'customization', 'animation', 'forms', 'typescript'].map((name) => `handbook/${name}`),
  'utils/use-render', 'utils/csp-provider'];
const text = (node) => node.value ?? (node.children ?? []).map(text).join('');
const words = (value) => ({ type: 'text', value });
const inline = (value) => ({ type: 'inlineCode', value });
const paragraph = (...children) => ({ type: 'paragraph', children });
const code = (value, lang, title) => ({ type: 'code', lang, meta: `title="${title}"`, value });
const integration = (value) => /motion\/react|motion\.|AnimatePresence|@tanstack\/react-form|react-hook-form|useActionState|from ['"](?:radix-ui|@emotion\/|styled-components|next\/)/.test(value);

// Leaf-only substitutions preserve the source's inline nodes and section order.
function nativeText(value, topic, section) {
  value = overviewText(utilityText(value, topic), topic);
  if (topic === 'animation') value = value
    .replace('JavaScript animation libraries such as ', 'React animation libraries such as ')
    .replace('CSS animations are always detected, and so are Motion animations that include ', 'CSS animations are detected, as are animations in the upstream React Motion examples that include ');
  if (topic === 'forms') value = value.replaceAll('minLength', 'minlength').replaceAll('maxLength', 'maxlength');
  if (topic === 'customization') value = value
    .replace('In various cases, native events are used instead of React events, so this method has no effect.', 'This method applies to native DOM events passed through Base\u00a0UI handlers; it does not cancel a change event or prevent the browser default.')
    .replace('a React event', 'a native event');
  if (topic === 'composition' && section === 'Render function') value = value.replace(
    'If you are working in an extremely performance-sensitive application, you might want to pass a function to the ', 'Pass a function to the ',
  ).replace(' instead of a React element.', '. Its props and state are live objects; read their properties inside JSX.');
  if (['autocomplete', 'combobox'].includes(topic)) value = value
    .replace('Memoizing each item is a simpler alternative to virtualization for datasets up to roughly 1,000 items. Wrap each item in ', 'Solid components execute once per mount. The upstream React example uses ')
    .replace(' and pass the item as a prop so unchanged items skip re-rendering. While memoization speeds up typing, it does not speed up opening;', '; in Solid, read the item through props inside JSX. This does not reduce the initial mount cost:')
    .replace('This hook is used', 'This utility is used')
    .replace('@tanstack/react-virtual', '@tanstack/solid-virtual');
  if (topic === 'dialog') value = value.replace('React.useEffect', 'a state-watching effect');
  if (topic === 'slider') value = value.replace('after React hydration', 'after hydration');
  if (topic === 'toast') value = value.replace('React tree', 'component tree')
    .replace(' hook.', ' utility.').replace('Unlike the hook,', 'Unlike the utility,')
    .replace(', when remounting is acceptable, by including it in a React ', ', when remounting is acceptable, by using a keyed Solid ');
  return value.replaceAll('className', 'class').replaceAll('React.ComponentProps', 'ComponentProps')
    .replaceAll('React components', 'Solid components').replaceAll('React props', 'Solid props')
    .replaceAll('a React event', 'a native event');
}

/** Source-preserving overlay for the generated schema-v1 AST. Never executes MDX. */
export function adaptPage(page) {
  const key = ownedPages.find((name) => page.source?.endsWith(`/react/${name}/page.mdx`));
  if (!key && page.route !== '/solid' && !page.route?.startsWith('/solid/')) return page;
  if (page.provenance?.sourceSha !== sourceSha) throw new Error(`${page.source}: handbook overlay requires ${sourceSha}`);
  if (page.semanticOverlay?.version === 1) return page;
  const result = structuredClone(page);
  const topic = key?.split('/')[1] ?? page.route.split('/').at(-1);
  let section = result.title;
  let majorSection = result.title;
  const mappings = [];
  const pending = [];

  function adapt(node, path, context = false) {
    const original = structuredClone(node);
    let disposition = 'preserved';
    if (node.type === 'heading') {
      section = text(node);
      if (node.depth <= 2) majorSection = section;
    }
    context ||= topic === 'community' || (topic === 'about' && ['Team', 'Browser support'].includes(majorSection))
      || (topic === 'forms' && ['React Hook Form', 'TanStack Form'].includes(majorSection))
      || (topic === 'animation' && /with Motion$/.test(section));

    if (node.type === 'sourceModule') {
      node.value = '';
      disposition = 'source-evidence-only';
    } else if (node.type === 'code' && /^(jsx?|tsx?|javascript|typescript)$/.test(node.lang ?? '')) {
      const source = original.data?.sourceValue ?? original.value;
      if ((context || integration(source)) && section !== 'Manual unmounting') {
        // React-only integrations must keep their React package imports as well.
        node.value = source;
        node.data = { ...node.data, frameworkContext: 'Upstream React integration' };
        disposition = 'upstream-ecosystem-context';
      } else if (topic === 'use-render' && /React 18 and 17/.test(node.meta ?? '')) {
        node = { type: 'sourceModule', value: '', data: { handler: 'non-executable-import-metadata' } };
        disposition = 'framework-only-react-forward-ref-example';
      } else {
        node.value = topic === 'animation' && section === 'Manual unmounting' ? snippets.manualUnmount
          : topic === 'use-render' && /React 19/.test(node.meta ?? '') ? snippets.renderRefs
          : topic === 'forms' && /Text input using custom asynchronous validation/.test(node.meta ?? '') ? snippets.validation
          : topic === 'forms' && /Displaying errors returned by server-side validation/.test(node.meta ?? '') ? snippets.serverErrors
          : adaptSnippet(source);
        if (topic === 'use-render' && /React 19/.test(node.meta ?? '')) node.meta = 'title="Merging refs"';
        node.lang = node.lang === 'jsx' ? 'tsx' : node.lang;
        node.data = { ...node.data, semanticOverlay: 'solid-native', sourceValue: undefined };
        disposition = 'reviewed-source-adaptation';
      }
    } else if (node.data?.handler === 'private-install-instructions') {
      node = { type: 'root', children: [
        paragraph(words('In this pnpm workspace, install the private '), inline(installation.package), words(' package and its pinned Solid 2 peers:')),
        code(installation.commands, 'sh', 'Workspace installation'),
        paragraph(words('Configure the Solid Vite plugin and TypeScript JSX source:')),
        code(snippets.vite, 'ts', 'vite.config.ts'),
        code(installation.typescript, 'json', 'tsconfig.json'),
      ] };
      disposition = 'private-installation';
    } else if (node.data?.handler === 'demo') {
      disposition = 'registered-demo-reference';
    } else if (node.type === 'paragraph') {
      const value = text(node);
      if (topic === 'use-render' && /In older versions of React/.test(value)) {
        node = { type: 'sourceModule', value: '', data: { handler: 'non-executable-import-metadata' } };
        disposition = 'framework-only-react-version-guidance';
      } else if (topic === 'use-render' && /above assume React 19/.test(value)) {
        node.children = node.children.map((child) => child.type === 'text' ? { ...child, value: child.value
          .replace(' above assume React 19, and should be modified to use ', ' above forward the external ')
          .replace(' to support React 18 and 17.', ' prop directly to the host.') } : child.type === 'inlineCode' ? { ...child, value: 'ref' } : child);
        disposition = 'reviewed-solid-ref-guidance';
      } else if (topic === 'use-render' && /^In React 19,/.test(value)) {
        node.children = [words('Solid receives the external '), inline('ref'), words(' as a normal prop. Pass your internal ref callback to '), inline('ref'), words(' to merge it with '), inline('props.ref'), words('. Allocate ref-dependent effects in component setup; cleanup returned from a ref callback is ignored:')];
        disposition = 'reviewed-solid-ref-guidance';
      } else if (topic === 'forms' && majorSection === 'Forms' && /integrate seamlessly/.test(value)) {
        // Keep both integration links and the native validation API link.
        node.children = node.children.map((child) => child.type === 'text' ? { ...child, value: child.value.replace('They also integrate seamlessly with third-party libraries like ', 'The upstream React integrations with ').replace(/\.$/, ' are retained below as React examples.') } : child);
        disposition = 'reviewed-ecosystem-introduction';
      } else if ((topic === 'forms' && ['React Hook Form', 'TanStack Form'].includes(majorSection) && node.children[0]?.type === 'link')
        || (topic === 'styling' && section === 'CSS-in-JS')) {
        if (topic === 'styling') node.children[0].value = node.children[0].value.replace(/^Wrap /, 'wrap ');
        node.children.unshift(words('In upstream React Base\u00a0UI, '));
        disposition = 'upstream-ecosystem-context';
      } else if (topic === 'forms' && /Server Functions with Form Actions/.test(value)) {
        node.children.unshift(words('Upstream React integration: '));
        context = true;
        disposition = 'upstream-ecosystem-context';
      }
    }

    if (node.children) node.children = node.children.map((child, index) => adapt(child, [...path, index], context));
    if (['text', 'inlineCode'].includes(node.type) && typeof node.value === 'string') {
      node.value = context ? overviewText(node.value, topic) : nativeText(node.value, topic, section);
      // The source React memo link remains a truthful comparison, not a relabeled API.
      if (topic === 'toast' && section === 'Styling' && node.type === 'inlineCode' && node.value === 'key') node.value = 'Show';
      if (node.value !== original.value) disposition = 'reviewed-framework-prose';
    }
    if (node.attributes) for (const attribute of node.attributes) {
      if (attribute.name === 'className') attribute.name = 'class';
      if (typeof attribute.value === 'string' && node.data?.handler === 'metadata') {
        attribute.value = nativeText(attribute.value, topic, section).replace(/\bReact (?=\w+ component)/g, 'Solid ');
      }
    }
    mappings.push({ source: page.source, section, sourcePosition: original.position ?? null,
      targetPath: path, disposition, ...(disposition !== 'preserved' ? { sourceNode: original } : {}) });
    node.position ??= original.position;
    return node;
  }

  result.ast = adapt(result.ast, []);
  result.sourceMetadata = structuredClone(result.metadata);
  result.metadata = { ...result.metadata };
  result.sourceImports = result.imports;
  result.imports = result.imports.filter((entry) => ['api', 'demo'].includes(entry.kind));
  result.sourceNodes = result.nodes;
  result.nodes = [];
  function inventory(node) {
    if (node.data?.handler) {
      const location = `${page.source}:${node.position?.start?.line ?? 1}:${node.position?.start?.column ?? 1}`;
      const record = result.sourceNodes.find((entry) => entry.location === location);
      result.nodes.push({ ...record, name: node.name ?? node.type, handler: node.data.handler, location, ...(node.data.reference ? { reference: node.data.reference } : {}) });
      if (node.data.handler === 'subtitle') result.subtitle = text(node);
      if (node.data.handler === 'metadata') {
        const attrs = Object.fromEntries(node.attributes.map((a) => [a.name, a.value]));
        result.metadata[attrs.name ?? attrs.property] = attrs.content;
      }
    }
    for (const child of node.children ?? []) inventory(child);
  }
  inventory(result.ast);
  result.sourceHeadings = structuredClone(result.headings);
  for (const heading of result.headings) heading.text = nativeText(heading.text, topic, heading.text);
  if (page.route === '/solid') {
    result.title = 'Solid';
    result.ast.children.find((n) => n.type === 'heading' && n.depth === 1).children = [words('Solid')];
    result.headings[0].text = 'Solid';
  }
  result.semanticOverlay = { owner: 'docs-handbooks', version: 1, sourceSha, mappings, pending,
    reviewedAdaptations: page.adaptations.filter((entry) => !entry.kind.startsWith('handler:') && mappings.some((mapping) =>
      mapping.disposition.startsWith('reviewed-') && entry.location === `${page.source}:${mapping.sourcePosition?.start?.line}:${mapping.sourcePosition?.start?.column}`))
      .map((entry) => `${entry.kind}@${entry.location}:${entry.detail}`) };
  result.publishable = false;
  return result;
}
