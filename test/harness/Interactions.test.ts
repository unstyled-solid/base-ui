import { describe, it, expect, vi } from 'vitest';
import { createTestInteractions } from '../../packages/solid/test/createTestInteractions';
describe('source interaction test adapter', () => {
  it('calls every handler in source order and returns the first defined result', () => {
    const calls: string[] = [];
    const props = createTestInteractions(() => [
      { reference: { onClick: () => { calls.push('a'); } } },
      { reference: { onClick: () => { calls.push('b'); return 7; } } },
    ]).getReferenceProps({ onClick: () => { calls.push('user'); return 8; } });
    const handler = props.onClick as () => unknown;
    expect(handler()).toBe(7);
    expect(calls).toEqual(['a', 'b', 'user']);
  });
  it('reads replacement callbacks at invocation and ordinary values live', () => {
    let label = 'first';
    const props = createTestInteractions(() => [{ trigger: { title: label, onClick: () => label } }]).getTriggerProps();
    const handler = props.onClick as () => unknown;
    label = 'next';
    expect(props.title).toBe('next');
    expect(handler()).toBe('next');
  });
  it('forwards item state only to the callback and gives floating defaults with user precedence', () => {
    const interactions = createTestInteractions(() => [{ item: (state) => ({ role: state.active ? 'option' : 'row', active: true }) }]);
    const item = interactions.getItemProps({ active: true, selected: true, id: 'item' });
    expect({ ...item }).toEqual({ role: 'option', id: 'item' });
    expect({ ...interactions.getFloatingProps({ tabIndex: 0 }) }).toEqual({ tabIndex: 0, 'data-base-ui-focusable': '' });
  });
  it('merges independent keyboard handlers and ignores undefined user handlers', () => {
    const click = vi.fn();
    const key = vi.fn();
    const props = createTestInteractions(() => [{ reference: { onClick: click, onKeyDown: key } }]).getReferenceProps({ onClick: undefined });
    (props.onClick as () => void)();
    (props.onKeyDown as () => void)();
    expect(click).toHaveBeenCalledTimes(1);
    expect(key).toHaveBeenCalledTimes(1);
    expect(createTestInteractions().getReferenceProps({ onClick: undefined }).onClick).toBeUndefined();
  });
  it('retains non-event on-prefix values and callback return values', () => {
    const onyx = () => 'returned value';
    const props = createTestInteractions().getReferenceProps({ onlyShowVotes: true, onyx });
    expect(props.onlyShowVotes).toBe(true);
    expect(props.onyx).toBe(onyx);
    expect((props.onyx as () => string)()).toBe('returned value');
  });
  it('adds floating defaults and does not call item factories without user input', () => {
    const item = vi.fn(() => ({ role: 'option' }));
    const api = createTestInteractions(() => [{ item }]);
    expect({ ...api.getFloatingProps() }).toEqual({ tabIndex: -1, 'data-base-ui-focusable': '' });
    expect({ ...api.getItemProps() }).toEqual({});
    expect(item).not.toHaveBeenCalled();
  });
});
