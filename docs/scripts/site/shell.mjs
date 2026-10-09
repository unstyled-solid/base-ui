import { escape } from './render.mjs';
import { localUrl, sha } from './paths.mjs';
import { logoIcon, searchIcon } from './icons.mjs';
import { repository } from './release.mjs';

export function shell(page, html, { base, nav, identity, origin, indexable = Boolean(origin) }) {
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
  const description = page.metadata.description ?? page.subtitle ?? 'Unstyled, accessible UI components for Solid 2. An independent alpha port of Base UI.';
  const canonical = (origin ?? '') + localUrl(page.route, base);
  const archive = page.route.startsWith('/upstream/');
  const noindex = !indexable || archive || page.metadata.robots?.index === false || page.route === '/404';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(page.title)} · Base UI for Solid</title><meta name="description" content="${escape(description)}"><link rel="canonical" href="${escape(canonical)}"><link rel="icon" href="${url('/static/favicon.svg')}" type="image/svg+xml"><link rel="alternate icon" href="${url('/static/favicon.ico')}"><link rel="apple-touch-icon" href="${url('/static/apple-touch-icon.png')}"><meta property="og:title" content="${escape(page.title)} · Base UI for Solid"><meta property="og:description" content="${escape(description)}"><meta property="og:site_name" content="Base UI for Solid"><meta property="og:type" content="website"><meta property="og:url" content="${escape(canonical)}"><meta property="og:image" content="${escape((origin ?? '') + localUrl('/static/apple-touch-icon.png', base))}"><meta property="og:image:alt" content="Base UI logo"><meta name="twitter:card" content="summary">${noindex ? '<meta name="robots" content="noindex, follow">' : ''}<link rel="stylesheet" href="${url('/source.css')}"><link rel="stylesheet" href="${url('/site.css')}"></head><body>
<div class="RootLayout"><div class="RootLayoutContainer"><div class="RootLayoutContent"><div class="ContentLayoutRoot">
<header class="Header SiteHeader"><div class="HeaderInner"><a class="SkipNav SiteSkip" href="#main-content">Skip to contents</a><a class="HeaderLogoLink SiteBrand" href="${url('/')}" aria-label="Base UI for Solid home">${logoIcon}</a><div class="HeaderSearch SiteHeaderActions"><div id="shell-island"></div><details class="SiteMobileNav"><summary class="SearchTrigger" aria-label="Browse documentation">${searchIcon}<span>Navigation</span></summary><nav aria-label="Mobile documentation">${navHtml}</nav></details></div></div></header>
<nav class="SideNavRoot" aria-label="Documentation"><div class="SideNavViewport" tabindex="0">${navHtml}</div></nav>
<main class="ContentLayoutMain QuickNavContainer" id="main-content" tabindex="-1"><div class="QuickNavContent SitePageContent">${page.notice ? '<aside class="SiteFrameworkNote">Upstream React release history. These are not releases of the Solid port.</aside>' : ''}${html}<footer class="SiteFooter"><p>${escape(identity.name)} ${escape(identity.version)} alpha · Solid 2.0.0-rc.13</p><p><a href="${repository}">GitHub · Support and contributions</a> · <a href="${url('/solid/overview/releases')}">Release notes</a> · <a href="${url('/LICENSE.txt')}">MIT license</a> · <a href="${url('/llms.txt')}">Plain-text documentation</a></p><p>Independent Solid port of <a href="https://github.com/mui/base-ui/tree/${sha}">upstream Base UI</a>; not maintained by the upstream team.</p></footer></div></main>
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
