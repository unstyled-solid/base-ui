import { describe, expect, it } from 'vitest';
import type { JSX } from '@solidjs/web';
import { createContext, Errored } from 'solid-js';
import { createRenderer, describeConformance, screen, waitFor, fireEvent } from '../../test';
import { Tooltip } from './index';
import { Fixture, hover, settle } from './Tooltip.test-utils';

const { render, renderProps } = createRenderer();
function Position(props: { children?: JSX.Element }) {
  return <Tooltip.Root open><Tooltip.Portal><Tooltip.Positioner>{props.children}</Tooltip.Positioner></Tooltip.Portal></Tooltip.Root>;
}
describe('Tooltip small-part conformance', () => {
  it('renders a context-provider child as renderer-owned JSX without recreating its portal', async () => {
    const Context = createContext<object>();
    const attached: (HTMLDivElement | null)[] = [];
    const view = await render(() => <Tooltip.Root open><Context value={{}}><Tooltip.Portal ref={node => { attached.push(node); }} data-testid="portal" /></Context></Tooltip.Root>);
    const portal = screen.getByTestId('portal');
    expect(attached).toEqual([portal]);
    view.unmount(); expect(attached).toEqual([portal, null]);
  });
  it('preserves a styled portal host through live attribute changes', async () => {
    const view = await renderProps((props: { lang: string; color: string }) =>
      <Tooltip.Root open><Tooltip.Portal data-testid="portal" lang={props.lang} style={{ color: props.color }} /></Tooltip.Root>,
    { lang: 'fr', color: 'green' });
    const portal = screen.getByTestId('portal');
    await view.setProps({ lang: 'de', color: 'red' });
    expect(screen.getByTestId('portal')).toBe(portal);
    expect(portal).toHaveAttribute('lang', 'de'); expect(portal.style.color).toBe('red');
    view.unmount();
  });
  for (const [title, Component, message] of [
    ['Trigger without Root or handle', () => <Tooltip.Trigger />, 'Base UI: <Tooltip.Trigger> must be either used within a <Tooltip.Root> component or provided with a handle.'],
    ['Positioner without Root', () => <Tooltip.Positioner />, 'Base UI: TooltipRootContext is missing. Tooltip parts must be placed within <Tooltip.Root>.'],
    ['Positioner without Portal', () => <Tooltip.Root open><Tooltip.Positioner /></Tooltip.Root>, 'Base UI: <Tooltip.Portal> is missing.'],
    ['Popup without Positioner', () => <Tooltip.Root open><Tooltip.Portal><Tooltip.Popup /></Tooltip.Portal></Tooltip.Root>, 'Base UI: TooltipPositionerContext is missing. TooltipPositioner parts must be placed within <Tooltip.Positioner>.'],
  ] as const) {
    it(`throws a descriptive error: ${title}`, async () => {
      await render(() => <Errored fallback={error => <span data-testid="error">{String(error())}</span>}><Component /></Errored>);
      expect(screen.getByTestId('error').textContent).toContain(message);
    });
  }
  describe('Trigger', () => describeConformance(
    (props: Tooltip.Trigger.Props) => <Tooltip.Root><Tooltip.Trigger {...props} /></Tooltip.Root>,
    { initialProps: {}, refInstanceof: HTMLButtonElement },
  ));
  describe('Portal', () => describeConformance(
    (props: Tooltip.Portal.Props) => <Tooltip.Root open><Tooltip.Portal {...props} /></Tooltip.Root>,
    { initialProps: {}, refInstanceof: HTMLDivElement },
  ));
  describe('Positioner', () => describeConformance(
    (props: Tooltip.Positioner.Props) => <Tooltip.Root open><Tooltip.Portal><Tooltip.Positioner {...props} /></Tooltip.Portal></Tooltip.Root>,
    { initialProps: {}, refInstanceof: HTMLDivElement },
  ));
  describe('Popup', () => describeConformance(
    (props: Tooltip.Popup.Props) => <Position><Tooltip.Popup {...props} /></Position>,
    { initialProps: {}, refInstanceof: HTMLDivElement },
  ));
  describe('Arrow', () => describeConformance(
    (props: Tooltip.Arrow.Props) => <Position><Tooltip.Popup><Tooltip.Arrow {...props} /></Tooltip.Popup></Position>,
    { initialProps: {}, refInstanceof: HTMLDivElement },
  ));
  describe('Viewport', () => describeConformance(
    (props: Tooltip.Viewport.Props) => <Position><Tooltip.Popup><Tooltip.Viewport {...props} /></Tooltip.Popup></Position>,
    { initialProps: {}, refInstanceof: HTMLDivElement },
  ));
  it('renders children, arrow accessibility and the resolved side', async () => {
    await render(() => <Fixture root={{ open: true }} positioner={{ side: 'bottom' }} />);
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByTestId('arrow')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('arrow')).toHaveAttribute('data-side', 'bottom');
    expect(screen.getByTestId('arrow')).toHaveAttribute('data-open');
  });
  it('preserves the pinned source accessibility defaults and caller-provided relationships', async () => {
    const view = await renderProps<{ describedBy?: string; popupId?: string; role?: 'tooltip' }>(props =>
      <Fixture root={{ open: true }} trigger={{ 'aria-describedby': props.describedBy }}
        popup={{ id: props.popupId, role: props.role }} />, {});
    const trigger = screen.getByText('Toggle'); const popup = screen.getByTestId('popup');
    expect(trigger).not.toHaveAttribute('aria-describedby');
    expect(trigger).not.toHaveAttribute('aria-controls');
    expect(trigger).not.toHaveAttribute('aria-expanded');
    expect(trigger).not.toHaveAttribute('aria-haspopup');
    expect(popup).not.toHaveAttribute('role'); expect(popup).not.toHaveAttribute('id');
    expect(popup).toHaveAttribute('tabindex', '-1');
    expect(popup).toHaveAttribute('data-base-ui-focusable');
    await view.setProps({ describedBy: 'description', popupId: 'description', role: 'tooltip' });
    expect(screen.getByTestId('popup')).toBe(popup);
    expect(trigger).toHaveAttribute('aria-describedby', 'description');
    expect(popup).toHaveAttribute('role', 'tooltip'); expect(popup).toHaveAttribute('id', 'description');
    view.unmount();
  });
  it('keeps closed content inaccessible only when keepMounted is set', async () => {
    const view = await renderProps((props: { keepMounted: boolean }) => <Fixture portal={{ keepMounted: props.keepMounted }} />, { keepMounted: true });
    expect(screen.getByTestId('popup')).not.toBeVisible();
    expect(screen.getByTestId('positioner')).toHaveAttribute('hidden');
    await view.setProps({ keepMounted: false }); expect(screen.queryByTestId('popup')).toBeNull();
  });
  it('renders content in the current viewport container', async () => {
    await render(() => <Fixture root={{ open: true }} viewport />);
    expect(screen.getByText('Content').closest('[data-current]')).not.toBeNull();
    expect(screen.getByText('Content').closest('[data-current]')!.textContent).toBe('Content');
  });
  it('removes controlled data-popup-open on hover close while retaining popup content', async () => {
    let accept!: (open: boolean) => void;
    const view = await renderProps((props: { open: boolean }) => <Fixture root={{ open: props.open,
      onOpenChange(next, details) {
        if (!next) details.preventUnmountOnClose();
        accept(next);
      } }} trigger={{ delay: 0, closeDelay: 0, style: { 'pointer-events': 'none' } }} />, { open: false });
    accept = next => { void view.setProps({ open: next }); };
    const trigger = screen.getByText('Toggle');
    fireEvent.mouseEnter(trigger); fireEvent.mouseMove(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('data-popup-open'));
    expect(screen.getByText('Content')).toBeInTheDocument();
    fireEvent.mouseLeave(trigger);
    await waitFor(() => expect(trigger).not.toHaveAttribute('data-popup-open'));
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
  it('remounts the current container when the active trigger changes and mirrors instant focus metadata', async () => {
    await render(() => <Tooltip.Root<string>>{state => <>
      <Tooltip.Trigger id="first" payload="First">First trigger</Tooltip.Trigger>
      <Tooltip.Trigger id="second" payload="Second">Second trigger</Tooltip.Trigger>
      <Tooltip.Portal><Tooltip.Positioner><Tooltip.Popup data-testid="popup">
        <Tooltip.Viewport data-testid="viewport"><span>{state.payload}</span></Tooltip.Viewport>
      </Tooltip.Popup></Tooltip.Positioner></Tooltip.Portal>
    </>}</Tooltip.Root>);
    screen.getByText('First trigger').focus(); await settle();
    const first = screen.getByText('First').closest('[data-current]'); expect(first).not.toBeNull();
    screen.getByText('Second trigger').focus(); await settle();
    expect(screen.getByText('Second').closest('[data-current]')).not.toBeNull();
    expect(screen.getByText('Second').closest('[data-current]')).not.toBe(first);
    expect(screen.getByTestId('viewport')).toHaveAttribute('data-instant', 'focus');
  });
  it('respects a custom rendered trigger DOM id and removes open attribute before retained unmount', async () => {
    await render(() => <Fixture trigger={{ delay: 0, render: props => <button {...props} id="custom-button" /> }} root={{ onOpenChange(open, details) { if (!open) details.preventUnmountOnClose(); } }} />);
    const trigger = screen.getByText('Toggle'); expect(trigger.id).toBe('custom-button');
    hover(trigger); await settle(); expect(trigger).toHaveAttribute('data-popup-open');
    const popup = screen.getByTestId('popup'); trigger.click(); await settle();
    expect(trigger).not.toHaveAttribute('data-popup-open'); expect(screen.getByTestId('popup')).toBe(popup);
  });
});
