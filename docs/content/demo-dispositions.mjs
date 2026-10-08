// Framework-specific integrations from the pinned React handbook. These describe
// third-party React runtimes, not missing Base UI component demonstrations.
export const demoDispositions = {
  'animated-popover-motion-keep-mounted-false': { reason: 'This example integrates motion/react AnimatePresence with React unmounting. Solid examples use the CSS transition and manual-unmount contracts documented below.', url: '/solid/handbook/animation' },
  'animated-popover-motion-keep-mounted-true': { reason: 'This example integrates motion/react with a React ref. It is retained as upstream ecosystem context; CSS transitions work directly with Solid components.', url: '/solid/handbook/animation' },
  'animated-select-motion': { reason: 'This example uses motion/react. See the native Solid Select examples for transitions, positioning and selection.', url: '/solid/components/select' },
  'react-hook-form': { reason: 'React Hook Form requires React hooks. The native Solid Form example above demonstrates the same Base UI controls and validation responsibilities.', url: '/solid/components/form' },
  'tanstack-form': { reason: 'This source example uses @tanstack/react-form. It does not establish compatibility with @tanstack/solid-form; the native Solid Form example demonstrates the controls without a React adapter.', url: '/solid/components/form' },
};
