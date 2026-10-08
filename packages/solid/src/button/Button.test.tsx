import { createSignal, untrack } from 'solid-js';
import { describe, expect, it, vi } from 'vitest';
import {
  browserCase, createRenderer, describeConformance, fireEvent, sourceCase, waitFor,
} from '../../test';
import type { ConformantComponentProps } from '../../test/describeConformance';
import { Button, ButtonDataAttributes, type ButtonProps, type ButtonState } from './index';

const source = 'packages/react/src/button/Button.test.tsx';
const span: NonNullable<ButtonProps['render']> = (props) => <span {...props} />;
const link: NonNullable<ButtonProps['render']> = (props) => <a {...props} href="#button-target" />;
const { render, renderProps } = createRenderer();

describe('Button', () => {
  // Pinned conformance: propForwarding (6 cases), refForwarding (1),
  // renderProp (7), className (1). The shared Solid adapter combines duplicate
  // JSX/function cases into live callbacks; refs use native callback composition.
  describeConformance<ButtonState, ConformantComponentProps<ButtonState> & { disabled?: boolean }>((props) => <Button {...props} />, {
    initialProps: {}, refInstanceof: HTMLButtonElement, button: true,
    state: {
      change: { disabled: true },
      assert: (state, changed) => expect(untrack(() => state.disabled)).toBe(changed),
      class: (state) => state.disabled ? 'disabled' : 'enabled',
      before: 'enabled', after: 'disabled',
    },
  });

  sourceCase({ source, case: 'custom link element: Space activates the link without scrolling the page', environment: 'jsdom' }, async () => {
    const click = vi.fn();
    const view = await render(() => <Button nativeButton={false} render={link} onClick={click}>Go</Button>);
    const button = view.getByRole('button', { name: 'Go' });
    expect(button.tagName).toBe('A');
    await view.user.tab();
    expect(button).toHaveFocus();
    try {
      expect(fireEvent.keyDown(button, { key: ' ' })).toBe(false);
      expect(click).not.toHaveBeenCalled();
      fireEvent.keyUp(button, { key: ' ' });
      expect(click).toHaveBeenCalledTimes(1);
      await waitFor(() => expect(window.location.hash).toBe('#button-target'));
    } finally {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  });

  sourceCase({ source, case: 'custom element: applies button semantics and dispatches real clicks from keyboard activation', environment: 'jsdom', adaptation: 'render callback explicitly composes the native render handler' }, async () => {
    const click = vi.fn();
    const renderClick = vi.fn();
    const capture = vi.fn();
    const ancestor = vi.fn();
    const view = await render(() => <div onClick={ancestor}>
      <Button nativeButton={false} onClick={click} render={(props) => <span {...props}
        onClick={(event) => {
          renderClick(event);
          const handler = props.onClick;
          if (typeof handler === 'function') handler(event);
          else if (handler) handler[0](handler[1], event);
        }}
      />}>Save</Button>
    </div>);
    const button = view.getByRole('button', { name: 'Save' });
    button.addEventListener('click', capture, true);
    expect(button.tagName).toBe('SPAN');
    expect(button).toHaveAttribute('role', 'button');
    expect(button).toHaveAttribute('tabindex', '0');
    await view.user.tab();
    expect(button).toHaveFocus();
    await view.user.keyboard('[Enter][Space]');
    for (const handler of [click, renderClick, capture, ancestor]) expect(handler).toHaveBeenCalledTimes(2);
    expect(click.mock.calls[0][0]).toBeInstanceOf(MouseEvent);
    button.removeEventListener('click', capture, true);
  });

  sourceCase({ source, case: 'custom element: keyboard activation clicks carry modifier key state', environment: 'jsdom' }, async () => {
    const click = vi.fn();
    const view = await render(() => <Button nativeButton={false} render={span} onClick={click}>Save</Button>);
    await view.user.tab();
    expect(view.getByRole('button')).toHaveFocus();
    await view.user.keyboard('{Shift>}[Enter]{/Shift}');
    expect(click).toHaveBeenCalledTimes(1);
    expect(click.mock.calls[0][0].shiftKey).toBe(true);
  });

  for (const nativeButton of [true, false]) {
    for (const focusableWhenDisabled of [false, true]) {
      const host = nativeButton ? 'native button' : 'custom element';
      const behavior = focusableWhenDisabled ? 'prevents interactions but remains focusable'
        : nativeButton ? 'uses the disabled attribute and is not focusable' : 'applies aria-disabled and is not focusable';
      sourceCase({ source, case: `${host}: ${behavior}`, environment: 'jsdom' }, async () => {
        const click = vi.fn();
        const mouseDown = vi.fn();
        const pointerDown = vi.fn();
        const keyDown = vi.fn();
        const view = await render(() => <Button disabled nativeButton={nativeButton}
          focusableWhenDisabled={focusableWhenDisabled} render={nativeButton ? undefined : span}
          onClick={click} onMouseDown={mouseDown} onPointerDown={pointerDown} onKeyDown={keyDown} />);
        const button = view.getByRole('button');
        expect(button).toHaveAttribute(ButtonDataAttributes.disabled);
        if (nativeButton && !focusableWhenDisabled) {
          expect(button).toHaveAttribute('disabled');
          expect(button).not.toHaveAttribute('aria-disabled');
        } else {
          expect(button).not.toHaveAttribute('disabled');
          expect(button).toHaveAttribute('aria-disabled', 'true');
          expect(button).toHaveAttribute('tabindex', focusableWhenDisabled ? '0' : '-1');
        }
        await view.user.tab();
        if (focusableWhenDisabled) expect(button).toHaveFocus();
        else expect(button).not.toHaveFocus();
        await view.user.click(button);
        await view.user.keyboard('[Space][Enter]');
        for (const handler of [click, mouseDown, pointerDown, keyDown]) expect(handler).not.toHaveBeenCalled();
      });
    }
  }

  sourceCase({ source, case: 'keeps focus and suppresses interactions after becoming disabled', environment: 'jsdom', adaptation: 'Solid signal replaces React useState' }, async () => {
    const click = vi.fn();
    const ref = vi.fn();
    const view = await render(() => {
      const [disabled, setDisabled] = createSignal(false);
      return <Button ref={ref} disabled={disabled()} focusableWhenDisabled onClick={(event) => {
        click(event);
        setDisabled(true);
      }}>Save</Button>;
    });
    const button = view.getByRole('button');
    await view.user.tab();
    expect(button).toHaveFocus();
    await view.user.click(button);
    expect(click).toHaveBeenCalledTimes(1);
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveFocus();
    await view.user.click(button);
    await view.user.keyboard('[Enter][Space]');
    expect(click).toHaveBeenCalledTimes(1);
    expect(button).toHaveFocus();
    expect(view.getByRole('button')).toBe(button);
    expect(ref).toHaveBeenCalledTimes(1);
  });

  browserCase({ source, case: 'native button: allows hover handlers while blocking activation', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const click = vi.fn();
    const mouseMove = vi.fn();
    const view = await render(() => <Button disabled focusableWhenDisabled onClick={click} onMouseMove={mouseMove} />);
    const button = view.getByRole('button');
    expect(button).not.toHaveAttribute('disabled');
    expect(button).toHaveAttribute(ButtonDataAttributes.disabled);
    expect(button).toHaveAttribute('aria-disabled', 'true');
    await view.user.hover(button);
    expect(mouseMove).toHaveBeenCalled();
    await view.user.click(button);
    expect(click).not.toHaveBeenCalled();
  });

  it('preserves native defaults, explicit type, form attributes and filters component-only props', async () => {
    const view = await renderProps((props: ButtonProps) => <Button {...props} />, {});
    const button = view.getByRole('button');
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).not.toHaveAttribute('disabled');
    expect(button).not.toHaveAttribute(ButtonDataAttributes.disabled);
    await view.setProps({ type: 'submit', name: 'action', value: 'save', form: 'form-id', focusableWhenDisabled: true });
    expect(view.getByRole('button')).toBe(button);
    for (const [name, value] of Object.entries({ type: 'submit', name: 'action', value: 'save', form: 'form-id' })) {
      expect(button).toHaveAttribute(name, value);
    }
    for (const prop of ['nativeButton', 'focusableWhenDisabled', 'render']) expect(button).not.toHaveAttribute(prop);
  });

  for (const nativeButton of [true, false]) {
    it(`reads current callbacks and disabled/focusability props (native=${nativeButton})`, async () => {
      const oldClick = vi.fn();
      const nextClick = vi.fn();
      const ref = vi.fn();
      const view = await renderProps<ButtonProps>((props) => <Button {...props} />, {
        nativeButton, render: nativeButton ? undefined : span, ref, onClick: oldClick,
      });
      const button = view.getByRole('button');
      await view.user.click(button);
      await view.setProps({ onClick: nextClick, disabled: true, focusableWhenDisabled: true });
      await view.user.click(button);
      expect(oldClick).toHaveBeenCalledTimes(1);
      expect(nextClick).not.toHaveBeenCalled();
      await view.setProps({ disabled: false, focusableWhenDisabled: false });
      await view.user.click(button);
      expect(nextClick).toHaveBeenCalledTimes(1);
      expect(button).not.toHaveAttribute('aria-disabled', 'true');
      expect(button).not.toHaveAttribute(ButtonDataAttributes.disabled);
      expect(view.getByRole('button')).toBe(button);
      expect(ref).toHaveBeenCalledTimes(1);
    });
  }

  it('custom Enter activates on keydown and Space on keyup, forwarding all modifiers', async () => {
    const click = vi.fn();
    const view = await render(() => <Button nativeButton={false} render={span} onClick={click} />);
    const button = view.getByRole('button');
    const modifiers = { shiftKey: true, ctrlKey: true, altKey: true, metaKey: true };
    fireEvent.keyDown(button, { key: 'Enter', ...modifiers });
    expect(click).toHaveBeenCalledTimes(1);
    expect(click.mock.calls[0][0]).toMatchObject(modifiers);
    fireEvent.keyUp(button, { key: 'Enter' });
    fireEvent.keyDown(button, { key: ' ' });
    expect(click).toHaveBeenCalledTimes(1);
    fireEvent.keyUp(button, { key: ' ', ...modifiers });
    expect(click).toHaveBeenCalledTimes(2);
    expect(click.mock.calls[1][0]).toMatchObject(modifiers);
  });

  for (const prevention of ['preventDefault', 'preventBaseUIHandler'] as const) {
    it(`honors ${prevention} on Enter keydown and Space keyup`, async () => {
      const click = vi.fn();
      const view = await render(() => <Button nativeButton={false} render={span} onClick={click}
        onKeyDown={(event) => event[prevention]()}
        onKeyUp={(event) => event[prevention]()} />);
      const button = view.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });
      fireEvent.keyUp(button, { key: ' ' });
      expect(click).not.toHaveBeenCalled();
    });
  }

  it('uses replacement keyboard callbacks and bound native click handlers', async () => {
    const oldKey = vi.fn();
    const nextKey = vi.fn();
    const click = vi.fn();
    const data = { action: 'save' };
    const view = await renderProps<ButtonProps>((props) => <Button {...props} />, {
      nativeButton: false, render: span, onKeyDown: oldKey,
      onClick: [click, data],
    });
    const button = view.getByRole('button');
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(oldKey).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    expect(click.mock.calls[0][0]).toBe(data);
    await view.setProps({ onKeyDown: (event) => {
      nextKey(event);
      event.preventBaseUIHandler();
    } });
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(oldKey).toHaveBeenCalledTimes(1);
    expect(nextKey).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
  });

  it('does not synthesize activation for keyboard events from descendants', async () => {
    const click = vi.fn();
    const view = await render(() => <Button nativeButton={false} render={span} onClick={click}>
      <span data-testid="child">Child</span>
    </Button>);
    const child = view.getByTestId('child');
    fireEvent.keyDown(child, { key: 'Enter' });
    fireEvent.keyUp(child, { key: ' ' });
    expect(click).not.toHaveBeenCalled();
  });

  for (const focusableWhenDisabled of [false, true]) {
    it(`disabled anchor blocks navigation and callbacks (focusable=${focusableWhenDisabled})`, async () => {
      const click = vi.fn();
      const view = await render(() => <Button nativeButton={false} render={link} disabled
        focusableWhenDisabled={focusableWhenDisabled} onClick={click} />);
      const button = view.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toHaveAttribute('tabindex', focusableWhenDisabled ? '0' : '-1');
      expect(fireEvent.click(button)).toBe(false);
      fireEvent.keyDown(button, { key: 'Enter' });
      fireEvent.keyUp(button, { key: ' ' });
      expect(click).not.toHaveBeenCalled();
    });
  }

  browserCase({ source, case: 'native keyboard timing and submit default action', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const submit = vi.fn();
    const click = vi.fn();
    const view = await render(() => <form onSubmit={(event) => { event.preventDefault(); submit(); }}>
      <Button type="submit" onClick={click}>Submit</Button>
    </form>);
    await view.user.tab();
    await view.user.keyboard('[Enter>]');
    expect(click).toHaveBeenCalledTimes(1);
    expect(submit).toHaveBeenCalledTimes(1);
    await view.user.keyboard('[/Enter][Space>]');
    expect(click).toHaveBeenCalledTimes(1);
    await view.user.keyboard('[/Space]');
    expect(click).toHaveBeenCalledTimes(2);
    expect(submit).toHaveBeenCalledTimes(2);
  });

  browserCase({ source, case: 'anchor Enter remains native and Space activates once on release', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const click = vi.fn((event: MouseEvent) => event.preventDefault());
    const view = await render(() => <Button nativeButton={false} render={link} onClick={click}>Go</Button>);
    await view.user.tab();
    await view.user.keyboard('[Enter]');
    expect(click).toHaveBeenCalledTimes(1);
    await view.user.keyboard('[Space>]');
    expect(click).toHaveBeenCalledTimes(1);
    await view.user.keyboard('[/Space]');
    expect(click).toHaveBeenCalledTimes(2);
  });
});
