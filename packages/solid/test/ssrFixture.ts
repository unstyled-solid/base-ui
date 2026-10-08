import { createComponent } from 'solid-js';
import { hydrate, type JSX } from '@solidjs/web';

export interface SSRFixtureRequest {
  module: string;
  exportName: string;
  renderId: string;
  props?: Record<string, unknown>;
  mode?: 'string' | 'stream';
}

/** Only actual separately compiled server HTML is accepted. Caller owns DOM/scripts/disposal. */
export async function fetchSSRFixture(request: SSRFixtureRequest): Promise<string> {
  const props = JSON.stringify(request.props ?? {}, (_key, value: unknown) => {
    if (typeof value === 'function' || typeof value === 'symbol' || typeof value === 'bigint' ||
      (value && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)) {
      throw new Error('SSR fixture props must be JSON data; create handles, promise gates and callbacks in the owner fixture or client setup');
    }
    return value;
  });
  const query = new URLSearchParams({
    module: request.module, export: request.exportName, renderId: request.renderId,
    props, mode: request.mode ?? 'string',
  });
  const response = await fetch(`/__harness__/ssr.html?${query}`);
  const html = await response.text();
  if (!response.ok || response.headers.get('X-Harness-Renderer') !== 'independent-solid2-ssr') {
    throw new Error(`SSR fixture ${request.module}#${request.exportName} failed (${response.status}): ${html}`);
  }
  return html;
}

/** Adopt real server DOM, then execute every native bootstrap/value/asset script. */
export function mountSSRFixtureHTML(html: string, container: HTMLElement = document.body) {
  const template = document.createElement('template');
  template.innerHTML = html;
  // Capture before moving main: serialized values/assets can be INSIDE main.
  const scripts = [...template.content.querySelectorAll('script')];
  const root = template.content.querySelector<HTMLElement>('main[data-harness-ssr="true"]');
  if (!root) throw new Error('Real SSR fixture response has no provenanced main root');
  const previousHydration = globalThis._$HY;
  const headAssets = [...template.content.querySelectorAll('style,link[rel="stylesheet"]')].filter(asset => !root.contains(asset));
  for (const asset of headAssets) container.ownerDocument.head.append(asset);
  container.append(root);
  Reflect.deleteProperty(globalThis, '_$HY');
  try {
    for (const script of scripts) {
      if (script.src || script.type === 'module') throw new Error('Use an owner document fixture for external/module document scripts');
      if (!script.type || /^(?:text|application)\/javascript$/.test(script.type)) new Function(script.textContent ?? '')();
    }
  } catch (error) {
    root.remove();
    headAssets.forEach(asset => asset.remove());
    if (previousHydration === undefined) Reflect.deleteProperty(globalThis, '_$HY');
    else globalThis._$HY = previousHydration;
    throw error;
  }
  return {
    root,
    restoreHydration() {
      headAssets.forEach(asset => asset.remove());
      if (previousHydration === undefined) Reflect.deleteProperty(globalThis, '_$HY');
      else globalThis._$HY = previousHydration;
    },
  };
}

/** Match the server's dynamically selected fixture without extra JSX-spread memo slots. */
export function hydrateSSRFixture<P extends object>(fixture: (props: P) => JSX.Element, props: P, root: HTMLElement, renderId: string) {
  return hydrate(() => createComponent(fixture, props), root, { renderId });
}
