import { flush } from 'solid-js';
import { describe, expect, it, vi } from 'vitest';
import { createRenderer, fireEvent, advanceTimers } from '../../../test';
import { PartContext } from '../test/context';
import { FilterDropdownInput as Input } from './FilterDropdownInput';
import { FilterDropdownList as List } from '../list/FilterDropdownList';
import { FilterDropdownEmpty as Empty } from '../empty/FilterDropdownEmpty';
import { TestRoot } from '../test/host';
import { INITIAL_LIVE_REGION_TEXT_MUTATION_RESET_DELAY } from '../../internals/createInitialLiveRegionTextMutation';

describe('FilterDropdown native parts', () => {
  const { render, renderProps } = createRenderer();
  it('supplies native searchbox defaults, live active descendant and same-host ID relationships', async () => {
    const view = await renderProps<{ id?: string | null; active?: string }>((props) => <PartContext value="can"><Input activeItemId={props.active} /><List id={props.id} /></PartContext>, { id: undefined, active: undefined });
    const input = view.getByRole('searchbox');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('inputmode', 'search');
    expect(input).toHaveAttribute('autocomplete', 'off');
    expect(input).toHaveAttribute('spellcheck', 'false');
    expect(input).toHaveAttribute('autocorrect', 'off');
    expect(input).toHaveAttribute('autocapitalize', 'none');
    expect(input).toHaveAttribute('aria-controls', 'fixture-list');
    expect(input).not.toHaveAttribute('aria-expanded');
    expect(input).not.toHaveAttribute('aria-autocomplete');
    await view.setProps({ id: 'replacement', active: 'item-2' });
    expect(view.getByRole('searchbox')).toBe(input);
    expect(input).toHaveAttribute('aria-activedescendant', 'item-2');
    expect(input).toHaveAttribute('aria-controls', 'replacement');
    for (const id of ['', null]) { await view.setProps({ id }); expect(input).not.toHaveAttribute('aria-controls'); }
    await view.setProps({ id: undefined, active: '' });
    expect(input).toHaveAttribute('aria-controls', 'fixture-list');
    expect(input).not.toHaveAttribute('aria-activedescendant');
  });
  it('defers non-Android IME commits and supplies the native event with the correct reason', async () => {
    const changed = vi.fn();
    const view = await render(() => <PartContext value="" onValueChange={changed}><Input /></PartContext>);
    const input = view.getByRole('searchbox');
    fireEvent.compositionStart(input);
    fireEvent.input(input, { target: { value: 'か' }, isComposing: true }); flush();
    expect(changed).not.toHaveBeenCalled();
    expect(input).toHaveValue('か');
    fireEvent.compositionEnd(input, { data: 'か' }); flush();
    expect(changed).toHaveBeenLastCalledWith('か', expect.objectContaining({ reason: 'input-change', event: expect.any(CompositionEvent) }));
    fireEvent.input(input, { target: { value: '' } }); flush();
    expect(changed).toHaveBeenLastCalledWith('', expect.objectContaining({ reason: 'input-clear' }));
  });
  it('keeps default prevention independent from Base UI handler prevention and reads fresh callbacks', async () => {
    const first = vi.fn(); const second = vi.fn();
    const view = await renderProps((props: { prevent: boolean; callback: typeof first }) => <PartContext onValueChange={props.callback}><Input onInput={event => { event.preventDefault(); if (props.prevent) event.preventBaseUIHandler(); }} /></PartContext>, { prevent: false, callback: first });
    fireEvent.input(view.getByRole('searchbox'), { target: { value: 'a' } }); flush();
    expect(first).toHaveBeenCalledTimes(1);
    await view.setProps({ callback: second });
    fireEvent.input(view.getByRole('searchbox'), { target: { value: 'b' } }); flush();
    expect(second).toHaveBeenCalledTimes(1);
    await view.setProps({ prevent: true });
    fireEvent.input(view.getByRole('searchbox'), { target: { value: 'c' } }); flush();
    expect(second).toHaveBeenCalledTimes(1);
  });
  it('derives input highlighting from focus and keyboard modality', async () => {
    const view = await renderProps<{ active?: string }>((props) => <PartContext><Input activeItemId={props.active} /></PartContext>, { active: undefined });
    const input = view.getByRole('searchbox');
    input.focus(); flush(); expect(input).toHaveAttribute('data-highlighted');
    fireEvent.keyDown(input, { key: 'ArrowDown' }); flush();
    await view.setProps({ active: 'item' }); expect(input).not.toHaveAttribute('data-highlighted');
    fireEvent.pointerDown(input); flush(); expect(input).toHaveAttribute('data-highlighted');
    input.blur(); flush(); expect(input).not.toHaveAttribute('data-highlighted');
  });
  it('restores a rejected native edit from the current committed value', async () => {
    const changed = vi.fn();
    const view = await render(() => <PartContext value="can" onValueChange={changed}><Input /></PartContext>);
    const input = view.getByRole('searchbox');
    fireEvent.input(input, { target: { value: 'mex' } }); flush();
    expect(changed).toHaveBeenLastCalledWith('mex', expect.objectContaining({ reason: 'input-change' }));
    expect(input).toHaveValue('can');
  });
  it('refocuses only the owning list, not a nested list', async () => {
    const view = await render(() => <PartContext><Input aria-label="parent" /><List data-testid="parent"><PartContext><Input aria-label="child" /><List data-testid="child" /></PartContext></List></PartContext>);
    const child = view.getByLabelText('child');
    child.focus(); view.getByTestId('child').focus(); flush();
    expect(child).toHaveFocus();
  });
  it('announces fresh Empty content without stale restoration and suppresses nonempty content', async () => {
    const view = await renderProps((props: { empty: boolean; message: string }) => <PartContext empty={props.empty}><Empty>{props.message}</Empty></PartContext>, { empty: true, message: 'No matches for zz' });
    const status = view.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite'); expect(status).toHaveAttribute('aria-atomic', 'true');
    await view.setProps({ message: 'No matches for zzq' });
    expect(view.getByRole('status')).toHaveTextContent('No matches for zzq');
    await view.setProps({ empty: false }); expect(view.queryByRole('status')).toBeNull();
  });
  it('forces the initial live-region mutation without restoring an obsolete message', async () => {
    vi.useFakeTimers();
    const view = await renderProps((props: { message: string; empty: boolean }) => <PartContext empty={props.empty}><Empty>{props.message}</Empty></PartContext>, { message: 'No matches for zz', empty: true });
    const status = view.getByRole('status');
    expect(status.textContent).toBe('No matches for zz\u2060');
    await view.setProps({ message: 'No matches for zzq' });
    await advanceTimers(INITIAL_LIVE_REGION_TEXT_MUTATION_RESET_DELAY);
    expect(status.textContent).toBe('No matches for zzq');
    await view.setProps({ empty: false });
    await view.setProps({ empty: true });
    const replacement = view.getByRole('status');
    expect(replacement).not.toBe(status);
    expect(replacement.textContent).toBe('No matches for zzq\u2060');
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
  it('releases the old focus-owner cell when its host replaces it and on disposal', async () => {
    const old = { current: null as HTMLElement | null };
    const replacement = { current: null as HTMLElement | null };
    const view = await renderProps(props => <TestRoot open value="" focusOwnerRef={props.owner}><Input /></TestRoot>, { owner: old });
    const input = view.getByRole('searchbox');
    expect(old.current).toBe(input);
    await view.setProps({ owner: replacement });
    expect(old.current).toBeNull();
    expect(replacement.current).toBe(input);
    view.unmount();
    expect(replacement.current).toBeNull();
  });
});
