import { onSettled } from 'solid-js';
import { expect, it } from 'vitest';
import { createRenderer, waitFor } from '../../test';
import { createScrollLock } from './createScrollLock';

// Pinned utils/useScrollLock owner-document and restoration contract. Native
// Solid templates add an inert-document phase before that document is known.
it('locks the adopted reference document and restores it on owner disposal', async () => {
  const iframe = document.createElement('iframe');
  document.body.append(iframe);
  const doc = iframe.contentDocument!;
  const template = document.createElement('template');
  template.innerHTML = '<div></div>';
  const node = template.content.firstElementChild!;
  expect(node.ownerDocument.defaultView).toBeNull();
  const parentStyles = [document.documentElement.style.cssText, document.body.style.cssText];
  const styles = [doc.documentElement.style.cssText, doc.body.style.cssText];
  const view = await createRenderer().render(() => {
    createScrollLock(() => true, () => node);
    onSettled(() => { doc.body.append(node); });
    return <span />;
  });
  try {
    await waitFor(() => expect(doc.body.style.overflowY).toBe('hidden'));
    expect(node.ownerDocument).toBe(doc);
    expect([document.documentElement.style.cssText, document.body.style.cssText]).toEqual(parentStyles);
    view.unmount();
    await waitFor(() => expect([doc.documentElement.style.cssText, doc.body.style.cssText]).toEqual(styles));
  } finally {
    view.unmount();
    iframe.remove();
  }
});
