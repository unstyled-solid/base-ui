/** Pinned source obligations, not a parity report. Kept in test code under the exclusive family boundary. */
export const dialogSourceSha = '19511bb171f3b360b006c94cf6d07e53cb446505';
export const dialogSourceFiles = [
  'root/DialogRoot.test.tsx', 'root/DialogRoot.detached-triggers.test.tsx', 'root/DialogRoot.spec.tsx',
  'trigger/DialogTrigger.test.tsx', 'portal/DialogPortal.test.tsx', 'popup/DialogPopup.test.tsx',
  'backdrop/DialogBackdrop.test.tsx', 'close/DialogClose.test.tsx', 'title/DialogTitle.test.tsx',
  'description/DialogDescription.test.tsx', 'viewport/DialogViewport.test.tsx',
] as const;
export type Stage = 'bsolid-c-dialog' | 'bsolid-c-dialog-handles';
export interface SourceAssignment {
  stage: Stage;
  targets: readonly string[];
  pending: readonly string[];
  adaptation: string;
}
const shared = ['bsolid-popup', 'bsolid-focus', 'bsolid-dismiss', 'bsolid-portal', 'bsolid-composite', 'bsolid-presence'];
const native = 'Native owners, live props, getter-backed payload context and committed split effects replace React rerender/store/effect replay.';
const root = 'root/DialogRoot.test.tsx';
const handles = 'root/DialogRoot.detached-triggers.test.tsx';
const browser = 'Dialog.browser.test.tsx';
const integration = 'Dialog.integration.browser.test.tsx';

/** Source line intervals deliberately refer to the immutable SHA, never mutable port line numbers. */
export function assignDialogSource(file: string, line: number, title: string): SourceAssignment | undefined {
  if (!dialogSourceFiles.includes(file as typeof dialogSourceFiles[number])) return undefined;
  if (file.endsWith('.spec.tsx')) return { stage: 'bsolid-c-dialog-handles', targets: ['root/DialogRoot.spec.tsx'], pending: ['bsolid-popup'], adaptation: native };
  if (file === handles) {
    if (line < 99) return {
      stage: 'bsolid-c-dialog-handles', targets: ['Dialog.ssr.test.tsx', 'tests/DialogHydrationFixture.tsx'],
      pending: ['bsolid-hydration', 'bsolid-popup'], adaptation: 'Separate SSR/client compilation; inert server handle snapshot, live client attachment, host Loading and delayed hydration replace React hydration gates.',
    };
    return {
      stage: 'bsolid-c-dialog-handles', targets: [handles, ...(line >= 936 && line < 1920 ? [browser] : [])],
      pending: [...shared, ...(line >= 936 && line < 1920 ? ['bsolid-browser'] : [])], adaptation: native,
    };
  }
  if (file === root) {
    const platformOnly = line >= 43 && line < 171;
    const crossFamily = (line >= 1035 && line < 1196) || (line >= 1275 && line < 1319) || (line >= 2160 && line < 2267);
    const browserOnly = platformOnly || (line >= 820 && line < 865) || (line >= 1237 && line < 1621) || (line >= 1649 && line < 2130) || line >= 2160;
    return {
      stage: /trigger|nested|animation|unmount|complete|focus/i.test(title) ? 'bsolid-c-dialog-handles' : 'bsolid-c-dialog',
      targets: platformOnly ? [browser, 'tests/trustedPointerReplay.tsx'] : crossFamily ? [integration] : browserOnly ? [browser, root] : [root],
      pending: [...shared, ...(platformOnly ? ['bsolid-browser: trusted CDP pointer driver'] : browserOnly ? ['bsolid-browser'] : []), ...(crossFamily ? ['bsolid-integration'] : [])],
      adaptation: native,
    };
  }
  if (file.startsWith('popup/')) return {
    stage: line >= 747 ? 'bsolid-c-dialog-handles' : 'bsolid-c-dialog',
    targets: [title.includes('conformance') ? 'Dialog.parts.test.tsx' : line >= 747 ? root : 'popup/DialogPopup.test.tsx', ...(line >= 383 && line < 454 || line >= 747 && line < 943 ? [browser] : [])],
    pending: [...shared, ...(line >= 383 && line < 454 || line >= 747 && line < 943 ? ['bsolid-browser'] : [])], adaptation: native,
  };
  return {
    stage: 'bsolid-c-dialog', targets: file.startsWith('portal/') && line >= 33 ? ['portal/DialogPortal.test.tsx'] : file.startsWith('viewport/') && line >= 24 ? [root] : ['Dialog.parts.test.tsx', 'root/DialogContext.test.tsx'],
    pending: shared, adaptation: 'Live Solid render callback/native ref arrays replace cloned React elements, className becomes class; all default/custom props and native cancellation still apply.',
  };
}

export const sourceParameterExpansions = {
  rootTriggerKinds: ['contained triggers', 'detached triggers', 'multiple detached triggers'],
  pointerDismissal: [true, false, undefined],
  keepMounted: [true, false, undefined],
  closedShadowNestedKinds: ['modal dialog', 'non-modal dialog', 'alert dialog'],
  closedShadowPortals: [['shadow root', undefined], ['shadow root', 'shadow root'], ['shadow root', 'body'], [undefined, undefined], [undefined, 'shadow root']],
  externalLockKinds: ['react-remove-scroll attribute + stylesheet', 'silk-hq body overflow', 'Ariakit html longhands'],
  conformanceParts: ['Trigger', 'Portal', 'Popup', 'Backdrop', 'Close', 'Title', 'Description', 'Viewport'],
  frameworkAdaptations: ['Strict Mode effect replay → native owner disposal/replacement', 'Fast Refresh → live handle swap plus trigger owner reparenting', 'React Suspense → host Loading', 'render JSX cloning → live callback and native refs'],
  upstreamUnconditionalSkip: 'packages/react/test/popupConformanceTests.tsx:156 removes the popup when the animation finishes (retained by the native browser conformance adapter)',
} as const;
