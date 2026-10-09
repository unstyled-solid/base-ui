import test from 'node:test';
import assert from 'node:assert/strict';
import { installation, overviewText } from '../content/overview/guidance.mjs';
import { applyOverviewReleaseContent, createReleasePages, projectRepository, projectReleases, releaseMetadata } from '../content/overview/release-content.mjs';

const text = (value) => ({ type: 'text', value });
const paragraph = (value) => ({ type: 'paragraph', children: [text(value)] });
const heading = (value, depth = 2) => ({ type: 'heading', depth, data: { id: value.toLowerCase() }, children: [text(value)] });
const page = (topic, children) => ({ route: `/solid/overview/${topic}`, title: topic, ast: { type: 'root', children }, headings: children.filter((node) => node.type === 'heading').map((node) => ({ text: node.children[0].value, id: node.data.id })), metadata: {}, imports: [], nodes: [], adaptations: [] });
const flatten = (node) => node.value ?? (node.children ?? []).map(flatten).join('');
const links = (node) => [...(node.type === 'link' ? [node.url] : []), ...(node.children ?? []).flatMap(links)];

test('public plain pnpm installation retains runtime and compiler pins', () => {
  assert.equal(installation.package, '@unstyled-solid/base-ui');
  assert.match(installation.commands, /^pnpm add @unstyled-solid\/base-ui@0\.0\.1\n/);
  assert.doesNotMatch(installation.commands, /rtk|workspace|baseui-solid2/);
  for (const name of ['solid-js', '@solidjs/web', '@solidjs/compiler', '@solidjs/babel-plugin']) assert.ok(installation.commands.includes(`${name}@2.0.0-rc.13`));
});

test('emitted shadcn phrase stays React ecosystem context', () => {
  const emitted = ' provides pre-styled Solid components with higher-level abstractions built on upstream Base\u00a0UI.';
  assert.match(overviewText(emitted, 'quick-start'), /pre-styled React components/);
  const result = applyOverviewReleaseContent(page('quick-start', [heading('Pre-styled components'), paragraph(emitted)]));
  assert.doesNotMatch(flatten(result.ast), /pre-styled Solid/);
  assert.match(flatten(result.ast), /not Solid components/);
});

test('community preserves ecosystem but routes support and updates to the port', () => {
  const input = page('community', [heading('shadcn/ui'), paragraph('React recommendation'), heading('Styled libraries'), paragraph('Upstream ecosystem'), heading('Get help and contribute'), heading('GitHub', 3), paragraph('visit upstream'), heading('Discord', 3), paragraph('join Discord'), heading('Stay up to date'), heading('X', 3), paragraph('follow X'), heading('Bluesky', 3), paragraph('Bluesky'), heading('GitHub releases', 3), paragraph('upstream releases')]);
  const before = structuredClone(input);
  input.links = [{ source: 'https://base-ui.com/r/discord', target: 'https://base-ui.com/r/discord', location: 'source:1:1' }];
  before.links = structuredClone(input.links);
  input.sourceHeadings = structuredClone(input.headings);
  before.sourceHeadings = structuredClone(input.sourceHeadings);
  const result = applyOverviewReleaseContent(input);
  assert.deepEqual(input, before);
  assert.ok(links(result.ast).includes(projectRepository));
  assert.ok(links(result.ast).includes(projectReleases));
  assert.ok(links(result.ast).every((url) => url.startsWith(projectRepository) || url === 'https://ui.shadcn.com/'));
  assert.match(flatten(result.ast), /upstream React ecosystem project, not a Solid/);
  assert.match(flatten(result.ast), /Upstream ecosystem/);
  assert.equal(flatten(result.ast).split('For support, questions, bug reports, and contributions').length - 1, 1);
  assert.equal(flatten(result.ast).split('for Base UI for Solid release notes and updates.').length - 1, 1);
  assert.ok(result.headings.every((h) => !['Discord', 'X', 'Bluesky', 'GitHub', 'GitHub releases'].includes(h.text)));
  assert.doesNotMatch(JSON.stringify(result.ast), /Discord|Bluesky|x\.com|bsky\.app|base-ui\.com\/r\/discord/);
  assert.deepEqual(result.sourceHeadings, before.sourceHeadings);
  assert.deepEqual(result.links.map((entry) => entry.target), links(result.ast));
  assert.ok(result.headings.some((h) => h.text === 'Get help and contribute' && h.id === 'get help and contribute'));
  assert.deepEqual(applyOverviewReleaseContent(result), result);
});

test('about distinguishes upstream contributors and preserves heading IDs', () => {
  const input = page('about', [heading('About Base UI', 1), heading('Team'), { type: 'list', children: [{ type: 'listItem', children: [paragraph('Colm Tuite'), { type: 'link', url: 'https://x.com/colmtuite', children: [text('@colmtuite')] }] }] }]);
  const result = applyOverviewReleaseContent(input);
  assert.ok(result.headings.some((h) => h.text === 'Upstream contributors' && h.id === 'team'));
  assert.match(flatten(result.ast), /Colm Tuite/);
  assert.match(flatten(result.ast), /not maintained by the upstream Base UI team/);
  assert.doesNotMatch(JSON.stringify(result.ast), /x\.com/);
});

test('post-adaptPage private installation prose is replaced', () => {
  const result = applyOverviewReleaseContent(page('quick-start', [paragraph('In this pnpm workspace, install the private @unstyled-solid/base-ui package and its pinned Solid 2 peers:'), { type: 'code', value: installation.commands, meta: 'title="Workspace installation"' }]));
  assert.doesNotMatch(JSON.stringify(result.ast), /workspace|private|rtk|qualification/i);
  assert.match(flatten(result.ast), /alpha 0.0.1/);
});

test('about labels browser guidance as upstream targets without changing its ID or caveat', () => {
  const input = page('about', [heading('Browser support'), paragraph('Upstream React Base UI supports modern browsers.')]);
  const before = structuredClone(input);
  const result = applyOverviewReleaseContent(input);
  assert.deepEqual(input, before);
  assert.ok(result.headings.some((h) => h.text === 'Upstream browser targets' && h.id === 'browser support'));
  assert.match(flatten(result.ast), /does not claim equivalent browser, device, or screen-reader coverage/);
});

test('release routes contain verified identity, RC13 requirement and alpha limits', () => {
  const pages = createReleasePages(page('about', []));
  assert.deepEqual(pages.map((p) => p.route), ['/solid/overview/releases', '/solid/overview/releases/v0-0-1']);
  const notes = flatten(pages[1].ast);
  assert.match(notes, /@unstyled-solid\/base-ui@0.0.1/);
  assert.match(notes, /2.0.0-rc.13/);
  assert.match(notes, /APIs and behavior may change/);
  assert.match(notes, /does not claim equivalent browser, device, or screen-reader coverage/);
  assert.doesNotMatch(notes, /qualification|workspace|rtk|2026/);
  assert.equal(releaseMetadata.title, 'Base UI for Solid');
  for (const entry of pages) {
    assert.equal(entry.schemaVersion, 1);
    assert.equal(entry.provenance.sourceSha, '19511bb171f3b360b006c94cf6d07e53cb446505');
    for (const h of entry.headings) {
      const node = entry.ast.children.find((n) => n.type === 'heading' && n.position.start.line === h.position.start.line);
      assert.equal(h.location, `${entry.source}:${node.position.start.line}:1`);
      assert.equal(h.properties.id, node.data.id);
    }
  }
});
