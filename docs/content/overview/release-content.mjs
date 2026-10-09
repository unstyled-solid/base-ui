import contract from '../../../distribution/package-contract.json' with { type: 'json' };
import { installation, overviewText } from './guidance.mjs';

// Verified from this project's origin remote, not the upstream repository.
export const projectRepository = 'https://github.com/unstyled-solid/base-ui';
export const projectReleases = `${projectRepository}/releases`;
export const releaseMetadata = {
  title: 'Base UI for Solid',
  description: `An independent, unofficial Solid 2 port of Base UI. Alpha release ${contract.identity.version}.`,
  package: contract.identity.publicationName,
  version: contract.identity.version,
  repository: projectRepository,
  releases: projectReleases,
};
export const alphaLimitations = 'This is an alpha release. APIs and behavior may change. This independent, unofficial port is not maintained by the upstream Base UI team and does not claim equivalent browser, device, or screen-reader coverage. Test it in your application before relying on it.';

const words = (value) => ({ type: 'text', value });
const paragraph = (...children) => ({ type: 'paragraph', children });
const link = (value, url) => ({ type: 'link', url, children: [words(value)] });
const text = (node) => node.value ?? (node.children ?? []).map(text).join('');
const introduction = () => paragraph(words(`${releaseMetadata.title} is an independent, unofficial Solid 2 port of Base UI. Alpha release ${releaseMetadata.version}. `), link('Project repository', projectRepository), words('.'));
const support = () => paragraph(words('For support, questions, bug reports, and contributions to Base UI for Solid, visit the '), link('project GitHub repository', projectRepository), words('.'));
const updates = () => paragraph(words('Follow '), link('project GitHub releases', projectReleases), words(' for Base UI for Solid release notes and updates.'));

/** Pure post-adaptPage overlay: captured source and unrelated pages stay untouched. */
export function applyOverviewReleaseContent(page) {
  if (!page.route?.startsWith('/solid/overview/')) return page;
  if (page.releaseContent?.version === 1) return page;
  const result = structuredClone(page);
  const topic = page.route.split('/').at(-1);
  const headingChanges = new Map();
  let section = '';
  let majorSection = '';
  let wroteSection = false;
  function visit(node) {
    if (node.type === 'heading') {
      section = text(node);
      if (node.depth <= 2) {
        majorSection = section;
        wroteSection = false;
      }
      // These two primary sections need one project channel each, not renamed
      // copies of the source's social-channel subsections.
      if (topic === 'community' && node.depth > 2
        && ['Get help and contribute', 'Stay up to date'].includes(majorSection)) return null;
      const renamed = topic === 'about' && section === 'Team' ? 'Upstream contributors'
        : topic === 'about' && section === 'Browser support' ? 'Upstream browser targets' : null;
      if (renamed) {
        headingChanges.set(section, renamed);
        node.children = [words(renamed)];
      }
    }
    if (node.type === 'paragraph' && topic === 'community') {
      if (majorSection === 'Get help and contribute') {
        if (wroteSection) return null;
        wroteSection = true;
        return support();
      }
      if (majorSection === 'Stay up to date') {
        if (wroteSection) return null;
        wroteSection = true;
        return updates();
      }
      if (section === 'shadcn/ui') return paragraph(link('shadcn/ui', 'https://ui.shadcn.com/'), words(' offers pre-styled React components built on upstream Base UI. It is an upstream React ecosystem project, not a Solid component library or an integration with this port.'));
    }
    if (node.type === 'paragraph' && topic === 'quick-start' && /^In this pnpm workspace, install the private /.test(text(node))) {
      return paragraph(words('Install '), { type: 'inlineCode', value: installation.package }, words(` alpha ${releaseMetadata.version} and its pinned Solid 2 peers:`));
    }
    if (node.type === 'code' && node.value === installation.commands) node.meta = 'title="Installation"';
    if (node.type === 'link' && topic === 'about' && majorSection === 'Team') {
      // Preserve contributor credits without presenting them as port contacts.
      return words(text(node));
    }
    if (['text', 'inlineCode'].includes(node.type)) {
      node.value = (topic === 'quick-start' ? overviewText(node.value, topic) : node.value)
        .replace('All components are included in a single workspace package. Tree-shaking is checked against packed consumers during distribution qualification.', 'All components are included in a single package. Import individual component subpaths to use the components you need.')
        .replace('Equivalent browser, device, and screen-reader qualification for this Solid port is pending.', 'This alpha port does not claim equivalent browser, device, or screen-reader coverage.')
        .replace('Equivalent coverage for this Solid port is pending final qualification.', 'This alpha port does not claim equivalent coverage; test your application in its intended environments.');
    }
    if (node.children) node.children = node.children.map(visit).filter(Boolean);
    return node;
  }
  result.ast = visit(result.ast);
  if (['about', 'quick-start', 'community', 'accessibility'].includes(topic)) {
    const index = result.ast.children.findIndex((node) => node.type === 'heading' && node.depth === 2);
    result.ast.children.splice(index < 0 ? result.ast.children.length : index, 0, introduction(), paragraph(words(alphaLimitations)));
  }
  if (topic === 'about') {
    result.title = 'About Base UI for Solid';
    const title = result.ast.children.find((node) => node.type === 'heading' && node.depth === 1);
    if (title) {
      headingChanges.set(text(title), result.title);
      title.children = [words(result.title)];
    }
  }
  const retainedHeadings = new Set();
  const activeLinks = [];
  function inventory(node) {
    if (node.type === 'heading') retainedHeadings.add(text(node));
    if (['link', 'definition', 'image'].includes(node.type)) {
      const location = `${result.source}:${node.position?.start?.line ?? 1}:${node.position?.start?.column ?? 1}`;
      const original = page.links?.find((entry) => entry.target === node.url && entry.location === location);
      activeLinks.push(original ? structuredClone(original) : { source: node.url, target: node.url, location });
    }
    for (const child of node.children ?? []) inventory(child);
  }
  inventory(result.ast);
  result.headings = (result.headings ?? [])
    .map((heading) => ({ ...heading, text: headingChanges.get(heading.text) ?? heading.text }))
    .filter((heading) => retainedHeadings.has(heading.text));
  result.links = activeLinks;
  result.metadata = { ...result.metadata, description: releaseMetadata.description };
  result.releaseContent = { version: 1, owner: 'bsolid-3537' };
  return result;
}

/** New port release routes; upstream historical release pages remain separate. */
export function createReleasePages(template) {
  const heading = (value, depth, id) => ({ type: 'heading', depth, children: [words(value)], data: { id, hProperties: { id } } });
  const make = (route, title, children) => {
    const ast = { type: 'root', children: [heading(title, 1, 'release'), ...children] };
    const source = 'docs/content/overview/release-content.mjs';
    const headings = [];
    ast.children.forEach((node, index) => {
      if (node.type !== 'heading') return;
      node.position = { start: { line: index + 1, column: 1 }, end: { line: index + 1, column: text(node).length + 1 } };
      headings.push({ depth: node.depth, text: text(node), properties: { id: node.data.id },
        location: `${source}:${index + 1}:1`, position: structuredClone(node.position) });
    });
    return { ...structuredClone(template), schemaVersion: 1, source,
      provenance: { ...structuredClone(template.provenance ?? {}), sourceSha: contract.sourceSha },
      route, title, subtitle: releaseMetadata.description,
      metadata: { description: releaseMetadata.description }, ast,
      headings,
      imports: [], sourceImports: [], nodes: [], sourceNodes: [], sourceHeadings: [], sourceMetadata: {}, adaptations: [],
      releaseContent: { version: 1, owner: 'bsolid-3537' } };
  };
  return [
    make('/solid/overview/releases', 'Base UI for Solid releases', [introduction(), paragraph(words(alphaLimitations)), paragraph(link('Alpha 0.0.1', '/solid/overview/releases/v0-0-1')), updates()]),
    make('/solid/overview/releases/v0-0-1', '0.0.1 — Alpha', [introduction(),
      heading('Installation', 2, 'installation'),
      paragraph(words(`Public package: ${releaseMetadata.package}@${releaseMetadata.version}. Requires solid-js and @solidjs/web ${contract.toolchain['solid-js']}. Use the matching RC13 compiler packages.`)),
      { type: 'code', lang: 'sh', value: installation.commands },
      heading('Alpha limitations', 2, 'alpha-limitations'), paragraph(words(alphaLimitations)), support(), updates()]),
  ];
}
