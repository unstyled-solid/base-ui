import { createEffect, createSignal, type Accessor } from 'solid-js';
import { createTimeout } from '../utils/createTimeout';
import { platform } from '../utils/platform';
export const INITIAL_LIVE_REGION_TEXT_MUTATION_RESET_DELAY = 200;
export function createInitialLiveRegionTextMutation<T extends HTMLElement>(present: boolean | Accessor<boolean> = true): (element: T | null) => void {
  const [element, setElement] = createSignal<T | null>(null);
  const timeout = createTimeout();
  createEffect(() => ({ element: element(), present: typeof present === 'function' ? present() : present }), (next) => {
    const root = next.element;
    if (!next.present || !root || platform.os.ios) return;
    const walker = root.ownerDocument.createTreeWalker(root, 4);
    let last: Text | null = null;
    while (walker.nextNode()) if (walker.currentNode.nodeValue !== '') last = walker.currentNode as Text;
    if (!last) return;
    const node = last;
    const original = node.data;
    const marked = `${original}\u2060`;
    node.data = marked;
    const restore = () => { if (node.data === marked) node.data = original; };
    timeout.start(INITIAL_LIVE_REGION_TEXT_MUTATION_RESET_DELAY, restore);
    return () => { timeout.clear(); restore(); };
  });
  return (node) => { setElement(() => node); };
}
export { createInitialLiveRegionTextMutation as useInitialLiveRegionTextMutation };
