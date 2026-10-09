import { createSignal, onCleanup } from 'solid-js';
import './demos.css';
import { render } from '@solidjs/web';

interface SearchPage { title: string; url: string; description: string; text: string; section?: string; order?: number; headings: { title: string; url: string }[] }
function ShellControls() {
  const [query, setQuery] = createSignal('');
  const [pages, setPages] = createSignal<SearchPage[]>([]);
  const [status, setStatus] = createSignal('');
  const [selected, setSelected] = createSignal(0);
  let dialog!: HTMLDialogElement;
  let input!: HTMLInputElement;
  let opener!: HTMLButtonElement;
  const results = () => {
    const words = query().toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
    return pages().filter((p) => p.order !== undefined && words.every((w) => `${p.title} ${p.description} ${p.text}`.toLocaleLowerCase().includes(w))).sort((a,b) => (a.order ?? 999)-(b.order ?? 999)).slice(0, words.length ? 30 : 100);
  };
  async function open() {
    dialog.showModal(); input.focus();
    if (pages().length) return;
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}search-index.json`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setPages(await response.json()); setStatus('');
    } catch (error) { console.error('Documentation search failed', error); setStatus('Search is unavailable. Use documentation navigation or get support on GitHub.'); }
  }
  const shortcut = (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (dialog.open) dialog.close(); else void open();
    }
  };
  document.addEventListener('keydown', shortcut);
  onCleanup(() => document.removeEventListener('keydown', shortcut));
  const apple = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
  return <>
    <button ref={(el) => { opener = el; }} type="button" onClick={() => { void open(); }} aria-haspopup="dialog" aria-label="Search docs" aria-keyshortcuts={apple ? 'Meta+K' : 'Control+K'}>Search ({apple ? '⌘K' : 'Ctrl+K'})</button>
    <dialog class="SiteSearch" ref={(el) => { dialog = el; }} onClose={() => opener.focus()} aria-label="Search documentation"
      onClick={(event) => { if (event.target === dialog) { const box=dialog.getBoundingClientRect(); if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom) dialog.close(); } }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') { event.preventDefault(); dialog.close(); }
        else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          const next=Math.max(0,Math.min(results().length-1,selected()+(event.key==='ArrowDown'?1:-1)));
          setSelected(next); document.getElementById(`search-option-${next}`)?.scrollIntoView({block:'nearest'});
        } else if (event.key === 'Enter' && event.target === input && results()[selected()]) { event.preventDefault(); location.href=results()[selected()].url; }
      }}>
      <div class="SiteSearchInput"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="7" cy="7" r="5"/><path d="m11 11 4 4"/></svg>
        <input id="search-query" aria-label="Search terms" placeholder="Search" autocomplete="off" role="combobox" aria-expanded="true" aria-controls="search-results" aria-activedescendant={results()[selected()] ? `search-option-${selected()}` : undefined} ref={(el) => { input = el; }} value={query()} onInput={(event) => { setQuery(event.currentTarget.value); setSelected(0); }} type="search"/>
      </div>
      <ul id="search-results" role="listbox">{results().map((page,index) => <>
        {(index===0 || results()[index-1].section!==page.section) && <li class="SiteSearchGroup" role="presentation">{page.section}</li>}
        <li role="presentation"><a id={`search-option-${index}`} role="option" aria-selected={selected()===index ? 'true' : 'false'} href={page.url} onPointerMove={()=>{ setSelected(index); }}>{page.title}</a></li>
      </>)}</ul>
      <p class="SiteSearchStatus" role="status">{status() || (query() && !results().length ? 'No results' : '↵　Go to page')}</p>
      {status() && <a href="https://github.com/unstyled-solid/base-ui">Get support on GitHub</a>}
    </dialog>
  </>;
}

const shell = document.getElementById('shell-island');
if (shell) render(() => <ShellControls />, shell);
const navigationViewport = document.querySelector<HTMLElement>('.SideNavViewport');
if (navigationViewport) {
  const saved = sessionStorage.getItem('docs-navigation-scroll');
  if (saved) navigationViewport.scrollTop = Number(saved);
  const active = navigationViewport.querySelector<HTMLElement>('[aria-current="page"]');
  if (active) {
    const item = active.getBoundingClientRect(), viewport = navigationViewport.getBoundingClientRect();
    if (item.bottom > viewport.bottom) navigationViewport.scrollTop += item.bottom - viewport.bottom + 24;
    else if (item.top < viewport.top) navigationViewport.scrollTop -= viewport.top - item.top + 24;
  }
  navigationViewport.addEventListener('scroll', () => sessionStorage.setItem('docs-navigation-scroll', String(navigationViewport.scrollTop)), {passive:true});
}
const codeCopyDisposals: (() => void)[] = [];
for (const button of document.querySelectorAll<HTMLButtonElement>('.CodeCopy')) {
  const original = button.innerHTML;
  const label = button.getAttribute('aria-label') ?? 'Copy code';
  const title = button.title;
  const status = document.createElement('span');
  status.className = 'SiteSearchStatus';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  button.after(status);
  let timer: number | undefined;
  let disposed = false;
  const reset = () => {
    if (timer !== undefined) window.clearTimeout(timer);
    timer = undefined;
    button.innerHTML = original;
    button.setAttribute('aria-label', label);
    button.title = title;
    status.textContent = '';
  };
  const copy = async () => {
    const code = button.closest('figure')?.querySelector('pre code')?.textContent;
    if (code == null) return;
    try {
      await navigator.clipboard.writeText(code);
      if (disposed) return;
      reset();
      button.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true"><path d="m2.5 8.5 4 4 7-9"/></svg>';
      button.setAttribute('aria-label', 'Code copied');
      button.title = 'Code copied';
      status.textContent = 'Code copied.';
    } catch (error) {
      console.error('Documentation code copy failed', error);
      if (disposed) return;
      reset();
      button.title = 'Clipboard unavailable';
      status.textContent = 'Copy unavailable. Select the code to copy it manually.';
    }
    timer = window.setTimeout(reset, 2000);
  };
  button.addEventListener('click', copy);
  codeCopyDisposals.push(() => { disposed = true; reset(); button.removeEventListener('click', copy); status.remove(); });
}

// Vite virtual module selects the owned runtime only when it exists.
// It never imports source React demo factories or implements replacement previews.
const demoDisposals: (() => void)[] = [];
for (const host of document.querySelectorAll<HTMLElement>('[data-demo-id]')) {
  const id = host.dataset.demoId!;
  void import('virtual:docs-demo-runtime').then(async ({ mountDemo }) => {
    host.replaceChildren();
    const cleanup = await mountDemo(host, id);
    if (typeof cleanup === 'function') demoDisposals.push(cleanup as () => void);
  }).catch((error: unknown) => {
    console.error('Documentation demo could not mount', error);
    const support = document.createElement('a');
    support.href = 'https://github.com/unstyled-solid/base-ui';
    support.textContent = 'get support on GitHub';
    host.replaceChildren('This demo could not load. Please try again or ', support, '.');
    host.dataset.missing = 'demo-runtime';
  });
}
window.addEventListener('pagehide', () => { for (const dispose of codeCopyDisposals.splice(0)) dispose(); for (const dispose of demoDisposals.splice(0)) dispose(); });
