import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSignal, flush } from 'solid-js';
import { advanceTimers, createRenderer, fireEvent, firePointer, popupConformanceTests, screen, sourceCase } from '../../../test';
import { PreviewCard } from '../index';
import { CardFixture } from '../PreviewCard.fixture';
import { OPEN_DELAY, CLOSE_DELAY } from '../utils/constants';

const source = 'packages/react/src/preview-card/root/PreviewCardRoot.test.tsx';
const { render, renderProps } = createRenderer();
function enter(element: Element) { fireEvent.mouseEnter(element); fireEvent.mouseMove(element); flush(); }
function leave(element: Element, relatedTarget?: Element) { fireEvent.mouseLeave(element, { relatedTarget }); flush(); }

describe('PreviewCard.Root', () => {
  beforeEach(() => { globalThis.BASE_UI_ANIMATIONS_DISABLED = true; });
  popupConformanceTests({
    createComponent: (props) => <CardFixture variant="contained" root={props.root} trigger={{ delay: 0, ...props.trigger }} popup={props.popup} portal={props.portal} />,
    triggerMouseAction: 'hover', browserIssue: 'bsolid-browser',
  });

  for (const variant of ['contained', 'detached', 'multiple detached'] as const) {
    describe(variant, () => {
      // Control hover delays, while native ResizeObserver and its frame remain
      // on the same real browser clock. These cases do not simulate paint.
      beforeEach(() => { vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] }); });
      sourceCase({ source, case: `uncontrolled open / hover and unhover [${variant}]`, environment: 'jsdom' }, async () => {
        await render(() => <CardFixture variant={variant} />);
        const link = screen.getByRole('link', { name: 'Link' });
        enter(link);
        await advanceTimers(OPEN_DELAY - 1);
        expect(screen.queryByTestId('popup')).toBeNull();
        await advanceTimers(1);
        expect(screen.getByTestId('popup')).toHaveAttribute('data-open');
        expect(link).toHaveAttribute('data-popup-open');
        leave(link);
        await advanceTimers(CLOSE_DELAY - 1);
        expect(screen.queryByTestId('popup')).not.toBeNull();
        await advanceTimers(1);
        expect(screen.queryByTestId('popup')).toBeNull();
      });
      sourceCase({ source, case: `focus and blur [${variant}]`, environment: 'jsdom' }, async () => {
        await render(() => <CardFixture variant={variant} />);
        const link = screen.getByRole('link', { name: 'Link' });
        link.focus(); flush();
        await advanceTimers(OPEN_DELAY);
        expect(screen.getByTestId('popup')).toHaveAttribute('data-open');
        link.blur(); flush();
        await advanceTimers(CLOSE_DELAY);
        expect(screen.queryByTestId('popup')).toBeNull();
      });
      for (const external of [false, true]) {
        sourceCase({ source, case: `${external ? 'does not close after hovering out of a popup opened externally' : 'closes after hovering out of a popup opened by its trigger'} [${variant}]`, environment: 'jsdom' }, async () => {
          await render(() => {
            const [open, setOpen] = createSignal(external);
            return <CardFixture variant={variant} root={{ get open() { return open(); }, onOpenChange: setOpen }} />;
          });
          if (!external) { enter(screen.getByRole('link', { name: 'Link' })); await advanceTimers(OPEN_DELAY); }
          const positioner = screen.getByTestId('positioner');
          enter(positioner); leave(positioner);
          await advanceTimers(CLOSE_DELAY);
          expect(screen.queryByTestId('popup') !== null).toBe(external);
        });
      }
      for (const controlled of [undefined, false, true]) {
        sourceCase({ source, case: `defaultOpen / controlled=${String(controlled)} [${variant}]`, environment: 'jsdom' }, async () => {
          await render(() => <CardFixture variant={variant} root={{ defaultOpen: true, open: controlled }} />);
          expect(screen.queryByTestId('popup') !== null).toBe(controlled !== false);
        });
      }
      sourceCase({ source, case: `defaultOpen remains uncontrolled; popup leave alone does not close [${variant}]`, environment: 'jsdom' }, async () => {
        await render(() => <CardFixture variant={variant} root={{ defaultOpen: true }} />);
        enter(screen.getByTestId('positioner')); leave(screen.getByTestId('positioner'));
        await advanceTimers(CLOSE_DELAY);
        expect(screen.queryByTestId('popup')).not.toBeNull();
        leave(screen.getByRole('link', { name: 'Link' }));
        await advanceTimers(CLOSE_DELAY);
        expect(screen.queryByTestId('popup')).toBeNull();
      });
      sourceCase({ source, case: `delay and closeDelay overrides [${variant}]`, environment: 'jsdom' }, async () => {
        await render(() => <CardFixture variant={variant} trigger={{ delay: 100, closeDelay: 100 }} />);
        const link = screen.getByRole('link', { name: 'Link' });
        enter(link); await advanceTimers(99);
        expect(screen.queryByTestId('popup')).toBeNull();
        await advanceTimers(1);
        expect(screen.queryByTestId('popup')).not.toBeNull();
        leave(link); await advanceTimers(99);
        expect(screen.queryByTestId('popup')).not.toBeNull();
        await advanceTimers(1);
        expect(screen.queryByTestId('popup')).toBeNull();
      });
      sourceCase({ source, case: `onOpenChange current callback, order and no duplicate change [${variant}]`, environment: 'jsdom' }, async () => {
        const old = vi.fn(); const next = vi.fn();
        const view = await renderProps((props: { change: PreviewCard.Root.Props['onOpenChange'] }) =>
          <CardFixture variant={variant} root={{ get onOpenChange() { return props.change; } }} />,
        { change: old });
        const link = screen.getByRole('link', { name: 'Link' });
        enter(link); await advanceTimers(OPEN_DELAY);
        enter(link); await advanceTimers(OPEN_DELAY);
        expect(old).toHaveBeenCalledTimes(1);
        expect(old).toHaveBeenCalledWith(true, expect.objectContaining({ reason: 'trigger-hover', trigger: link }));
        await view.setProps({ change: next });
        leave(link); await advanceTimers(CLOSE_DELAY);
        expect(next).toHaveBeenCalledWith(false, expect.objectContaining({ reason: 'trigger-hover' }));
        expect(old).toHaveBeenCalledTimes(1);
      });
      sourceCase({ source, case: `should call onOpenChange when the open state changes / controlled previous values [${variant}]`, environment: 'jsdom' }, async () => {
        const previous = vi.fn();
        await render(() => {
          const [open, setOpen] = createSignal(false);
          return <CardFixture variant={variant} root={{
            get open() { return open(); },
            onOpenChange: (nextOpen) => { previous(open()); setOpen(nextOpen); },
          }} />;
        });
        expect(screen.queryByTestId('popup')).toBeNull();
        const link = screen.getByRole('link', { name: 'Link' });
        enter(link); await advanceTimers(OPEN_DELAY);
        expect(screen.getByTestId('popup')).toHaveAttribute('data-open');
        expect(previous).toHaveBeenCalledTimes(1);
        expect(previous.mock.calls[0][0]).toBe(false);
        leave(link); await advanceTimers(CLOSE_DELAY);
        expect(screen.queryByTestId('popup')).toBeNull();
        expect(previous).toHaveBeenCalledTimes(2);
        expect(previous.mock.calls[1][0]).toBe(true);
      });
      sourceCase({ source, case: `onOpenChange cancel() prevents opening while uncontrolled [${variant}]`, environment: 'jsdom' }, async () => {
        const change = vi.fn((_open: boolean, details: PreviewCard.Root.ChangeEventDetails) => details.cancel());
        await render(() => <CardFixture variant={variant} root={{ onOpenChange: change }} />);
        enter(screen.getByRole('link', { name: 'Link' }));
        await advanceTimers(OPEN_DELAY);
        expect(change).toHaveBeenCalledTimes(1);
        expect(screen.queryByTestId('popup')).toBeNull();
      });
      sourceCase({ source, case: `reopens on hover after Escape closes it [${variant}]`, environment: 'jsdom' }, async () => {
        await render(() => <CardFixture variant={variant} trigger={{ delay: 100 }} />);
        const link = screen.getByRole('link', { name: 'Link' });
        enter(link); await advanceTimers(100);
        fireEvent.keyDown(link.ownerDocument.body, { key: 'Escape' }); flush();
        await advanceTimers(0);
        expect(screen.queryByTestId('popup')).toBeNull();
        enter(link); await advanceTimers(100);
        expect(screen.queryByTestId('popup')).not.toBeNull();
      });
      sourceCase({ source, case: `actionsRef close and manual unmount [${variant}]`, environment: 'jsdom', adaptation: 'native callback ref' }, async () => {
        let actions: PreviewCard.Root.Actions | null = null;
        const change = vi.fn((_open: boolean, details: PreviewCard.Root.ChangeEventDetails) => details.preventUnmountOnClose());
        const view = await render(() => <CardFixture variant={variant} root={{ actionsRef: (value) => { actions = value; }, onOpenChange: change }} />);
        enter(screen.getByRole('link', { name: 'Link' })); await advanceTimers(OPEN_DELAY);
        actions!.close(); flush(); await advanceTimers(CLOSE_DELAY);
        expect(screen.getByTestId('popup')).toHaveAttribute('data-closed');
        expect(change).toHaveBeenLastCalledWith(false, expect.objectContaining({ reason: 'imperative-action' }));
        actions!.unmount(); flush();
        expect(screen.queryByTestId('popup')).toBeNull();
        view.unmount(); expect(actions).toBeNull();
      });
    });
  }

  it('preserves native link navigation props and does not add button semantics', async () => {
    await render(() => <CardFixture variant="contained" trigger={{ target: '_blank', rel: 'noopener', download: 'preview' }} />);
    const link = screen.getByRole('link', { name: 'Link' });
    expect(link).toHaveAttribute('href', '#preview-card-link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener');
    expect(link).toHaveAttribute('download', 'preview');
    expect(link).not.toHaveAttribute('role', 'button');
    expect(link).not.toHaveAttribute('aria-haspopup');
  });
});

function Nested(props: { defaultOpen?: boolean; childDefaultOpen?: boolean }) {
  return <PreviewCard.Root defaultOpen={props.defaultOpen}>
    <PreviewCard.Trigger href="#" data-testid="parent-trigger">Parent</PreviewCard.Trigger>
    <PreviewCard.Portal><PreviewCard.Positioner data-testid="parent-positioner"><PreviewCard.Popup data-testid="parent-popup">
      <PreviewCard.Root defaultOpen={props.childDefaultOpen}>
        <PreviewCard.Trigger href="#" data-testid="child-trigger">Child</PreviewCard.Trigger>
        <PreviewCard.Portal><PreviewCard.Positioner data-testid="child-positioner"><PreviewCard.Popup data-testid="child-popup">Child content</PreviewCard.Popup></PreviewCard.Positioner></PreviewCard.Portal>
      </PreviewCard.Root>
    </PreviewCard.Popup></PreviewCard.Positioner></PreviewCard.Portal>
  </PreviewCard.Root>;
}

describe('PreviewCard nested hover races', () => {
  beforeEach(() => { vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] }); globalThis.BASE_UI_ANIMATIONS_DISABLED = true; });
  sourceCase({ source, case: 'keeps the parent open and re-opens the child when re-entering after partial close', environment: 'jsdom' }, async () => {
    await render(() => <Nested defaultOpen />);
    const parent = screen.getByTestId('parent-positioner');
    const child = screen.getByTestId('child-trigger');
    enter(child); await advanceTimers(OPEN_DELAY);
    leave(screen.getByTestId('child-positioner')); leave(parent);
    fireEvent.mouseMove(document.body);
    await advanceTimers(CLOSE_DELAY / 2);
    enter(parent); await advanceTimers(CLOSE_DELAY);
    expect(screen.queryByTestId('parent-popup')).not.toBeNull();
    expect(screen.queryByTestId('child-popup')).toBeNull();
    enter(child); await advanceTimers(OPEN_DELAY);
    const childPositioner = screen.getByTestId('child-positioner');
    leave(child, childPositioner); leave(parent, childPositioner); enter(childPositioner);
    await advanceTimers(CLOSE_DELAY);
    expect(screen.queryByTestId('parent-popup')).not.toBeNull();
    expect(screen.queryByTestId('child-popup')).not.toBeNull();
  });
  sourceCase({ source, case: 'parent popup closes as soon as the child popup closes', environment: 'jsdom' }, async () => {
    await render(() => <Nested />);
    const parentTrigger = screen.getByTestId('parent-trigger');
    enter(parentTrigger); await advanceTimers(OPEN_DELAY);
    const parent = screen.getByTestId('parent-positioner');
    leave(parentTrigger, parent); enter(parent);
    const child = screen.getByTestId('child-trigger');
    enter(child); await advanceTimers(OPEN_DELAY);
    const childPositioner = screen.getByTestId('child-positioner');
    leave(child, childPositioner); leave(parent, childPositioner); enter(childPositioner);
    leave(childPositioner); fireEvent.mouseMove(document.body, { clientX: -100, clientY: -100 });
    await advanceTimers(CLOSE_DELAY + 10);
    expect(screen.queryByTestId('parent-popup')).toBeNull();
    expect(screen.queryByTestId('child-popup')).toBeNull();
  });
  sourceCase({ source, case: 'keeps the parent preview card open when clicking nested trigger', environment: 'jsdom' }, async () => {
    await render(() => <Nested defaultOpen />);
    fireEvent.click(screen.getByTestId('child-trigger')); flush();
    await advanceTimers(CLOSE_DELAY);
    expect(screen.queryByTestId('parent-popup')).not.toBeNull();
  });
  sourceCase({ source, case: 'keeps the parent preview card open when hovering nested trigger', environment: 'jsdom' }, async () => {
    await render(() => <Nested defaultOpen />);
    enter(screen.getByTestId('child-trigger'));
    await advanceTimers(OPEN_DELAY);
    expect(screen.queryByTestId('parent-popup')).not.toBeNull();
    expect(screen.queryByTestId('child-popup')).not.toBeNull();
  });
  sourceCase({ source, case: 'keeps the parent preview card open when press starts in nested popup and ends outside', environment: 'jsdom' }, async () => {
    await render(() => <><button data-testid="outside">Outside</button><Nested defaultOpen childDefaultOpen /></>);
    firePointer.down(screen.getByTestId('child-popup'), { pointerType: 'mouse', button: 0, timeStamp: 1 });
    fireEvent.click(screen.getByTestId('outside')); flush();
    await advanceTimers(CLOSE_DELAY);
    expect(screen.queryByTestId('parent-popup')).not.toBeNull();
    expect(screen.queryByTestId('child-popup')).not.toBeNull();
  });
});
