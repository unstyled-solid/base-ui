import { createSignal, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRenderer, describeConformance, browserCase, waitFor } from '../../../test';
import type { ConformantComponentProps } from '../../../test/describeConformance';
import { CheckboxRoot } from '../root/CheckboxRoot';
import { CheckboxRootContext } from '../root/CheckboxRootContext';
import { CheckboxIndicator, type CheckboxIndicatorProps, type CheckboxIndicatorState } from './CheckboxIndicator';

const rootState = {
  checked: true, disabled: false, readOnly: false, required: false, indeterminate: false,
  dirty: false, touched: false, valid: null, filled: false, focused: false,
};

describe('CheckboxIndicator', () => {
  afterEach(() => { globalThis.BASE_UI_ANIMATIONS_DISABLED = true; });
  const { render, renderProps } = createRenderer();
  describeConformance<CheckboxIndicatorState, ConformantComponentProps<CheckboxIndicatorState>>((props) => <CheckboxRootContext value={rootState}>
    <CheckboxIndicator {...(props as CheckboxIndicatorProps)} />
  </CheckboxRootContext>, { initialProps: {}, refInstanceof: HTMLSpanElement });

  it('requires a root provider', async () => {
    await expect(render(() => <CheckboxIndicator />)).rejects.toThrow();
  });
  it.each([
    { checked: false, indeterminate: false, keepMounted: false, mounted: false },
    { checked: true, indeterminate: false, keepMounted: false, mounted: true },
    { checked: false, indeterminate: true, keepMounted: false, mounted: true },
    { checked: false, indeterminate: false, keepMounted: true, mounted: true },
    { checked: true, indeterminate: false, keepMounted: true, mounted: true },
    { checked: false, indeterminate: true, keepMounted: true, mounted: true },
  ])('mount policy %#', async ({ checked, indeterminate, keepMounted, mounted }) => {
    const view = await render(() => <CheckboxRoot checked={checked} indeterminate={indeterminate}>
      <CheckboxIndicator keepMounted={keepMounted} data-testid="indicator" data-extra="source" />
    </CheckboxRoot>);
    expect(Boolean(view.queryByTestId('indicator'))).toBe(mounted);
    if (mounted) expect(view.getByTestId('indicator')).toHaveAttribute('data-extra', 'source');
  });
  it('keepMounted retains the same host and live callback/class state', async () => {
    let observed!: CheckboxIndicatorState;
    const renderHost = (props: Record<string, unknown>, state: CheckboxIndicatorState) => {
      observed = state;
      return <span {...(props as JSX.HTMLAttributes<HTMLSpanElement>)} />;
    };
    const view = await renderProps((props: { checked: boolean }) => <CheckboxRoot checked={props.checked}>
      <CheckboxIndicator keepMounted data-testid="indicator" render={renderHost} class={(state) => state.checked ? 'checked' : 'unchecked'} />
    </CheckboxRoot>, { checked: true });
    const indicator = view.getByTestId('indicator');
    await view.setProps({ checked: false });
    expect(view.getByTestId('indicator')).toBe(indicator);
    expect(indicator).toHaveClass('unchecked');
    expect(untrack(() => observed.checked)).toBe(false);
  });
  it('current native handler changes without replacing the indicator', async () => {
    const first = vi.fn(); const current = vi.fn();
    const view = await renderProps((props: CheckboxIndicatorProps) => <CheckboxRoot checked><CheckboxIndicator {...props} data-testid="indicator" /></CheckboxRoot>, { onClick: first });
    const indicator = view.getByTestId('indicator');
    await view.setProps({ onClick: current });
    await view.user.click(indicator);
    expect(first).not.toHaveBeenCalled(); expect(current).toHaveBeenCalledTimes(1);
    expect(view.getByTestId('indicator')).toBe(indicator);
  });

  const source = 'packages/react/src/checkbox/indicator/CheckboxIndicator.test.tsx';
  browserCase({ source, case: 'removes indicator with no exit animation', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const view = await renderProps((props: { checked: boolean }) => <CheckboxRoot checked={props.checked}><CheckboxIndicator data-testid="indicator" /></CheckboxRoot>, { checked: true });
    expect(view.getByTestId('indicator')).toBeInTheDocument();
    await view.setProps({ checked: false });
    await waitFor(() => expect(view.queryByTestId('indicator')).toBeNull());
  });
  browserCase({ source, case: 'keepMounted receives animation completion', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    globalThis.BASE_UI_ANIMATIONS_DISABLED = false;
    const finished = vi.fn();
    const view = await renderProps((props: { checked: boolean }) => <>
      <style>{'@keyframes checkbox-exit { to { opacity: 0 } } .checkbox-animation[data-ending-style] { animation: checkbox-exit 30ms; }'}</style>
      <CheckboxRoot checked={props.checked}><CheckboxIndicator keepMounted class="checkbox-animation" data-testid="indicator" onAnimationEnd={finished} /></CheckboxRoot>
    </>, { checked: true });
    expect(view.getByTestId('indicator')).toBeInTheDocument();
    await view.setProps({ checked: false });
    await waitFor(() => expect(finished).toHaveBeenCalledTimes(1));
    expect(view.getByTestId('indicator')).toBeInTheDocument();
  });
  browserCase({ source, case: 'enter transition begins with starting style without querying exit animations', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    globalThis.BASE_UI_ANIMATIONS_DISABLED = false;
    const finished = vi.fn(); const getAnimations = vi.fn((): Animation[] => []);
    const view = await renderProps((props: { checked: boolean }) => <>
      <style>{'.checkbox-enter { transition: opacity 30ms; opacity: 1; } .checkbox-enter[data-starting-style], .checkbox-enter[data-ending-style] { opacity: 0; }'}</style>
      <CheckboxRoot checked={props.checked}><CheckboxIndicator class="checkbox-enter" data-testid="indicator" onTransitionEnd={finished}
        ref={(node) => { if (node) node.getAnimations = getAnimations; }} /></CheckboxRoot>
    </>, { checked: false });
    expect(view.queryByTestId('indicator')).toBeNull();
    await view.setProps({ checked: true });
    await waitFor(() => expect(finished).toHaveBeenCalledTimes(1));
    expect(view.getByTestId('indicator')).toBeInTheDocument(); expect(getAnimations).not.toHaveBeenCalled();
  });
  browserCase({ source, case: 'ending style precedes exit unmount', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    globalThis.BASE_UI_ANIMATIONS_DISABLED = false;
    const view = await renderProps((props: { checked: boolean }) => <>
      <style>{'@keyframes checkbox-exit-retained { to { opacity: 0 } } .checkbox-retained[data-ending-style] { animation: checkbox-exit-retained 100ms; }'}</style>
      <CheckboxRoot checked={props.checked}><CheckboxIndicator class="checkbox-retained" data-testid="indicator" /></CheckboxRoot>
    </>, { checked: true });
    await view.setProps({ checked: false });
    expect(view.getByTestId('indicator')).toHaveAttribute('data-ending-style');
    await waitFor(() => expect(view.queryByTestId('indicator')).toBeNull());
  });
  browserCase({ source, case: 'multiple indicators exit in one DOM commit', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    globalThis.BASE_UI_ANIMATIONS_DISABLED = false;
    const counts: number[] = [];
    const view = await render(() => {
      const [checked, setChecked] = createSignal(true);
      return <>
        <style>{'@keyframes checkbox-batch { to { opacity: 0 } } .checkbox-batch[data-ending-style] { animation: checkbox-batch 30ms; }'}</style>
        <button onClick={() => setChecked(false)}>Uncheck</button>
        {Array.from({ length: 10 }, (_, index) => <CheckboxRoot checked={checked()}><CheckboxIndicator class="checkbox-batch" data-testid={`indicator-${index}`} /></CheckboxRoot>)}
      </>;
    });
    const observer = new MutationObserver(() => counts.push(view.container.querySelectorAll('[data-testid^="indicator-"]').length));
    observer.observe(view.container, { subtree: true, childList: true });
    try {
      await view.user.click(view.getByText('Uncheck'));
      await waitFor(() => expect(view.queryByTestId('indicator-0')).toBeNull());
      expect(view.queryByTestId('indicator-9')).toBeNull();
      expect(counts).toContain(0); expect(counts.every((count) => count === 0 || count === 10)).toBe(true);
    } finally { observer.disconnect(); }
  });
  browserCase({ source, case: 'reopening cancels stale exit completion', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    globalThis.BASE_UI_ANIMATIONS_DISABLED = false;
    const view = await renderProps((props: { checked: boolean }) => <>
      <style>{'@keyframes checkbox-reopen { to { opacity: 0 } } .checkbox-reopen[data-ending-style] { animation: checkbox-reopen 60ms; }'}</style>
      <CheckboxRoot checked={props.checked}><CheckboxIndicator class="checkbox-reopen" data-testid="indicator" /></CheckboxRoot>
    </>, { checked: true });
    const node = view.getByTestId('indicator');
    await view.setProps({ checked: false });
    const exits = node.getAnimations().map((animation) => animation.finished);
    await view.setProps({ checked: true });
    await Promise.allSettled(exits);
    expect(view.getByTestId('indicator')).toBe(node); expect(node).toHaveAttribute('data-checked');
  });
});
