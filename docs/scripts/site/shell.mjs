import { escape } from './render.mjs';
import { localUrl, sha } from './paths.mjs';
import { logoIcon, searchIcon } from './icons.mjs';

export function shell(page, html, { base, nav, identity, origin }) {
  const url = value => escape(localUrl(value, base));
  const navHtml = nav.map(section => `<section class="SideNavSection"><h2 class="SideNavHeading">${escape(section.title)}</h2><ul>${section.pages.map(item => `<li class="SideNavItem"><a class="SideNavLink" ${item.route === page.route ? 'aria-current="page" data-active' : ''} href="${url(item.route)}">${escape(item.title)}</a></li>`).join('')}</ul></section>`).join('');
  const outline = page.headings.filter(h => h.depth > 1 && !h.properties['data-quick-nav-exclude']);
  const outlineItems = [];
  for (const heading of outline) {
    const item = { heading, children: [] };
    const parent = outlineItems.at(-1);
    if (heading.depth > 2 && parent) parent.children.push(item);
    else outlineItems.push(item);
  }
  const outlineHtml = items => `<ul class="QuickNavList">${items.map(({ heading: h, children }) => `<li><a class="QuickNavLink" href="#${escape(h.properties.id)}">${escape(h.text.replace(/React(?=\s| )/g, 'Solid'))}</a>${children.length ? outlineHtml(children) : ''}</li>`).join('')}</ul>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(page.title)} · Base UI Solid</title><meta name="description" content="${escape(page.metadata.description ?? page.subtitle ?? 'Unstyled UI components for Solid 2')}"><link rel="canonical" href="${escape(origin + localUrl(page.route, base))}"><meta property="og:title" content="${escape(page.title)}"><meta property="og:description" content="${escape(page.subtitle ?? '')}"><meta name="robots" content="noindex, nofollow"><link rel="stylesheet" href="${url('/source.css')}"><link rel="stylesheet" href="${url('/site.css')}"></head><body>
<div class="RootLayout"><div class="RootLayoutContainer"><div class="RootLayoutContent"><div class="ContentLayoutRoot">
<header class="Header SiteHeader"><div class="HeaderInner"><a class="SkipNav SiteSkip" href="#main-content">Skip to contents</a><a class="HeaderLogoLink SiteBrand" href="${url('/solid/overview/quick-start')}" aria-label="Base UI Solid home">${logoIcon}</a><div class="HeaderSearch SiteHeaderActions"><div id="shell-island"></div><details class="SiteMobileNav"><summary class="SearchTrigger" aria-label="Browse documentation">${searchIcon}<span>Navigation</span></summary><nav aria-label="Mobile documentation">${navHtml}</nav></details></div></div></header>
<nav class="SideNavRoot" aria-label="Documentation"><div class="SideNavViewport" tabindex="0">${navHtml}</div></nav>
<main class="ContentLayoutMain QuickNavContainer" id="main-content" tabindex="-1"><div class="QuickNavContent SitePageContent">${page.notice ? '<aside class="SiteFrameworkNote">Upstream React release history. These are not releases of the Solid port.</aside>' : ''}${html}<footer class="SiteFooter"><p>${escape(identity.name)} ${escape(identity.version)} · Solid 2.0.0-rc.13 · <a href="https://github.com/mui/base-ui/tree/${sha}">upstream ${sha.slice(0,7)}</a></p><p><a href="${url('/LICENSE.txt')}">MIT license</a> · <a href="${url('/llms.txt')}">Plain-text documentation</a></p></footer></div></main>
<aside class="QuickNavRoot SiteOutline" aria-label="On this page"><div class="QuickNavInner"><div class="QuickNavViewport" tabindex="0"><ul class="QuickNavList"><li><a class="QuickNavLink" href="#main-content">(Top)</a></li></ul>${outlineHtml(outlineItems)}</div></div></aside>
</div></div></div></div><script type="module">
const skip = document.querySelector('.SiteSkip');
const main = document.getElementById('main-content');
skip.addEventListener('click', event => {
  if (event.detail === 0) main.setAttribute('data-skip-focus', '');
  else main.removeAttribute('data-skip-focus');
});
main.addEventListener('blur', () => main.removeAttribute('data-skip-focus'));
document.addEventListener('pointerdown', () => main.removeAttribute('data-skip-focus'), { passive: true });
</script><script type="module" src="${url('/islands.js')}"></script></body></html>`;
}
