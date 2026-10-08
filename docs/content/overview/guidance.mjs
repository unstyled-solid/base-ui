import contract from '../../../distribution/package-contract.json' with { type: 'json' };
const identity = contract.identity;
const workspace = identity.installation.workspace.replaceAll('{workspaceName}', identity.workspaceName);
export const installation = {
  package: identity.workspaceName,
  commands: `${workspace}\n${identity.installation.runtimePeers}\nrtk pnpm add -D vite@${contract.toolchain.vite} @solidjs/vite-plugin@${contract.toolchain['@solidjs/vite-plugin']} @solidjs/compiler@${contract.toolchain['@solidjs/compiler']} @solidjs/babel-plugin@${contract.toolchain['@solidjs/babel-plugin']}`,
  typescript: JSON.stringify({ compilerOptions: { jsx: 'preserve', jsxImportSource: contract.format.jsxImportSource } }, null, 2),
};

// Exact source-leaf edits: links, inline code, emphasis and paragraph boundaries
// stay in the source AST. These are not page-wide replacement essays.
export function overviewText(value, topic) {
  if (topic === 'accessibility') return value.replace(
    'Base\u00a0UI components are tested on a broad spectrum of browsers, devices, platforms, screen readers, and environments.',
    'Upstream React Base\u00a0UI is tested across browsers, devices, platforms, and screen readers. Equivalent coverage for this Solid port is pending final qualification.',
  );
  if (topic === 'quick-start') return value
    .replace('All components are included in a single package. Base\u00a0UI is tree-shakable, so your app bundle will contain only the components that you actually use.', 'All components are included in a single workspace package. Tree-shaking is checked against packed consumers during distribution qualification.')
    .replace(' is a great place to start if you need pre-styled components with higher-level abstractions. It uses Base\u00a0UI as its unstyled foundation.', ' provides pre-styled React components with higher-level abstractions built on upstream Base\u00a0UI.')
    .replace(' page to see more styled libraries powered by Base\u00a0UI.', ' page to see more styled libraries in the upstream ecosystem.');
  if (topic === 'community') return value
    .replace(' uses Base\u00a0UI as its unstyled foundation.', ' uses upstream React Base\u00a0UI as its unstyled foundation.')
    .replace("Here's a non-exhaustive list of open-source styled libraries built with Base\u00a0UI:", "Here's a non-exhaustive list of styled libraries built with upstream React Base\u00a0UI:")
    .replace('Base\u00a0UI is an open-source project.', 'Upstream Base\u00a0UI is an open-source project.')
    .replace('visit our ', 'visit the upstream ').replace('join our ', 'join the upstream ')
    .replace('The best way to stay up to date on new releases and announcements is to follow ', 'For upstream React releases and announcements, follow ')
    .replace("We're also on ", 'Upstream Base\u00a0UI is also on ')
    .replace('Detailed release notes are published on our ', 'Detailed upstream React release notes are published on the ');
  if (topic === 'about') return value
    .replace('An open-source React component library', 'A Solid 2 port of the open-source Base\u00a0UI component library')
    .replace('From the creators of Radix, Material\u00a0UI, and Floating\u00a0UI, Base\u00a0UI is an unstyled React component library', 'Upstream Base\u00a0UI, from the creators of Radix, Material\u00a0UI, and Floating\u00a0UI, is an unstyled React component library')
    .replace('Our focus is', 'The upstream project focuses').replace('Our goal is', 'Its goal is')
    .replace('Accessibility is our primary focus.', 'Accessibility is a primary focus of upstream Base\u00a0UI and this port.')
    .replace(' and are tested on a wide range of platforms, devices, browsers, screen readers, and other environments.', '. Equivalent browser, device, and screen-reader qualification for this Solid port is pending.')
    .replace('Base\u00a0UI supports all modern browsers', 'Upstream React Base\u00a0UI supports all modern browsers')
    .replace('For the full list of supported browsers, refer to our ', 'For the upstream browser targets, refer to its ')
    .replace('React versions', 'Solid version')
    .replace('Base\u00a0UI supports React 17 and newer versions.', 'This port targets Solid 2.0.0-rc.13 and @solidjs/web 2.0.0-rc.13.')
    .replace('Base\u00a0UI works with maintained versions of all popular bundlers, including Vite, webpack, Turbopack and Parcel.', 'The docs and port harness use Vite with @solidjs/vite-plugin.');
  if (topic === 'overview') return value
    .replace('An open-source React component library for building accessible user interfaces.', 'A Solid 2 port of the open-source Base\u00a0UI component library for building accessible user interfaces.')
    .replace('React versions', 'Solid version');
  return value;
}
