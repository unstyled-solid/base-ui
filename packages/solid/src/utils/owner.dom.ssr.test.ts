import { expect, it } from 'vitest';
it('imports every implemented DOM leaf without resolving browser globals', async () => {
  const names = ['window', 'document', 'navigator', 'CSS', 'HTMLElement', 'Element', 'ShadowRoot', 'Node'] as const;
  const previous = names.map((name) => Object.getOwnPropertyDescriptor(globalThis, name));
  for (const name of names) Object.defineProperty(globalThis, name, { configurable: true, get() { throw new Error(`Eager DOM global: ${name}`); } });
  try {
    const modules = await Promise.all([
      import('./owner'), import('./shadowDom'), import('./addEventListener'), import('./mergeCleanups'),
      import('./areArraysEqual'), import('./clamp'), import('./empty'), import('./fastObjectShallowCompare'),
      import('./mergeObjects'), import('./createLogOnce'), import('./error'), import('./warn'), import('./formatErrorMessage'),
      import('./inertValue'), import('./isElementDisabled'), import('./isHTMLElement'), import('./isMouseWithinBounds'),
      import('./getDefaultFormSubmitter'), import('./visuallyHidden'), import('./getCssDimensions'),
      import('./getPseudoElementBounds'), import('./getElementAtPoint'), import('./getElementTransform'),
      import('./scrollable'), import('./scrollEdges'), import('./valueToPercent'), import('./platform'),
      import('../internals/constants'), import('../internals/noop'),
      import('../floating-ui-react/utils/element'), import('../floating-ui-react/utils/visibility'),
      import('../floating-ui-react/utils/tabbable'), import('../floating-ui-react/utils/enqueueFocus'),
      import('../floating-ui-react/utils/markOthers'), import('../floating-ui-react/utils/createAttribute'),
      import('../floating-ui-react/utils/constants'),
    ]);
    expect(modules).toHaveLength(36);
  } finally {
    names.forEach((name, index) => {
      const descriptor = previous[index];
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else Reflect.deleteProperty(globalThis, name);
    });
  }
});
