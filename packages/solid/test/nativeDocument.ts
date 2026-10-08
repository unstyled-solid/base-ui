import { inject } from 'vitest';

declare module 'vitest' {
  interface ProvidedContext { harnessNativeDocument: boolean }
}

export function isNativeDocumentLane() { return inject('harnessNativeDocument') ?? false; }

/** Real provider foreground/focus preparation; never intercepts requestPointerLock. */
export async function prepareNativeDocument() {
  const { commands } = await import('vitest/browser');
  return commands.prepareNativeDocument();
}
