import { expect, it } from 'vitest';
import { untrack } from 'solid-js';
import { createRenderer, flushMicrotasks } from '../../../test';
import { createFloatingRoot } from '../components/createFloatingRoot';
import { createClientPoint } from './createClientPoint';

it('resets cursor overrides to the live DOM reference and releases them on disposal', async () => {
  const first = document.createElement('button'), second = document.createElement('button');
  const virtual = { getBoundingClientRect: () => new DOMRect(10, 20, 0, 0) };
  let root!: ReturnType<typeof createFloatingRoot>;
  const view = await createRenderer().renderProps<{ enabled: boolean; second: boolean }>((props) => {
    root = createFloatingRoot({ state: { open: false, transitionStatus: undefined,
      get domReferenceElement() { return props.second ? second : first; },
      get referenceElement() { return props.second ? second : first; },
      positionReference: null, floatingElement: null, floatingId: 'cursor' } });
    createClientPoint(root, { get enabled() { return props.enabled; } });
    return <output>{root.state.referenceElement === (props.second ? second : first) ? 'dom' : 'cursor'}</output>;
  }, { enabled: true, second: false });
  root.setPositionReference!(virtual);
  await flushMicrotasks();
  expect(view.getByRole('status')).toHaveTextContent('cursor');
  await view.setProps({ enabled: false });
  expect(untrack(() => root.state.positionReference)).toBe(first);
  await view.setProps({ second: true });
  expect(untrack(() => root.state.positionReference)).toBe(second);
  expect(view.getByRole('status')).toHaveTextContent('dom');
  root.setPositionReference!(virtual);
  await flushMicrotasks();
  view.unmount();
  await flushMicrotasks();
  expect(untrack(() => root.state.positionReference)).toBeNull();
});
