import { Errored, render } from '@solidjs/web';
import type { DemoEntry } from './types';
import { loadAsset, loadDemo, loadSource } from './registry';
import { highlightSource } from './highlight';

export interface DemoRuntimeOptions {
  loadDemo?: (id: string) => Promise<DemoEntry>;
  loadSource?: (path: string) => Promise<string>;
  loadAsset?: (path: string) => Promise<string>;
}
const mounts = new WeakMap<HTMLElement, () => void>();
const activeMounts = new Set<() => void>();
const message = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

// The site owns page navigation; module replacement must also release Solid roots.
if (import.meta.hot)
  import.meta.hot.dispose(() => {
    const errors: unknown[] = [];
    for (const dispose of activeMounts) {
      try {
        dispose();
      } catch (error) {
        errors.push(error);
      }
    }
    if (errors.length)
      throw new AggregateError(errors, 'Demo HMR disposal failed');
  });

/** Paths/geometry from the pinned upstream docs icons. */
function icon(
  doc: Document,
  kind: 'copy' | 'check' | 'more' | 'github' | 'external',
): SVGSVGElement {
  const svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const filled = kind === 'more' || kind === 'github';
  for (const [name, value] of Object.entries({
    width: '16',
    height: '16',
    viewBox: '0 0 16 16',
    fill: filled ? 'currentColor' : 'none',
    'aria-hidden': 'true',
    focusable: 'false',
  }))
    svg.setAttribute(name, value);
  if (!filled) svg.setAttribute('stroke', 'currentColor');
  const paths = {
    copy: [
      'M1.5 1.5h10v10h-10z',
      'M4.5 11.5h-3v-10h10v3',
      'M12 4.5h2.5v10h-10V12',
    ],
    check: ['m2.5 8.5 4 4 7-9'],
    more: [
      'M9.5 13c0 .8284-.67157 1.5-1.5 1.5s-1.5-.6716-1.5-1.5.67157-1.5 1.5-1.5 1.5.6716 1.5 1.5m0-5c0 .82843-.67157 1.5-1.5 1.5S6.5 8.82843 6.5 8 7.17157 6.5 8 6.5s1.5.67157 1.5 1.5m0-5c0 .82843-.67157 1.5-1.5 1.5S6.5 3.82843 6.5 3 7.17157 1.5 8 1.5s1.5.67157 1.5 1.5',
    ],
    github: [
      'M8 0C3.57983 0 0 3.67031 0 8.20221c0 3.62969 2.29009 6.69509 5.46991 7.78139.4.072.54957-.174.54957-.3894 0-.1947-.00974-.8402-.00974-1.5278-2.00974.3795-2.52939-.5021-2.68939-.9628-.09044-.2361-.48-.9643-.82087-1.1591-.27965-.1541-.67965-.5334-.00974-.5434.63026-.01 1.08035.5948 1.23061.8409.72 1.241 1.86991.8915 2.32974.6761.06956-.5328.27965-.8915.50991-1.0969-1.78017-.2047-3.63965-.9122-3.63965-4.04979 0-.89154.30956-1.62974.81948-2.20389-.08-.20542-.35966-1.04632.08-2.17395 0 0 .66991-.21539 2.20034.84091.64-.18473 1.31966-.27674 2-.27674.67966 0 1.36.09272 2.00003.27674 1.5304-1.06629 2.1996-.84091 2.1996-.84091.4404 1.12763.16 1.96853.08 2.17395.5099.57415.8202 1.30165.8202 2.20389 0 3.14759-1.8699 3.84439-3.65004 4.04979.29004.2567.53974.7489.53974 1.5177 0 1.097-.00975 1.9785-.00975 2.2553 0 .2154.15035.4721.54965.3902C13.7107 14.8973 16 11.8212 16 8.20221 16 3.67031 12.4202 0 8 0',
    ],
    external: ['m4 12 8-8', 'M5 3.5h7.5V11'],
  }[kind];
  paths.forEach((d, index) => {
    const path = doc.createElementNS(svg.namespaceURI, 'path');
    path.setAttribute('d', d);
    if (kind === 'copy' && index < 2)
      path.setAttribute('stroke-linecap', 'square');
    if (kind === 'external' && index === 0) {
      path.setAttribute('stroke-linecap', 'square');
      path.setAttribute('stroke-linejoin', 'round');
    }
    svg.append(path);
  });
  return svg;
}

/** Owns the island, its preview root, and all asynchronous work until disposal. */
export function mountDemo(
  host: HTMLElement,
  id: string,
  options: DemoRuntimeOptions = {},
): () => void {
  mounts.get(host)?.();
  const doc = host.ownerDocument;
  const root = doc.createElement('section');
  root.className = 'DemoRoot';
  const stem = `demo-${id.replace(/[^a-z0-9-]/gi, '-')}`;
  let suffix = 0;
  while (doc.getElementById(`${stem}-${suffix}`)) suffix++;
  root.id = `${stem}-${suffix}`;
  root.setAttribute('aria-label', `Demo ${id}`);
  host.append(root);
  let disposed = false;
  let epoch = 0;
  let sourceEpoch = 0;
  let disposePreview: (() => void) | undefined;
  const cleanups: (() => void)[] = [];
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    epoch++;
    sourceEpoch++;
    try {
      disposePreview?.();
    } finally {
      disposePreview = undefined;
      cleanups.splice(0).forEach((cleanup) => cleanup());
      root.remove();
      activeMounts.delete(dispose);
      if (mounts.get(host) === dispose) mounts.delete(host);
    }
  };
  mounts.set(host, dispose);
  activeMounts.add(dispose);
  const diagnostic = (error: unknown) => {
    const alert = doc.createElement('p');
    alert.setAttribute('role', 'alert');
    alert.textContent = `Demo ${id} failed: ${message(error)}`;
    return alert;
  };
  root.textContent = 'Loading demo…';
  void (options.loadDemo ?? loadDemo)(id)
    .then((entry) => {
      if (disposed) return;
      root.replaceChildren();
      const controls = doc.createElement('div');
      controls.className = 'DemoToolbar';
      const playground = doc.createElement('div');
      playground.className = 'DemoPlayground';
      const preview = doc.createElement('figure');
      preview.className = 'DemoPlaygroundInner';
      playground.append(preview);
      preview.id = `${root.id}-preview`;
      preview.setAttribute('aria-label', 'Demo preview');
      const codePanel = doc.createElement('div');
      codePanel.id = `${root.id}-code`;
      codePanel.className = 'DemoCodePanel';
      codePanel.dataset.expanded = 'false';
      const status = doc.createElement('p');
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      status.className = 'DemoStatus';
      const button = (label: string, action: () => void) => {
        const node = doc.createElement('button');
        node.type = 'button';
        node.textContent = label;
        node.addEventListener('click', action);
        return node;
      };
      let expanded = false;
      let collapsible = true;
      const reveal = button('', () => setExpanded(!expanded));
      const revealVisual = doc.createElement('span');
      revealVisual.className = 'DemoCollapseButtonVisual';
      reveal.append(revealVisual);
      reveal.className = 'DemoCodeReveal DemoCollapseButton';
      reveal.setAttribute('aria-controls', `${root.id}-source`);
      reveal.setAttribute('aria-expanded', 'false');
      function updateExpanded() {
        const open = expanded || !collapsible;
        codePanel.dataset.expanded = String(open);
        codePanel.toggleAttribute('data-closed', !open);
        reveal.setAttribute('aria-expanded', String(open));
        reveal.toggleAttribute('data-sticky', open);
        reveal.hidden = !collapsible;
        revealVisual.textContent = open ? 'Hide code' : 'Show code';
        pre.setAttribute('aria-hidden', String(!open));
        pre.tabIndex = open ? 0 : -1;
      }
      function setExpanded(next: boolean) {
        if (disposed) return;
        const topBefore = revealVisual.getBoundingClientRect().top;
        expanded = next;
        updateExpanded();
        const topAfter = revealVisual.getBoundingClientRect().top;
        if (!next && topAfter < 0)
          doc.defaultView?.scrollBy({
            top: topAfter - topBefore,
            behavior: 'instant',
          });
      }
      const select = doc.createElement('select');
      select.className = 'DemoVariantSelect';
      select.setAttribute('aria-label', 'Styling method');
      for (const variant of entry.variants) {
        const option = doc.createElement('option');
        option.value = variant.id;
        option.textContent = variant.label;
        if (variant.id === 'tailwind') option.textContent = 'Tailwind v4';
        select.append(option);
      }
      select.hidden = entry.variants.length <= 1;
      const fileTabs = doc.createElement('div');
      fileTabs.className = 'DemoFileTabs DemoTabsList';
      fileTabs.setAttribute('role', 'tablist');
      fileTabs.setAttribute('aria-label', 'Source files');
      const scrollRoot = doc.createElement('div');
      scrollRoot.className = 'DemoToolbarScrollAreaRoot';
      const viewport = doc.createElement('div');
      viewport.className = 'DemoToolbarViewport';
      viewport.setAttribute('aria-label', 'Demo toolbar');
      viewport.append(fileTabs);
      scrollRoot.append(viewport);
      const updateOverflow = () => {
        const start = Math.abs(viewport.scrollLeft);
        const end = Math.max(
          0,
          viewport.scrollWidth - viewport.clientWidth - start,
        );
        viewport.style.setProperty(
          '--scroll-area-overflow-x-start',
          `${start}px`,
        );
        viewport.style.setProperty('--scroll-area-overflow-x-end', `${end}px`);
        viewport.toggleAttribute(
          'data-has-overflow-x',
          viewport.scrollWidth > viewport.clientWidth,
        );
        viewport.tabIndex =
          viewport.scrollWidth > viewport.clientWidth ? 0 : -1;
      };
      viewport.addEventListener('scroll', updateOverflow);
      const Resize = doc.defaultView?.ResizeObserver;
      if (Resize) {
        const observer = new Resize(updateOverflow);
        observer.observe(viewport);
        observer.observe(fileTabs);
        cleanups.push(() => observer.disconnect());
      }
      const pre = doc.createElement('pre');
      pre.className = 'DemoCode';
      pre.id = `${root.id}-source`;
      const code = doc.createElement('code');
      pre.append(code);
      pre.addEventListener('keydown', (event) => {
        if (
          (event.ctrlKey || event.metaKey) &&
          event.key.toLowerCase() === 'a' &&
          !event.shiftKey &&
          !event.altKey
        ) {
          event.preventDefault();
          doc.getSelection()?.selectAllChildren(code);
        }
      });
      const sourceLink = doc.createElement('a');
      sourceLink.append(
        icon(doc, 'github'),
        ' View source on GitHub ',
        icon(doc, 'external'),
      );
      sourceLink.className = 'DemoSourceLink';
      sourceLink.target = '_blank';
      sourceLink.rel = 'noopener noreferrer';
      let selectedSource: string | undefined;
      const assetLink = doc.createElement('a');
      assetLink.textContent = 'Open asset';
      assetLink.hidden = true;
      const timers = new Map<HTMLElement, number>();
      const resetFeedback = (node: HTMLElement) => {
        const timer = timers.get(node);
        if (timer !== undefined) doc.defaultView?.clearTimeout(timer);
        timers.delete(node);
        node.replaceChildren(icon(doc, 'copy'));
        if (node !== copyButton) node.append(' Copy link to source');
      };
      cleanups.push(() => {
        for (const timer of timers.values())
          doc.defaultView?.clearTimeout(timer);
      });
      const copyText = (text: string, node: HTMLElement, success: string) => {
        if (disposed) return;
        const token = sourceEpoch;
        const clipboard = doc.defaultView?.navigator.clipboard;
        if (!clipboard) {
          status.textContent =
            'Copy unavailable: clipboard requires a secure context.';
          return;
        }
        void Promise.resolve()
          .then(() => {
            if (!disposed) return clipboard.writeText(text);
          })
          .then(
            () => {
              if (disposed || token !== sourceEpoch) return;
              resetFeedback(node);
              node.replaceChildren(icon(doc, 'check'));
              if (node !== copyButton) node.append(' Copy link to source');
              status.textContent = success;
              const timer = doc.defaultView?.setTimeout(
                () => resetFeedback(node),
                2000,
              );
              if (timer !== undefined) timers.set(node, timer);
            },
            (error) => {
              if (!disposed && token === sourceEpoch)
                status.textContent = `Copy failed: ${message(error)}`;
            },
          );
      };
      const copyButton = button('', () => {
        if (selectedSource !== undefined)
          copyText(selectedSource, copyButton, 'Code copied.');
      });
      copyButton.className = 'DemoCopyButton DemoCodeBlockCopyButton';
      copyButton.setAttribute('aria-label', 'Copy code');
      copyButton.title = 'Copy code';
      copyButton.append(icon(doc, 'copy'));
      copyButton.disabled = true;
      const menu = doc.createElement('details');
      menu.className = 'DemoActionsMenu';
      const summary = doc.createElement('summary');
      summary.append(icon(doc, 'more'));
      summary.setAttribute('aria-label', 'More actions');
      summary.setAttribute('role', 'button');
      summary.setAttribute('aria-haspopup', 'menu');
      summary.setAttribute('aria-expanded', 'false');
      const menuContent = doc.createElement('div');
      menuContent.className = 'DemoActionsContent MenuPopup';
      menuContent.id = `${root.id}-actions`;
      menuContent.setAttribute('role', 'menu');
      menuContent.setAttribute('aria-label', 'More actions');
      // The mobile toolbar scrolls. A top-layer popup keeps its menu outside the
      // scroll clip without adding a library root/context or a body-owned portal.
      const topLayer = typeof menuContent.showPopover === 'function';
      if (topLayer) {
        menuContent.setAttribute('popover', 'manual');
        menuContent.style.position = 'fixed';
        menuContent.style.margin = '0';
        menuContent.style.right = 'auto';
      }
      summary.setAttribute('aria-controls', menuContent.id);
      const copyLink = button('', () =>
        copyText(sourceLink.href, copyLink, 'Link copied!'),
      );
      copyLink.append(icon(doc, 'copy'), ' Copy link to source');
      const menuItems = [sourceLink, copyLink];
      menuItems.forEach((item) => {
        item.classList.add('MenuItem');
        item.setAttribute('role', 'menuitem');
        item.tabIndex = -1;
        item.addEventListener('focus', () =>
          item.setAttribute('data-highlighted', ''),
        );
        item.addEventListener('blur', () =>
          item.removeAttribute('data-highlighted'),
        );
      });
      const closeMenu = (restoreFocus = false) => {
        if (topLayer) menuContent.hidePopover();
        menu.open = false;
        summary.setAttribute('aria-expanded', 'false');
        if (restoreFocus) summary.focus({ preventScroll: true });
      };
      const positionMenu = () => {
        if (disposed || !topLayer || !menu.open) return;
        const anchor = summary.getBoundingClientRect();
        const popup = menuContent.getBoundingClientRect();
        const view = doc.defaultView!;
        menuContent.style.left = `${Math.max(8, Math.min(anchor.right - popup.width + 5, view.innerWidth - popup.width - 8))}px`;
        menuContent.style.top = `${Math.max(8, anchor.bottom + popup.height + 4 > view.innerHeight ? anchor.top - popup.height - 4 : anchor.bottom + 4)}px`;
      };
      const focusMenu = (last = false) => {
        if (disposed) return;
        menu.open = true;
        if (topLayer) menuContent.showPopover();
        positionMenu();
        summary.setAttribute('aria-expanded', 'true');
        menuItems[last ? menuItems.length - 1 : 0].focus();
      };
      summary.addEventListener('keydown', (event) => {
        if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
          event.preventDefault();
          focusMenu(event.key === 'ArrowUp');
        }
      });
      menu.addEventListener('toggle', () => {
        summary.setAttribute('aria-expanded', String(menu.open));
        if (!menu.open && topLayer) menuContent.hidePopover();
      });
      summary.addEventListener('click', (event) => {
        // Own the native details toggle: its default action runs after the click
        // microtask checkpoint, so queuing focus there misses pointer opening.
        event.preventDefault();
        if (menu.open) closeMenu(true);
        else focusMenu();
      });
      menu.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          closeMenu(true);
        } else if (event.key === 'Tab') closeMenu(true);
        else if (
          event.target !== summary &&
          ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)
        ) {
          event.preventDefault();
          const index = menuItems.findIndex(
            (item) => item === doc.activeElement,
          );
          const next =
            event.key === 'Home'
              ? 0
              : event.key === 'End'
                ? menuItems.length - 1
                : (index +
                    (event.key === 'ArrowDown' ? 1 : -1) +
                    menuItems.length) %
                  menuItems.length;
          menuItems[next].focus();
        }
      });
      sourceLink.addEventListener('click', () => closeMenu(true));
      const outside = (event: Event) => {
        if (menu.open && !event.composedPath().includes(menu)) closeMenu();
      };
      doc.addEventListener('pointerdown', outside);
      doc.addEventListener('focusin', outside);
      doc.addEventListener('scroll', positionMenu, true);
      doc.defaultView?.addEventListener('resize', positionMenu);
      cleanups.push(() => {
        if (topLayer) menuContent.hidePopover();
        doc.removeEventListener('pointerdown', outside);
        doc.removeEventListener('focusin', outside);
        doc.removeEventListener('scroll', positionMenu, true);
        doc.defaultView?.removeEventListener('resize', positionMenu);
      });
      menuContent.append(sourceLink, copyLink);
      menu.append(summary, menuContent);
      const toolbarActions = doc.createElement('div');
      toolbarActions.className = 'DemoToolbarActions';
      toolbarActions.append(select, menu);
      controls.append(scrollRoot, toolbarActions);
      // Move the same native controls rather than creating two independent selects
      // and menus. Their value/open state survives the upstream --sm breakpoint.
      const desktop = doc.defaultView?.matchMedia?.('(min-width: 40rem)');
      const placeActions = () => {
        const isDesktop = desktop?.matches ?? true;
        const destination = isDesktop ? controls : viewport;
        const focused = doc.activeElement;
        toolbarActions.className = `DemoToolbarActions DemoToolbarActions${isDesktop ? 'Desktop' : 'Mobile'}`;
        if (toolbarActions.parentElement !== destination) {
          destination.append(toolbarActions);
          if (focused && toolbarActions.contains(focused))
            (focused as HTMLElement).focus({ preventScroll: true });
        }
        updateOverflow();
      };
      desktop?.addEventListener('change', placeActions);
      cleanups.push(() => desktop?.removeEventListener('change', placeActions));
      placeActions();
      codePanel.append(pre, copyButton, assetLink, reveal);
      root.append(playground, controls, codePanel, status);
      function choose(variantId: string) {
        if (disposed) return;
        const token = ++epoch;
        sourceEpoch++;
        selectedSource = undefined;
        copyButton.disabled = true;
        resetFeedback(copyButton);
        resetFeedback(copyLink);
        assetLink.hidden = true;
        assetLink.removeAttribute('href');
        code.textContent = '';
        delete code.dataset.language;
        status.textContent = '';
        pre.removeAttribute('aria-labelledby');
        pre.setAttribute('aria-label', 'Demo source');
        disposePreview?.();
        disposePreview = undefined;
        preview.replaceChildren();
        fileTabs.replaceChildren();
        const variant = entry.variants.find((item) => item.id === variantId);
        if (!variant) {
          preview.append(diagnostic(`Unknown variant ${variantId}`));
          return;
        }
        const Component = variant.component;
        preview.dataset.demo = variant.id;
        sourceLink.href = `https://github.com/mui/base-ui/tree/19511bb171f3b360b006c94cf6d07e53cb446505/${entry.upstream.replace(/^(?:docs\/)?upstream\/base-ui\//, '').replace(/\/[^/]+$/, '')}/${variant.id === 'default' ? '' : variant.id}`;
        try {
          disposePreview = render(
            () => (
              <Errored
                fallback={(error) => (
                  <p role="alert">
                    Demo {id} failed: {message(error())}
                  </p>
                )}
              >
                <Component />
              </Errored>
            ),
            preview,
          );
        } catch (error) {
          preview.replaceChildren(diagnostic(error));
        }
        let selectedIndex = -1;
        const tabs = variant.files.map((path, index) => {
          const tab = button('', () => {
            setExpanded(true);
            if (selectedIndex !== index) void showFile(index);
          });
          const label = doc.createElement('span');
          label.textContent = path.split('/').pop() ?? path;
          tab.append(label);
          tab.className = 'DemoTab';
          tab.setAttribute('role', 'tab');
          tab.id = `${root.id}-file-${index}`;
          tab.setAttribute('aria-controls', pre.id);
          tab.addEventListener('focus', () => {
            if (selectedIndex !== index) {
              setExpanded(true);
              void showFile(index);
            }
          });
          tab.addEventListener('keydown', (event) => {
            let next = index;
            const direction =
              doc.defaultView?.getComputedStyle(fileTabs).direction === 'rtl'
                ? -1
                : 1;
            if (event.key === 'ArrowRight')
              next = (index + direction + tabs.length) % tabs.length;
            else if (event.key === 'ArrowLeft')
              next = (index - direction + tabs.length) % tabs.length;
            else if (event.key === 'Home') next = 0;
            else if (event.key === 'End') next = tabs.length - 1;
            else return;
            event.preventDefault();
            tabs[next].focus({ preventScroll: true });
            tabs[next].scrollIntoView?.({
              block: 'nearest',
              inline: 'nearest',
            });
          });
          return tab;
        });
        if (tabs.length > 1) fileTabs.append(...tabs);
        fileTabs.hidden = tabs.length <= 1;
        pre.setAttribute('role', tabs.length > 1 ? 'tabpanel' : 'region');
        async function showFile(index: number) {
          if (disposed || token !== epoch) return;
          selectedIndex = index;
          const sourceToken = ++sourceEpoch;
          selectedSource = undefined;
          copyButton.disabled = true;
          assetLink.hidden = true;
          assetLink.removeAttribute('href');
          resetFeedback(copyButton);
          delete code.dataset.language;
          collapsible = true;
          updateExpanded();
          pre.scrollTop = 0;
          pre.scrollLeft = 0;
          code.textContent = 'Loading source…';
          status.textContent = '';
          tabs.forEach((tab, i) => {
            tab.tabIndex = i === index ? 0 : -1;
            tab.setAttribute('aria-selected', String(i === index));
            tab.toggleAttribute('data-active', i === index);
          });
          const path = variant!.files[index];
          pre.setAttribute('aria-label', path);
          if (tabs.length > 1)
            pre.setAttribute('aria-labelledby', tabs[index].id);
          try {
            if (
              /\.(png|jpe?g|gif|webp|avif|ico|woff2?|ttf|otf|mp4|webm|pdf)$/i.test(
                path,
              )
            ) {
              const url = await (options.loadAsset ?? loadAsset)(path);
              if (disposed || token !== epoch || sourceToken !== sourceEpoch)
                return;
              code.textContent = `Binary asset: ${path}`;
              collapsible = false;
              updateExpanded();
              assetLink.href = url;
              assetLink.hidden = false;
              return;
            }
            const raw = await (options.loadSource ?? loadSource)(path);
            if (disposed || token !== epoch || sourceToken !== sourceEpoch)
              return;
            selectedSource = raw;
            copyButton.disabled = false;
            highlightSource(code, raw);
            code.dataset.language = path.split('.').pop();
            collapsible = raw.split('\n').length >= 8;
            updateExpanded();
          } catch (error) {
            if (!disposed && token === epoch && sourceToken === sourceEpoch) {
              code.textContent = `Source failed: ${message(error)}`;
              collapsible = false;
              updateExpanded();
            }
          }
        }
        if (tabs.length) void showFile(0);
        else {
          code.textContent = 'No source files declared.';
          collapsible = false;
          updateExpanded();
        }
        updateOverflow();
      }
      select.addEventListener('change', () => {
        setExpanded(true);
        choose(select.value);
      });
      if (!entry.variants.length) throw new Error('No executable variants');
      choose(entry.variants[0].id);
    })
    .catch((error) => {
      if (!disposed) root.replaceChildren(diagnostic(error));
    });
  return dispose;
}
