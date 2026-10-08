import { createEffect, createSignal, type Accessor } from 'solid-js';
import { createBaseUiId } from '../createBaseUiId';
type Live<T> = T | Accessor<T>;
type LabelSource = HTMLElement & { labels?: NodeListOf<HTMLLabelElement> | null | undefined };
function read<T>(value: Live<T>): T { return typeof value === 'function' ? (value as Accessor<T>)() : value; }
export function createAriaLabelledBy(
  explicit: Live<string | undefined>, labelId: Live<string | undefined>,
  source: Accessor<LabelSource | null | undefined>, enabled: Live<boolean> = true,
  sourceId?: Live<string | undefined>, ariaLabel?: Live<string | undefined>,
): Accessor<string | undefined> {
  const generated = createBaseUiId(() => { const id = read(sourceId); return id ? `${id}-label` : undefined; });
  const [fallback, setFallback] = createSignal<string | undefined>(undefined);
  createEffect(() => ({ node: source(), explicit: read(explicit), label: read(labelId), enabled: read(enabled),
    ariaLabel: read(ariaLabel), generated: generated(), sourceId: read(sourceId) }), (next) => {
    const node = next.node;
    if (!node || next.explicit || next.label || next.ariaLabel?.trim() || !next.enabled) {
      setFallback(undefined);
      return;
    }
    const update = () => {
      const parent = node.parentElement;
      const sibling = node.nextElementSibling as HTMLLabelElement | null;
      let label = parent?.tagName === 'LABEL' ? parent as HTMLLabelElement
        : node.id && sibling?.htmlFor === node.id ? sibling : node.labels?.[0];
      // Firefox/WebKit can retain the old native labels collection after an
      // input ID changes. Do not publish a label for a different control ID.
      if (!label || (label.htmlFor !== node.id && !label.contains(node))) {
        label = undefined;
        if (node.id) {
          const root = node.getRootNode() as Document | ShadowRoot | Element;
          label = [...root.querySelectorAll<HTMLLabelElement>('label')].find((candidate) => candidate.htmlFor === node.id);
        }
      }
      if (label && !label.id) label.id = next.generated;
      setFallback(label?.id || undefined);
    };
    update();
    // Native association can change without a reactive prop changing. Observe
    // this root rather than emulating React's every-commit layout effect.
    const Observer = node.ownerDocument.defaultView?.MutationObserver;
    if (!Observer) return;
    const observer = new Observer(update);
    observer.observe(node.getRootNode(), { subtree: true, childList: true, attributes: true, attributeFilter: ['id', 'for'] });
    return () => observer.disconnect();
  });
  return () => {
    const explicitValue = read(explicit);
    if (explicitValue !== undefined) return explicitValue;
    if (read(ariaLabel)?.trim()) return undefined;
    return read(labelId) ?? (read(enabled) ? fallback() : undefined);
  };
}
export { createAriaLabelledBy as useAriaLabelledBy };
