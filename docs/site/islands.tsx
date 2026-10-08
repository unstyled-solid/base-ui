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
    } catch (error) { setStatus(`Search index unavailable: ${String(error)}. Use documentation navigation.`); }
  }
  const shortcut = (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (dialog.open) dialog.close(); else void open();
    }
  };
  document.addEventListener('keydown', shortcut);
  onCleanup(() => document.removeEventListener('keydown', shortcut));
  return <>
    <button ref={(el) => { opener = el; }} type="button" onClick={() => { void open(); }} aria-haspopup="dialog" aria-label="Search docs">Search (⌘k)</button>
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
        <input id="search-query" aria-label="Search terms" placeholder="Search" autocomplete="off" role="combobox" aria-expanded="true" aria-controls="search-results" aria-activedescendant={`search-option-${selected()}`} ref={(el) => { input = el; }} value={query()} onInput={(event) => { setQuery(event.currentTarget.value); setSelected(0); }} type="search"/>
      </div>
      <ul id="search-results" role="listbox">{results().map((page,index) => <>
        {(index===0 || results()[index-1].section!==page.section) && <li class="SiteSearchGroup" role="presentation">{page.section}</li>}
        <li role="presentation"><a id={`search-option-${index}`} role="option" aria-selected={selected()===index ? 'true' : 'false'} href={page.url} onPointerMove={()=>{ setSelected(index); }}>{page.title}</a></li>
      </>)}</ul>
      <p class="SiteSearchStatus" role="status">{status() || (query() && !results().length ? 'No results' : '↵　Go to page')}</p>
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
for (const button of document.querySelectorAll<HTMLButtonElement>('.CodeCopy')) {
  button.addEventListener('click', async () => {
    const code = button.closest('figure')?.querySelector('pre code')?.textContent;
    if (code == null) return;
    try {
      await navigator.clipboard.writeText(code);
      button.setAttribute('aria-label', 'Code copied');
      button.title = 'Code copied';
    } catch { button.title = 'Clipboard unavailable'; }
  });
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
    host.textContent = `Demo ${id} could not mount: ${String(error)}. See bsolid-docs-demos.`;
    host.dataset.missing = 'demo-runtime';
  });
}
window.addEventListener('pagehide', () => { for (const dispose of demoDisposals.splice(0)) dispose(); });
