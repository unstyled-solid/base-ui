import { hydrate, isServer, render } from '@solidjs/web';
import { Fixture, type FixtureProps, type Hooks } from './fixtures';

interface Entry { props: FixtureProps; renderId: string }
declare global {
  interface Window {
    qualification: ReturnType<typeof boot>;
    hydrationEntries: Entry[];
  }
}

function boot() {
  if (isServer) throw new Error('CLIENT_RESOLVED_SERVER');
  const counts: Record<string, Record<string, number>> = {};
  const disposers = new Map<string, () => void>();
  const actions = new Map<string, { update?: () => void; close?: () => void; resume?: () => void; resolve?: () => void }>();
  const originals = new Map<string, Element[]>();
  function attach(entry: Entry, root: HTMLElement, clientOnly = false, container?: Element) {
    const key = entry.renderId;
    counts[key] = {};
    const increment = (name: string) => { counts[key][name] = (counts[key][name] ?? 0) + 1; };
    const action: { update?: () => void; close?: () => void; resume?: () => void; resolve?: () => void } = {};
    actions.set(key, action);
    const delayTrigger = new Promise<void>(resolve => { action.resume = resolve; });
    const hooks: Hooks = {
      event: increment, ready: () => increment('ready'), cleanup: () => increment('cleanup'),
      update: fn => { action.update = fn; }, close: fn => { action.close = fn; },
      ...(entry.props.kind === 'detached' ? { delayTrigger } : {}),
      ...(entry.props.kind === 'stream' ? { load: async (request: string, version: number) => {
        if (version > 0) await new Promise<void>(resolve => { action.resolve = resolve; });
        return [{ id: 'a', text: `${request}:${version}:a` }, { id: 'b', text: `${request}:${version}:b` }];
      } } : {}),
    };
    originals.set(key, [...root.querySelectorAll('[data-probe], [data-row]')]);
    const app = () => <Fixture {...entry.props} hooks={hooks} container={container} />;
    disposers.set(key, clientOnly ? render(app, root, undefined, { renderId: key }) : hydrate(app, root, { renderId: key }));
  }
  for (const entry of window.hydrationEntries) {
    const root = document.getElementById(entry.renderId);
    if (!root) throw new Error(`Missing root ${entry.renderId}`);
    const target = new URL(location.href).searchParams.get('container');
    let container: Element | undefined;
    if (target === 'shadow') {
      const host = document.createElement('div'); host.id = 'shadow-host'; document.body.append(host);
      container = document.createElement('div'); host.attachShadow({ mode: 'open' }).append(container);
    }
    if (target === 'iframe') {
      const iframe = document.createElement('iframe'); iframe.id = 'portal-frame'; document.body.append(iframe);
      container = iframe.contentDocument!.body;
    }
    attach(entry, root, false, container);
  }
  return {
    counts,
    identity(key: string) {
      return originals.get(key)!.every(node => {
        const probe = node.getAttribute('data-probe');
        const row = node.getAttribute('data-row');
        return document.getElementById(key)!.querySelector(probe ? `[data-probe="${probe}"]` : `[data-row="${row}"]`) === node;
      });
    },
    update(key: string) { actions.get(key)?.update?.(); },
    close(key: string) { actions.get(key)?.close?.(); },
    resume(key: string) { actions.get(key)?.resume?.(); },
    resolve(key: string) { actions.get(key)?.resolve?.(); },
    dispose(key: string) { disposers.get(key)?.(); disposers.delete(key); },
    mount(key: string, parentKey?: string) {
      const root = document.createElement('div'); root.id = key;
      (parentKey ? document.querySelector(`#${parentKey} [data-probe="nested-mount"]`)! : document.body).append(root);
      attach({ renderId: key, props: { kind: 'controls', request: key } }, root, true);
    },
  };
}

window.qualification = boot();
