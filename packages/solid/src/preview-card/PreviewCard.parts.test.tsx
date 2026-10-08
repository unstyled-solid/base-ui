/// <reference path="../../test/types.d.ts" />
import { describe, expect, it } from 'vitest';
import { Errored } from 'solid-js';
import { createRenderer, describeConformance, screen, sourceCase } from '../../test';
import { PreviewCard } from './index';

const { render } = createRenderer();

describe('PreviewCard.Trigger conformance', () => {
  describeConformance((props: PreviewCard.Trigger.Props) => <PreviewCard.Root open><PreviewCard.Trigger {...props} /></PreviewCard.Root>, {
    initialProps: {}, refInstanceof: HTMLAnchorElement,
  });
});
describe('PreviewCard.Portal conformance', () => {
  describeConformance((props: PreviewCard.Portal.Props) => <PreviewCard.Root open><PreviewCard.Portal keepMounted {...props} /></PreviewCard.Root>, {
    initialProps: {}, refInstanceof: HTMLDivElement,
  });
});
describe('PreviewCard.Positioner conformance', () => {
  describeConformance((props: PreviewCard.Positioner.Props) => <PreviewCard.Root open><PreviewCard.Portal><PreviewCard.Positioner {...props} /></PreviewCard.Portal></PreviewCard.Root>, {
    initialProps: {}, refInstanceof: HTMLDivElement,
  });
});
describe('PreviewCard.Popup conformance', () => {
  describeConformance((props: PreviewCard.Popup.Props) => <PreviewCard.Root open><PreviewCard.Portal><PreviewCard.Positioner><PreviewCard.Popup {...props} /></PreviewCard.Positioner></PreviewCard.Portal></PreviewCard.Root>, {
    initialProps: {}, refInstanceof: HTMLDivElement,
  });
});
describe('PreviewCard.Arrow conformance', () => {
  describeConformance((props: PreviewCard.Arrow.Props) => <PreviewCard.Root open><PreviewCard.Portal><PreviewCard.Positioner><PreviewCard.Popup><PreviewCard.Arrow {...props} /></PreviewCard.Popup></PreviewCard.Positioner></PreviewCard.Portal></PreviewCard.Root>, {
    initialProps: {}, refInstanceof: HTMLDivElement,
  });
});
describe('PreviewCard.Backdrop conformance', () => {
  describeConformance((props: PreviewCard.Backdrop.Props) => <PreviewCard.Root open><PreviewCard.Backdrop {...props} /></PreviewCard.Root>, {
    initialProps: {}, refInstanceof: HTMLDivElement, click: 'dispatch',
  });
});
describe('PreviewCard.Viewport conformance', () => {
  describeConformance((props: PreviewCard.Viewport.Props) => <PreviewCard.Root open><PreviewCard.Portal><PreviewCard.Positioner><PreviewCard.Popup><PreviewCard.Viewport {...props} /></PreviewCard.Popup></PreviewCard.Positioner></PreviewCard.Portal></PreviewCard.Root>, {
    initialProps: {}, refInstanceof: HTMLDivElement,
  });
});

describe('PreviewCard part semantics', () => {
  sourceCase({ source: 'packages/react/src/preview-card/backdrop/PreviewCardBackdrop.test.tsx', case: 'sets `pointer-events: none` style', environment: 'jsdom' }, async () => {
    await render(() => <PreviewCard.Root defaultOpen><PreviewCard.Backdrop data-testid="backdrop" /></PreviewCard.Root>);
    expect(screen.getByTestId('backdrop').style.pointerEvents).toBe('none');
    expect(screen.getByTestId('backdrop')).toHaveAttribute('role', 'presentation');
  });
  sourceCase({ source: 'packages/react/src/preview-card/popup/PreviewCardPopup.test.tsx', case: 'should render the children', environment: 'jsdom' }, async () => {
    await render(() => <PreviewCard.Root open><PreviewCard.Portal><PreviewCard.Positioner><PreviewCard.Popup>Content</PreviewCard.Popup></PreviewCard.Positioner></PreviewCard.Portal></PreviewCard.Root>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
  it('requires Root or handle for Trigger', async () => {
    await render(() => <Errored fallback={(error) => <span>{String(error())}</span>}><PreviewCard.Trigger /></Errored>);
    expect(screen.getByText(/must be either used within a <PreviewCard.Root>/)).toBeInTheDocument();
  });
  it('requires Root for Popup', async () => {
    await render(() => <Errored fallback={(error) => <span>{String(error())}</span>}><PreviewCard.Popup /></Errored>);
    expect(screen.getByText(/PreviewCardRootContext is missing/)).toBeInTheDocument();
  });
  it('requires Portal for Positioner', async () => {
    await render(() => <Errored fallback={(error) => <span>{String(error())}</span>}><PreviewCard.Root open><PreviewCard.Positioner /></PreviewCard.Root></Errored>);
    expect(screen.getByText(/Base UI: <PreviewCard.Portal> is missing/)).toBeInTheDocument();
  });
  for (const Part of [PreviewCard.Popup, PreviewCard.Viewport]) {
    it(`requires Positioner for ${Part.name}`, async () => {
      await render(() => <Errored fallback={(error) => <span>{String(error())}</span>}><PreviewCard.Root open><PreviewCard.Portal><Part /></PreviewCard.Portal></PreviewCard.Root></Errored>);
      expect(screen.getByText(/PreviewCardPositionerContext is missing/)).toBeInTheDocument();
    });
  }
});
