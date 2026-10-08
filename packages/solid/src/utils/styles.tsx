import { createEffect, createSignal, onSettled } from 'solid-js';
import { useCSPContext } from '../internals/csp-context';
const className = 'base-ui-disable-scrollbar';
const text = `.${className}{scrollbar-width:none}.${className}::-webkit-scrollbar{display:none}`;
interface Sheet { element: HTMLStyleElement; leases: Set<object> }
const sheets = new WeakMap<Document | ShadowRoot, Map<string, Sheet>>();
function ScrollbarStyle(props: { nonce?: string | undefined }) {
  const csp = useCSPContext();
  const [ready, setReady] = createSignal(false);
  const [scope, setScope] = createSignal<Document | ShadowRoot | null>(null);
  let local: HTMLStyleElement | undefined;
  onSettled(() => {
    const root = local?.getRootNode();
    setScope(root?.nodeType === 11 && 'host' in root ? root as ShadowRoot : local?.ownerDocument ?? document);
    setReady(true);
  });
  createEffect(() => ({ scope: scope(), ready: ready(), disabled: csp?.disableStyleElements ?? false, nonce: props.nonce ?? csp?.nonce }), (next) => {
    if (!next.scope || !next.ready || next.disabled) return;
    const key = `${className}:${next.nonce ?? ''}`;
    let registry = sheets.get(next.scope);
    if (!registry) { registry = new Map(); sheets.set(next.scope, registry); }
    let sheet = registry.get(key);
    if (!sheet) {
      const doc = next.scope.nodeType === 9 ? next.scope as Document : next.scope.ownerDocument;
      if (!doc) return;
      const element = doc.createElement('style');
      element.setAttribute('data-base-ui-style', className);
      if (next.nonce !== undefined) element.nonce = next.nonce;
      element.textContent = text;
      (next.scope.nodeType === 9 ? doc.head : next.scope).appendChild(element);
      sheet = { element, leases: new Set() }; registry.set(key, sheet);
    }
    const owned = sheet, lease = {};
    owned.leases.add(lease);
    return () => {
      owned.leases.delete(lease);
      if (!owned.leases.size) { owned.element.remove(); if (registry!.get(key) === owned) registry!.delete(key); }
    };
  });
  // The local server/first-hydration element is retired only after a committed
  // shared sheet is installed. CSS stays available across that native boundary.
  return <>{!ready() && !csp?.disableStyleElements && <style ref={(element) => { local = element; }} nonce={props.nonce ?? csp?.nonce} data-base-ui-style={className}>{text}</style>}</>;
}
export const styleDisableScrollbar = { className, class: className, getElement(nonce?: string) { return <ScrollbarStyle nonce={nonce} />; } };
