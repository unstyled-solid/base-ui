import { createSignal, onCleanup } from 'solid-js';
import { describe, expect, it, vi } from 'vitest';
import { browserCase, createRenderer, fireEvent } from '../../test';
import { CompositeRootContext } from '../internals/composite/root/CompositeRootContext';
import { Button, type ButtonProps } from './index';

const source = 'packages/react/src/internals/use-button/useButton.test.tsx';
const span: NonNullable<ButtonProps['render']> = (props) => <span {...props} />;
const { render, renderProps } = createRenderer();
// Supply the actual activation context without constructing unrelated composite registries.
const composite = {
  highlightedIndex: 0, highlightItemOnHover: false,
  onHighlightedIndexChange() {}, relayKeyboardEvent() {},
};

describe('Button source-first review', () => {
  for (const customized of [false, true]) {
    it(`preserves owned children across state/style/callback updates (custom=${customized})`, async () => {
      const attach = vi.fn();
      const dispose = vi.fn();
      function Child() {
        onCleanup(dispose);
        return <span ref={attach} tabindex={0} data-testid="child">Save</span>;
      }
      const view = await renderProps<ButtonProps>((props) => <Button {...props}><Child /></Button>, {
        nativeButton: !customized, render: customized ? span : undefined,
        focusableWhenDisabled: true,
      });
      const button = view.getByRole('button');
      const child = view.getByTestId('child');
      child.focus();
      expect(child).toHaveFocus();
      await view.setProps({ disabled: true, class: 'disabled', style: { color: 'red' }, onClick: vi.fn(() => {}) });
      expect(view.getByRole('button')).toBe(button);
      expect(view.getByTestId('child')).toBe(child);
      expect(child).toHaveFocus();
      expect(attach).toHaveBeenCalledTimes(1);
      expect(dispose).not.toHaveBeenCalled();
      await view.setProps({ disabled: false, class: 'enabled', style: { color: 'green' } });
      expect(view.getByTestId('child')).toBe(child);
      expect(attach).toHaveBeenCalledTimes(1);
      view.unmount();
      expect(dispose).toHaveBeenCalledTimes(1);
    });
  }

  for (const nativeButton of [true, false]) {
    it(`enabled semantics retain source attribute presence (native=${nativeButton})`, async () => {
      const view = await renderProps<ButtonProps>((props) => <Button {...props} />, {
        nativeButton, render: nativeButton ? undefined : span,
      });
      const button = view.getByRole('button');
      expect(button).not.toHaveAttribute('data-disabled');
      expect(button).not.toHaveAttribute('disabled');
      expect(button).not.toHaveAttribute('aria-disabled');
      if (nativeButton) expect(button).toHaveAttribute('type', 'button');
      else expect(button).not.toHaveAttribute('type');
      await view.setProps({ focusableWhenDisabled: true });
      if (nativeButton) expect(button).toHaveAttribute('aria-disabled', 'false');
      else expect(button).not.toHaveAttribute('aria-disabled');
      expect(view.getByRole('button')).toBe(button);
    });

    it(`focusable-disabled permits focus/blur and Tab, cancels other keys and pointer/click defaults (native=${nativeButton})`, async () => {
      const focus = vi.fn();
      const blur = vi.fn();
      const activation = vi.fn();
      const view = await render(() => <>
        <Button disabled focusableWhenDisabled nativeButton={nativeButton}
          render={nativeButton ? undefined : span}
          onFocus={focus} onBlur={blur} onClick={activation} onPointerDown={activation}
          onMouseDown={activation} onKeyDown={activation} onKeyUp={activation}>Save</Button>
        <button>Next</button>
      </>);
      const button = view.getByRole('button', { name: 'Save' });
      await view.user.tab();
      expect(button).toHaveFocus();
      expect(focus).toHaveBeenCalledTimes(1);
      for (const key of ['Enter', ' ', 'ArrowDown']) {
        expect(fireEvent.keyDown(button, { key })).toBe(false);
        fireEvent.keyUp(button, { key });
      }
      expect(fireEvent.keyDown(button, { key: 'Tab' })).toBe(true);
      expect(fireEvent.pointerDown(button)).toBe(false);
      expect(fireEvent.click(button)).toBe(false);
      fireEvent.mouseDown(button);
      expect(activation).not.toHaveBeenCalled();
      await view.user.tab();
      expect(view.getByRole('button', { name: 'Next' })).toHaveFocus();
      expect(blur).toHaveBeenCalledTimes(1);
    });

    it(`reads live tabIndex and explicit undefined without remounting (native=${nativeButton})`, async () => {
      const view = await renderProps<ButtonProps>((props) => <Button {...props} />, {
        nativeButton, render: nativeButton ? undefined : span, tabindex: 3,
      });
      const button = view.getByRole('button');
      expect(button).toHaveAttribute('tabindex', '3');
      await view.setProps({ tabindex: -1 });
      expect(button).toHaveAttribute('tabindex', '-1');
      await view.setProps({ tabindex: undefined });
      expect(button).not.toHaveAttribute('tabindex');
      expect(view.getByRole('button')).toBe(button);
    });
  }

  it('leaves native keyboard default actions to the platform without synthetic clicks', async () => {
    const calls: string[] = [];
    const view = await render(() => <Button onClick={() => calls.push('click')}
      onKeyDown={() => calls.push('keydown')} onKeyUp={() => calls.push('keyup')} />);
    const button = view.getByRole('button');
    for (const key of ['Enter', ' ']) {
      expect(fireEvent.keyDown(button, { key })).toBe(true);
      expect(fireEvent.keyUp(button, { key })).toBe(true);
    }
    expect(calls).toEqual(['keydown', 'keyup', 'keydown', 'keyup']);
  });

  for (const key of ['Enter', ' ']) {
    it(`custom ${JSON.stringify(key)} preserves keyboard/capture/render/consumer/bubble order and native event targets`, async () => {
      const calls: string[] = [];
      let button!: HTMLElement;
      const view = await render(() => <div onClick={(event) => {
        expect(event.target).toBe(button);
        calls.push('ancestor');
      }}>
        <Button nativeButton={false}
          onKeyDown={() => calls.push('keydown')} onKeyUp={() => calls.push('keyup')}
          onClick={(event) => {
            expect(event).toBeInstanceOf(MouseEvent);
            expect(event.currentTarget).toBe(button);
            expect(event.target).toBe(button);
            calls.push('consumer');
          }} render={(props) => <span {...props} onClick={(event) => {
            calls.push('render');
            const handler = props.onClick;
            if (typeof handler === 'function') handler(event);
            else if (handler) handler[0](handler[1], event);
          }} />} />
      </div>);
      button = view.getByRole('button');
      button.addEventListener('click', () => calls.push('capture'), true);
      fireEvent.keyDown(button, { key });
      expect(calls).toEqual(key === 'Enter' ? ['keydown', 'capture', 'render', 'consumer', 'ancestor'] : ['keydown']);
      fireEvent.keyUp(button, { key });
      expect(calls).toEqual(key === 'Enter'
        ? ['keydown', 'capture', 'render', 'consumer', 'ancestor', 'keyup']
        : ['keydown', 'keyup', 'capture', 'render', 'consumer', 'ancestor']);
    });
  }

  it('matches the source non-native Space limitation: canceled keydown does not cancel a later keyup', async () => {
    const click = vi.fn();
    const view = await render(() => <Button nativeButton={false} render={span}
      onKeyDown={(event) => event.preventDefault()} onClick={click} />);
    const button = view.getByRole('button');
    expect(fireEvent.keyDown(button, { key: ' ' })).toBe(false);
    expect(click).not.toHaveBeenCalled();
    fireEvent.keyUp(button, { key: ' ' });
    expect(click).toHaveBeenCalledTimes(1);
    fireEvent.keyUp(button, { key: ' ' });
    expect(click).toHaveBeenCalledTimes(2);
  });

  it('reads current href: links leave Enter native; anchors without href synthesize Enter', async () => {
    const click = vi.fn((event: MouseEvent) => event.preventDefault());
    let setHref!: (value: string | undefined) => void;
    const view = await render(() => {
      const [href, update] = createSignal<string | undefined>('#target');
      setHref = update;
      return <Button nativeButton={false} onClick={click} render={(props) => <a {...props} href={href()} />} />;
    });
    const button = view.getByRole('button');
    expect(fireEvent.keyDown(button, { key: 'Enter' })).toBe(true);
    expect(click).not.toHaveBeenCalled();
    expect(fireEvent.keyDown(button, { key: ' ' })).toBe(false);
    fireEvent.keyUp(button, { key: ' ' });
    expect(click).toHaveBeenCalledTimes(1);
    setHref(undefined);
    await Promise.resolve();
    expect(button).not.toHaveAttribute('href');
    expect(fireEvent.keyDown(button, { key: 'Enter' })).toBe(false);
    expect(click).toHaveBeenCalledTimes(2);
    expect(view.getByRole('button')).toBe(button);
  });

  it('forwards defaultPrevented clicks without treating them as Base UI cancellation', async () => {
    const click = vi.fn();
    const view = await render(() => <Button nativeButton={false} render={span} onClick={click} />);
    const button = view.getByRole('button');
    button.addEventListener('click', (event) => event.preventDefault(), true);
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(click).toHaveBeenCalledTimes(1);
    expect(click.mock.calls[0][0].defaultPrevented).toBe(true);
  });

  it('replaces Space keyup callbacks, including bound handlers, on the same host', async () => {
    const oldKey = vi.fn();
    const nextKey = vi.fn((_data: object, event: KeyboardEvent & { preventBaseUIHandler(): void }) => event.preventBaseUIHandler());
    const data = {};
    const click = vi.fn();
    const view = await renderProps<ButtonProps>((props) => <Button {...props} />, {
      nativeButton: false, render: span, onKeyUp: oldKey, onClick: click,
    });
    const button = view.getByRole('button');
    fireEvent.keyUp(button, { key: ' ' });
    expect(click).toHaveBeenCalledTimes(1);
    await view.setProps({ onKeyUp: [nextKey, data] });
    fireEvent.keyUp(button, { key: ' ' });
    expect(oldKey).toHaveBeenCalledTimes(1);
    expect(nextKey).toHaveBeenCalledTimes(1);
    expect(nextKey.mock.calls[0][0]).toBe(data);
    expect(click).toHaveBeenCalledTimes(1);
    expect(view.getByRole('button')).toBe(button);
  });

  for (const nativeButton of [true, false]) {
    it(`inherits composite Space keydown activation, modifiers and no duplicate keyup (native=${nativeButton})`, async () => {
      const calls: string[] = [];
      const modifiers = { shiftKey: true, ctrlKey: true, altKey: true, metaKey: true };
      const view = await render(() => <CompositeRootContext value={composite}>
        <Button nativeButton={nativeButton} render={nativeButton ? undefined : span} tabindex={0}
          onKeyDown={() => calls.push('keydown')} onKeyUp={() => calls.push('keyup')}
          onClick={(event) => { expect(event).toMatchObject(modifiers); calls.push('click'); }} />
      </CompositeRootContext>);
      const button = view.getByRole('button');
      expect(fireEvent.keyDown(button, { key: ' ', ...modifiers })).toBe(false);
      expect(calls).toEqual(['keydown', 'click']);
      fireEvent.keyUp(button, { key: ' ', ...modifiers });
      expect(calls).toEqual(['keydown', 'click', 'keyup']);
    });
  }

  for (const role of ['menuitem', 'menuitemcheckbox', 'option', 'gridcell', 'switch'] as const) {
    it(`inherits composite text-navigation prevention for role=${role}`, async () => {
      const click = vi.fn();
      const view = await render(() => <CompositeRootContext value={composite}>
        <Button nativeButton={false} render={span} role={role} tabindex={0}
          onKeyDown={(event) => event.preventDefault()} onClick={click} />
      </CompositeRootContext>);
      fireEvent.keyDown(view.getByRole(role), { key: ' ' });
      expect(click).toHaveBeenCalledTimes(role === 'switch' ? 1 : 0);
    });
  }

  it('composite links activate Space on keydown, leave Enter native and respect Base UI cancellation', async () => {
    const click = vi.fn((event: MouseEvent) => event.preventDefault());
    const view = await renderProps<ButtonProps>((props) => <CompositeRootContext value={composite}>
      <Button {...props} nativeButton={false} render={(host) => <a {...host} href="#target" />} />
    </CompositeRootContext>, { onClick: click, tabindex: 0 });
    const button = view.getByRole('button');
    expect(fireEvent.keyDown(button, { key: 'Enter' })).toBe(true);
    expect(click).not.toHaveBeenCalled();
    expect(fireEvent.keyDown(button, { key: ' ' })).toBe(false);
    expect(click).toHaveBeenCalledTimes(1);
    fireEvent.keyUp(button, { key: ' ' });
    expect(click).toHaveBeenCalledTimes(1);
    await view.setProps({ onKeyDown: (event) => event.preventBaseUIHandler() });
    expect(fireEvent.keyDown(button, { key: ' ' })).toBe(true);
    expect(click).toHaveBeenCalledTimes(1);
  });

  it('nested non-native Button render composition emits one click per activation', async () => {
    const click = vi.fn();
    const view = await render(() => <CompositeRootContext value={composite}>
      <Button nativeButton={false} onClick={click} tabindex={0}
        render={(props) => <Button {...props} nativeButton={false} render={span} />} />
    </CompositeRootContext>);
    const button = view.getByRole('button');
    await view.user.tab();
    expect(button).toHaveFocus();
    await view.user.keyboard('[Space]');
    expect(click).toHaveBeenCalledTimes(1);
    await view.user.keyboard('[Enter]');
    expect(click).toHaveBeenCalledTimes(2);
    expect(view.getAllByRole('button')).toHaveLength(1);
  });

  for (const type of ['submit', 'reset'] as const) {
    it(`composite native Space preserves ${type} default action exactly once`, async () => {
      const action = vi.fn((event: Event) => event.preventDefault());
      const view = await render(() => <CompositeRootContext value={composite}>
        <form onSubmit={action} onReset={action}>
          <Button type={type} />
        </form>
      </CompositeRootContext>);
      const button = view.getByRole('button');
      expect(fireEvent.keyDown(button, { key: ' ' })).toBe(false);
      expect(action).toHaveBeenCalledTimes(1);
      expect(action.mock.calls[0][0].type).toBe(type);
      expect(fireEvent.keyUp(button, { key: ' ' })).toBe(false);
      expect(action).toHaveBeenCalledTimes(1);
    });
  }

  it('forwards getter-backed props without changing their original receiver', async () => {
    const initial: ButtonProps = {
      name: 'first',
      get title() { return this.name; },
    };
    const next: ButtonProps = {
      name: 'second',
      get title() { return this.name; },
    };
    const view = await renderProps<ButtonProps>((props) => <Button {...props} />, initial);
    const button = view.getByRole('button');
    expect(button).toHaveAttribute('title', 'first');
    await view.setProps(next);
    expect(button).toHaveAttribute('title', 'second');
    expect(view.getByRole('button')).toBe(button);
  });

  for (const type of ['button', 'submit', 'reset'] as const) {
    it(`preserves native form default action and submitter projection (type=${type})`, async () => {
      const submit = vi.fn((event: SubmitEvent) => event.preventDefault());
      const reset = vi.fn();
      const view = await render(() => <form onSubmit={submit} onReset={reset}>
        <input aria-label="Value" name="value" value="initial" />
        <Button type={type} name="action" value="save">Action</Button>
      </form>);
      const input = view.getByRole('textbox') as HTMLInputElement;
      await view.user.clear(input);
      await view.user.type(input, 'edited');
      const button = view.getByRole('button');
      await view.user.click(button);
      expect(submit).toHaveBeenCalledTimes(type === 'submit' ? 1 : 0);
      expect(reset).toHaveBeenCalledTimes(type === 'reset' ? 1 : 0);
      expect(input.value).toBe(type === 'reset' ? 'initial' : 'edited');
      if (type === 'submit') {
        expect(submit.mock.calls[0][0].submitter).toBe(button);
        const form = button.closest('form')!;
        expect(new FormData(form, button).get('action')).toBe('save');
        expect(new FormData(form).has('action')).toBe(false);
      }
    });
  }

  for (const focusableWhenDisabled of [false, true]) {
    it(`disabled native submit never submits (focusable=${focusableWhenDisabled})`, async () => {
      const submit = vi.fn((event: Event) => event.preventDefault());
      const view = await render(() => <form onSubmit={submit}>
        <Button disabled focusableWhenDisabled={focusableWhenDisabled} type="submit" />
      </form>);
      await view.user.click(view.getByRole('button'));
      await view.user.tab();
      await view.user.keyboard('[Enter][Space]');
      expect(submit).not.toHaveBeenCalled();
    });
  }

  it('form association forwards to an external form and explicit undefined masks native type default', async () => {
    const submit = vi.fn((event: Event) => event.preventDefault());
    const view = await renderProps((props: ButtonProps) => <>
      <form id="button-review-form" onSubmit={submit} />
      <Button {...props} form="button-review-form" />
    </>, {});
    const button = view.getByRole('button');
    await view.user.click(button);
    expect(submit).not.toHaveBeenCalled();
    await view.setProps({ type: undefined });
    expect(button).not.toHaveAttribute('type');
    await view.user.click(button);
    expect(submit).toHaveBeenCalledTimes(1);
    expect(view.getByRole('button')).toBe(button);
  });

  it('keeps live render state/class/style and attaches replacement refs to the raw host once', async () => {
    const oldRef = vi.fn();
    const nextRef = vi.fn();
    const renderRef = vi.fn();
    const renderer = vi.fn((props: Parameters<NonNullable<ButtonProps['render']>>[0], state: Button.State) =>
      <span {...props} ref={[props.ref, renderRef]} data-render-disabled={String(state.disabled)} />);
    const view = await renderProps<ButtonProps>((props) => <Button {...props} />, {
      nativeButton: false, render: renderer, ref: [oldRef],
      class: (state) => ['base', { disabled: state.disabled }],
      style: (state) => ({ opacity: state.disabled ? 0.5 : 1 }),
    });
    const button = view.getByRole('button');
    await view.user.tab();
    await view.setProps({ disabled: true, focusableWhenDisabled: true, ref: [nextRef] });
    expect(view.getByRole('button')).toBe(button);
    expect(button).toHaveFocus();
    expect(button).toHaveAttribute('data-render-disabled', 'true');
    expect(button).toHaveClass('base', 'disabled');
    expect(button.style.opacity).toBe('0.5');
    expect(renderer).toHaveBeenCalledTimes(1);
    expect(oldRef.mock.calls).toEqual([[button], [null]]);
    expect(nextRef).toHaveBeenCalledExactlyOnceWith(button);
    expect(renderRef).toHaveBeenCalledExactlyOnceWith(button);
  });

  it('replaces an actual render target and updates the shared button ref without stale host activation', async () => {
    const ref = vi.fn();
    const click = vi.fn();
    const view = await renderProps<ButtonProps>((props) => <Button {...props} />, { ref, onClick: click });
    const native = view.getByRole('button');
    await view.setProps({ nativeButton: false, render: span });
    const custom = view.getByRole('button');
    expect(custom.tagName).toBe('SPAN');
    expect(custom).not.toBe(native);
    expect(native.isConnected).toBe(false);
    expect(ref.mock.calls).toEqual([[native], [null], [custom]]);
    fireEvent.keyDown(custom, { key: 'Enter' });
    expect(click).toHaveBeenCalledTimes(1);
    expect(view.getAllByRole('button')).toHaveLength(1);
  });

  browserCase({ source, case: 'can be activated with Enter when the keyboard event originates inside a shadow root', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const click = vi.fn();
    const view = await render(() => <Button nativeButton={false} render={span} onClick={click}
      ref={(host) => {
        if (!host) return;
        const shadow = host.attachShadow({ mode: 'open' });
        const child = host.ownerDocument.createElement('span');
        child.tabIndex = 0;
        shadow.appendChild(child);
      }} />);
    const host = view.getByRole('button');
    const child = host.shadowRoot!.querySelector('span')!;
    child.focus();
    child.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true }));
    expect(click).toHaveBeenCalledTimes(1);
  });

  for (const prevention of ['preventDefault', 'preventBaseUIHandler'] as const) {
    browserCase({ source, case: `native keyboard default vs Base UI cancellation (${prevention})`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
      const click = vi.fn();
      const view = await render(() => <Button onClick={click}
        onKeyDown={(event) => event[prevention]()} onKeyUp={(event) => event[prevention]()} />);
      await view.user.tab();
      await view.user.keyboard('[Enter][Space]');
      expect(click).toHaveBeenCalledTimes(prevention === 'preventDefault' ? 0 : 2);
    });
  }
});
