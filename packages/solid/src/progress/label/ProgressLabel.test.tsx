// Source: pinned ProgressLabel.test.tsx; required-context errors use the RC13 defaultless context.
import { describe, expect, it } from 'vitest';
import { createRoot, createSignal, Show } from 'solid-js';
import { createRenderer, describeConformance } from '../../../test';
import { Progress } from '../index';
import type { ProgressLabelProps } from './ProgressLabel';
import { useProgressRootContext } from '../root/ProgressRootContext';

describe('Progress.Label', () => {
  const { renderProps, render } = createRenderer();
  describeConformance((props) => <Progress.Root value={40}><Progress.Label {...props as ProgressLabelProps} /></Progress.Root>, {
    initialProps: {}, refInstanceof: HTMLSpanElement,
  });
  it('updates and clears label registration on ID changes and unmount', async () => {
    const view = await renderProps((props: { id?: string; show: boolean }) =>
      <Progress.Root value={40}>{props.show ? <Progress.Label id={props.id}>Upload progress</Progress.Label> : null}</Progress.Root>,
    { id: 'label-a', show: true });
    const root = view.getByRole('progressbar');
    const label = view.getByText('Upload progress');
    expect(root.getAttribute('aria-labelledby')).toBe('label-a');
    await view.setProps({ id: 'label-b' });
    expect(root.getAttribute('aria-labelledby')).toBe('label-b');
    expect(view.getByText('Upload progress')).toBe(label);
    await view.setProps({ id: undefined });
    expect(label.id).toBeTruthy();
    expect(root.getAttribute('aria-labelledby')).toBe(label.id);
    await view.setProps({ show: false });
    expect(root.hasAttribute('aria-labelledby')).toBe(false);
  });
  it('rejects a missing required context', () => {
    expect(() => createRoot((dispose) => {
      try { useProgressRootContext(); } finally { dispose(); }
    })).toThrow();
  });
  it('rejects the actual Label outside its required provider', () => {
    expect(() => createRoot((dispose) => {
      try { Progress.Label({}); } finally { dispose(); }
    })).toThrow('Base UI: ProgressRootContext is missing. Progress parts must be placed within <Progress.Root>.');
  });
  // useRegisteredLabelId guards cleanup against a newer registration.
  it('keeps a newer label registered when an older label unmounts', async () => {
    const view = await render(() => {
      const [older, setOlder] = createSignal(true);
      const [newer, setNewer] = createSignal(false);
      const [id, setId] = createSignal('newer-label');
      return <>
        <Progress.Root value={40}>
          <Show when={older()}><Progress.Label id="older-label">Older label</Progress.Label></Show>
          <Show when={newer()}><Progress.Label id={id()}>Newer label</Progress.Label></Show>
        </Progress.Root>
        <button onClick={() => setNewer(true)}>Add newer</button>
        <button onClick={() => setOlder(false)}>Remove older</button>
        <button onClick={() => setId('renamed-label')}>Rename newer</button>
        <button onClick={() => setNewer(false)}>Remove newer</button>
      </>;
    });
    const root = view.getByRole('progressbar');
    expect(root).toHaveAccessibleName('Older label');
    await view.user.click(view.getByRole('button', { name: 'Add newer' }));
    const newer = view.getByText('Newer label');
    expect(root).toHaveAttribute('aria-labelledby', 'newer-label');
    await view.user.click(view.getByRole('button', { name: 'Remove older' }));
    expect(view.getByText('Newer label')).toBe(newer);
    expect(root).toHaveAttribute('aria-labelledby', 'newer-label');
    expect(root).toHaveAccessibleName('Newer label');
    await view.user.click(view.getByRole('button', { name: 'Rename newer' }));
    expect(view.getByText('Newer label')).toBe(newer);
    expect(root).toHaveAttribute('aria-labelledby', 'renamed-label');
    await view.user.click(view.getByRole('button', { name: 'Remove newer' }));
    expect(root).not.toHaveAttribute('aria-labelledby');
  });
});
