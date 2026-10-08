import { describe, expect, it } from 'vitest';
import { createRoot } from 'solid-js';
import { useNavigationMenuRootContext } from './NavigationMenuRootContext';
import { useNavigationMenuItemContext } from '../item/NavigationMenuItemContext';
import { useNavigationMenuPositionerContext } from '../positioner/NavigationMenuPositionerContext';
import { useNavigationMenuPortalContext } from '../portal/NavigationMenuPortalContext';

// React-only displayName checks map to createContext's native development `name`
// option. There is no React context object emulation in the Solid implementation.
describe('NavigationMenuRootContext and required part contexts', () => {
  it('optional nesting reads return null without a provider', () => {
    createRoot((dispose) => {
      try {
        expect(useNavigationMenuRootContext(true)).toBeNull();
        expect(useNavigationMenuPositionerContext(true)).toBeNull();
      } finally { dispose(); }
    });
  });
  for (const [read, message] of [
    [() => useNavigationMenuRootContext(), 'NavigationMenuRootContext is missing'],
    [useNavigationMenuItemContext, 'NavigationMenuItem parts must be used within a <NavigationMenu.Item>'],
    [() => useNavigationMenuPositionerContext(), 'NavigationMenuPositionerContext is missing'],
    [useNavigationMenuPortalContext, '<NavigationMenu.Portal> is missing'],
  ] as const) {
    it(`required read reports ${message}`, () => {
      createRoot((dispose) => {
        try { expect(() => read()).toThrow(message); }
        finally { dispose(); }
      });
    });
  }
});
