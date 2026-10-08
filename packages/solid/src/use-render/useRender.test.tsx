import { describe, expect, it } from 'vitest';
import type { JSX } from '@solidjs/web';
import { createRenderer } from '#test-utils';
import { useRender } from './useRender';

// Source: packages/react/src/use-render/useRender.test.tsx at
// 19511bb171f3b360b006c94cf6d07e53cb446505. Native callbacks replace elements;
// parameter getters retain live props rather than React setup re-execution.
describe('useRender public source contracts', () => {
  const { render, renderProps } = createRenderer();

  it('render props does not overwrite class in a render function when unspecified', async () => {
    const view = await render(() => useRender({
      props: { class: undefined },
      render: (props, state) => <span {...props} class={`my-span ${props.class ?? ''}`} {...state} />,
    }));
    expect(view.container.firstElementChild).toHaveAttribute('class', 'my-span ');
  });

  it('refs are handled as expected', async () => {
    const refs: (HTMLElement | null)[] = [];
    const view = await render(() => useRender({
      ref: [(node) => { refs[0] = node; }, (node) => { refs[1] = node; }],
      render: (props, state) => <span {...props} {...state} />,
    }));
    expect(refs).toHaveLength(2);
    refs.forEach((node) => expect(node).toBe(view.container.firstElementChild));
  });

  it('renders div by default if no defaultTagName and no render params are provided', async () => {
    const view = await render(() => useRender({}));
    expect(view.container.firstElementChild).toHaveProperty('tagName', 'DIV');
  });

  it('renders the element with the default tag with no render prop', async () => {
    const view = await renderProps((props: { tag: keyof JSX.IntrinsicElements }) => useRender({
      get defaultTagName() { return props.tag; },
    }), { tag: 'div' });
    expect(view.container.firstElementChild).toHaveProperty('tagName', 'DIV');
    await view.setProps({ tag: 'span' });
    expect(view.container.firstElementChild).toHaveProperty('tagName', 'SPAN');
  });

  it('defaultTagName is overwritten by the render prop', async () => {
    const view = await renderProps((props: { tag: keyof JSX.IntrinsicElements }) => useRender({
      get defaultTagName() { return props.tag; },
      render: (hostProps) => <span {...hostProps} />,
    }), { tag: 'div' });
    expect(view.container.firstElementChild).toHaveProperty('tagName', 'SPAN');
    await view.setProps({ tag: 'a' });
    expect(view.container.firstElementChild).toHaveProperty('tagName', 'SPAN');
  });

  it('converts state to data attributes automatically', async () => {
    const view = await render(() => useRender({
      render: (props) => <button type="button" {...props} />,
      state: { active: true, index: 42 },
    }));
    expect(view.container.firstElementChild).toHaveAttribute('data-active', '');
    expect(view.container.firstElementChild).toHaveAttribute('data-index', '42');
  });

  it('handles undefined values in state', async () => {
    const view = await render(() => useRender({
      render: (props) => <div {...props} />,
      state: { defined: 'value', notDefined: undefined },
    }));
    expect(view.container.firstElementChild).toHaveAttribute('data-defined', 'value');
    expect(view.container.firstElementChild).not.toHaveAttribute('data-notdefined');
  });

  it('merges state-based data attributes with existing props', async () => {
    const view = await render(() => useRender({
      render: (props) => <button type="button" {...props} />,
      state: { form: 'login' },
      props: { class: 'btn-primary', id: 'submit-btn', 'data-existing': 'prop' },
    }));
    const button = view.container.firstElementChild;
    expect(button).toHaveAttribute('data-form', 'login');
    expect(button).toHaveAttribute('class', 'btn-primary');
    expect(button).toHaveAttribute('id', 'submit-btn');
    expect(button).toHaveAttribute('data-existing', 'prop');
  });

  it('props override state-based data attributes', async () => {
    const view = await render(() => useRender({
      render: (props) => <button type="button" {...props} />,
      state: { active: true },
      props: { 'data-active': 'false' },
    }));
    expect(view.container.firstElementChild).toHaveAttribute('data-active', 'false');
  });

  it('handles empty state', async () => {
    const view = await render(() => useRender({
      render: (props) => <span {...props} />,
      state: {},
      props: { class: 'test-class' },
    }));
    const span = view.container.firstElementChild;
    expect(span).toHaveAttribute('class', 'test-class');
    expect(Array.from(span?.attributes ?? [], (attr) => attr.name).filter((name) => name.startsWith('data-'))).toEqual([]);
  });

  it('handles undefined state', async () => {
    const view = await render(() => useRender({
      render: (props) => <div {...props} />,
      state: undefined,
      props: { class: 'test-class', 'data-from-props': 'value' },
    }));
    expect(view.container.firstElementChild).toHaveAttribute('class', 'test-class');
    expect(view.container.firstElementChild).toHaveAttribute('data-from-props', 'value');
  });

  it('converts boolean values in state to data attributes', async () => {
    const view = await render(() => useRender({
      render: (props) => <button type="button" {...props} />,
      state: { active: true, disabled: false },
    }));
    expect(view.container.firstElementChild).toHaveAttribute('data-active', '');
    expect(view.container.firstElementChild).not.toHaveAttribute('data-disabled');
  });

  it('converts number values in state to data attributes', async () => {
    const view = await render(() => useRender({
      render: (props) => <div {...props} />,
      state: { count: 0, index: 42, percentage: 99.9 },
    }));
    expect(view.container.firstElementChild).not.toHaveAttribute('data-count');
    expect(view.container.firstElementChild).toHaveAttribute('data-index', '42');
    expect(view.container.firstElementChild).toHaveAttribute('data-percentage', '99.9');
  });

  it('supports custom stateAttributesMapping for kebab-case conversion', async () => {
    const view = await render(() => useRender({
      render: (props) => <button type="button" {...props} />,
      state: { isActive: true, itemCount: 5, userName: 'John' },
      stateAttributesMapping: {
        isActive: (value) => value ? { 'data-is-active': '' } : null,
        itemCount: (value) => ({ 'data-item-count': value.toString() }),
        userName: (value) => ({ 'data-user-name': value }),
      },
    }));
    expect(view.container.firstElementChild).toHaveAttribute('data-is-active', '');
    expect(view.container.firstElementChild).toHaveAttribute('data-item-count', '5');
    expect(view.container.firstElementChild).toHaveAttribute('data-user-name', 'John');
  });
});
