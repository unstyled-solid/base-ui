import { hydrate, render } from '@solidjs/web';
import { QualificationApp } from './qualification-app.js';
const params = new URLSearchParams(location.search);
const disposers = new Map<string, () => void>();
const mount = (prefix: string, disabledStyles = false, container?: HTMLElement) => {
  const host = container ?? document.body.appendChild(document.createElement('div'));
  host.dataset.mount = prefix;
  const dispose = render(() => <QualificationApp prefix={prefix} disabledStyles={disabledStyles} />, host);
  disposers.set(prefix, () => { dispose(); host.remove(); });
};
// Import evaluation alone must not insert styles or subscribe global listeners.
Object.assign(window, { qualificationImported: true, mountQualification: mount,
  disposeQualification: (prefix: string) => { disposers.get(prefix)?.(); disposers.delete(prefix); },
  hydrateQualification: () => {
    const stop = hydrate(() => <QualificationApp prefix="ssr" vertical={params.get('vertical') === 'true'} rtl={params.get('rtl') === 'true'} />, document.querySelector('main')!, { renderId: 'qualification-' });
    disposers.set('ssr', stop);
  },
});
