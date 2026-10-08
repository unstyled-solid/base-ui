import { afterEach, beforeEach, describe, expect } from 'vitest';
import { createEffect, createSignal, flush } from 'solid-js';
import { browserCase, createRenderer, fireEvent, waitFor } from '../../../test';
import { Collapsible } from '../index';
import { createCollapsiblePanel } from './createCollapsiblePanel';
import type { TransitionStatus } from '../../internals/createTransitionStatus';

const source = 'packages/react/src/collapsible/panel/CollapsiblePanel.test.tsx';
const deferred = (name: string, run: () => Promise<void>) => browserCase({
  source, case: name, environment: 'browser', issue: 'bsolid-browser',
}, run);
const css = `
  .collapsible-transition { overflow:hidden; height:var(--collapsible-panel-height); transition:height 150ms linear; }
  .collapsible-transition[data-starting-style], .collapsible-transition[data-ending-style] { height:0; }
  @keyframes collapsible-in { from {height:0} to {height:var(--collapsible-panel-height)} }
  @keyframes collapsible-out { from {height:var(--collapsible-panel-height)} to {height:0} }
  .collapsible-keyframe { overflow:hidden; animation-duration:150ms; }
  .collapsible-keyframe[data-open] { animation-name:collapsible-in; }
  .collapsible-keyframe[data-closed] { animation-name:collapsible-out; }
`;

describe('Collapsible real motion', () => {
  const { render, renderProps } = createRenderer();
  const runtime = globalThis as typeof globalThis & { BASE_UI_ANIMATIONS_DISABLED?: boolean };
  let animationsDisabled: boolean | undefined;
  beforeEach(() => {
    animationsDisabled = runtime.BASE_UI_ANIMATIONS_DISABLED;
    runtime.BASE_UI_ANIMATIONS_DISABLED = false;
  });
  afterEach(() => { runtime.BASE_UI_ANIMATIONS_DISABLED = animationsDisabled; });
  deferred('reuses equal layout measurements across close phases but publishes changed layout', async () => {
    const sizes: { height: number | undefined; width: number | undefined }[] = [];
    const view = await renderProps((props: { open: boolean; transitionStatus: TransitionStatus }) => {
      const panel = createCollapsiblePanel({
        get open() { return props.open; },
        get transitionStatus() { return props.transitionStatus; },
        mounted: true, hiddenUntilFound: false, keepMounted: true, id: undefined,
        setMounted() {}, setOpen() {}, onOpenChange() {},
      });
      createEffect(() => ({ height: panel.height, width: panel.width }), (size) => { sizes.push(size); });
      return <div ref={panel.ref} style={{ width: '120px', transition: 'height 10s linear' }}>
        <div data-testid="content" style={{ height: '80px' }} />
      </div>;
    }, { open: true, transitionStatus: 'starting' });
    expect(sizes.at(-1)).toEqual({ height: 80, width: 120 });
    const readsAfterOpen = sizes.length;
    await view.setProps({ open: false });
    // The same pixel size is valid at close request. It is not derived from open.
    expect(sizes).toHaveLength(readsAfterOpen);
    view.getByTestId('content').style.height = '140px';
    await view.setProps({ transitionStatus: 'ending' });
    expect(sizes.at(-1)).toEqual({ height: 140, width: 120 });
    expect(sizes).toHaveLength(readsAfterOpen + 1);
    view.unmount();
  });
  for (const mode of ['transition', 'keyframe']) {
    deferred(`${mode}: repeated clicks measure changed content and return both dimensions to auto`, async () => {
      const view = await render(() => <><style>{css}</style><Collapsible.Root>
        <Collapsible.Trigger>Toggle</Collapsible.Trigger>
        <Collapsible.Panel keepMounted class={`collapsible-${mode}`} data-testid="panel" style={{ width: '120px' }}>
          <div data-testid="content" style={{ height: '80px' }}>Contents</div>
        </Collapsible.Panel>
      </Collapsible.Root></>);
      const panel = view.getByTestId('panel');
      const trigger = view.getByRole('button');
      for (const height of [80, 140, 100]) {
        view.getByTestId('content').style.height = `${height}px`;
        fireEvent.click(trigger); flush();
        expect(view.getByTestId('panel')).toBe(panel);
        expect(panel.style.getPropertyValue('--collapsible-panel-height')).toBe(`${height}px`);
        expect(panel.style.getPropertyValue('--collapsible-panel-width')).toBe('120px');
        await waitFor(() => expect(panel.style.getPropertyValue('--collapsible-panel-height')).toBe('auto'));
        expect(panel.style.getPropertyValue('--collapsible-panel-width')).toBe('auto');
        fireEvent.click(trigger); flush();
        expect(panel.style.getPropertyValue('--collapsible-panel-height')).toBe(`${height}px`);
        expect(panel.style.getPropertyValue('--collapsible-panel-width')).toBe('120px');
        await waitFor(() => expect(panel).toHaveAttribute('hidden'));
        expect(panel.style.getPropertyValue('--collapsible-panel-height')).toBe('auto');
        expect(panel.style.getPropertyValue('--collapsible-panel-width')).toBe('auto');
      }
    });
    deferred(`${mode}: measured close, interrupted exit, late completion and next close`, async () => {
      const view = await render(() => <><style>{css}</style><Collapsible.Root defaultOpen>
        <Collapsible.Trigger>Toggle</Collapsible.Trigger>
        <Collapsible.Panel class={`collapsible-${mode}`} data-testid="panel">
          <div style={{ height: '80px', width: '120px' }}>Contents</div>
        </Collapsible.Panel>
      </Collapsible.Root></>);
      const panel = view.getByTestId('panel');
      const trigger = view.getByRole('button');
      if (mode === 'keyframe') expect(panel.getAnimations()).toHaveLength(0);
      await waitFor(() => expect(panel.style.getPropertyValue('--collapsible-panel-height')).toBe('auto'));
      fireEvent.click(trigger); flush();
      expect(panel.style.getPropertyValue('--collapsible-panel-height')).toMatch(/px$/);
      await waitFor(() => expect(panel).toHaveAttribute('data-ending-style'));
      // Capture the active exit promises before reopening cancels the animations.
      // Reading Animation.finished after cancellation creates a new pending promise.
      const closing = panel.getAnimations().map((animation) => animation.finished.catch(() => {}));
      fireEvent.click(trigger); flush();
      await waitFor(() => expect(panel).not.toHaveAttribute('data-starting-style'));
      await Promise.all(closing);
      expect(view.getByTestId('panel')).toBe(panel);
      expect(panel).toHaveAttribute('data-open');
      fireEvent.click(trigger); flush();
      await waitFor(() => expect(view.queryByTestId('panel')).toBeNull());
    });
    deferred(`${mode}: beforematch suppresses one entrance and restores duration on close`, async () => {
      const view = await render(() => <><style>{css}</style><Collapsible.Root>
        <Collapsible.Trigger>Toggle</Collapsible.Trigger>
        <Collapsible.Panel class={`collapsible-${mode}`} hiddenUntilFound data-testid="panel">
          <div style={{ height: '80px' }}>Contents</div>
        </Collapsible.Panel>
      </Collapsible.Root></>);
      const panel = view.getByTestId('panel');
      fireEvent(panel, new Event('beforematch')); panel.removeAttribute('hidden');
      await waitFor(() => expect(panel).toHaveAttribute('data-open'));
      const duration = () => mode === 'transition' ? getComputedStyle(panel).transitionDuration : getComputedStyle(panel).animationDuration;
      expect(duration()).toBe('0s');
      await view.user.click(view.getByRole('button'));
      expect(duration()).toBe('0.15s');
      await waitFor(() => expect(panel).toHaveAttribute('hidden', 'until-found'));
      fireEvent.click(view.getByRole('button')); flush();
      expect(duration()).toBe('0.15s');
    });
    for (const cancel of [true, false]) {
      deferred(`${mode}: ${cancel ? 'canceled' : 'refused'} beforematch retains next ordinary animation`, async () => {
        const view = await render(() => {
          const [open, setOpen] = createSignal(false);
          return <><style>{css}</style><Collapsible.Root open={open()} onOpenChange={(next, details) => {
            if (details.reason === 'none') { if (cancel) details.cancel(); return; }
            setOpen(next);
          }}>
            <Collapsible.Trigger>Toggle</Collapsible.Trigger>
            <Collapsible.Panel class={`collapsible-${mode}`} hiddenUntilFound data-testid="panel">
              <div style={{ height: '80px' }}>Contents</div>
            </Collapsible.Panel>
          </Collapsible.Root></>;
        });
        const panel = view.getByTestId('panel');
        fireEvent(panel, new Event('beforematch')); panel.removeAttribute('hidden');
        await waitFor(() => expect(panel).toHaveAttribute('hidden', 'until-found'));
        await view.user.click(view.getByRole('button'));
        const styles = getComputedStyle(panel);
        expect(mode === 'transition' ? styles.transitionDuration : styles.animationDuration).toBe('0.15s');
        await waitFor(() => expect(panel.getAnimations().length).toBeGreaterThan(0));
      });
    }
  }
  deferred('preserves inline alignment styles while measuring an opening panel', async () => {
    const view = await render(() => <><style>{css}</style><Collapsible.Root>
      <Collapsible.Trigger>Toggle</Collapsible.Trigger>
      <Collapsible.Panel class="collapsible-transition" keepMounted data-testid="panel" style={{ 'justify-content': 'center', 'align-items': 'end' }}>
        <div style={{ height: '80px' }}>Contents</div>
      </Collapsible.Panel>
    </Collapsible.Root></>);
    const panel = view.getByTestId('panel');
    fireEvent.click(view.getByRole('button')); flush();
    expect(panel).toHaveAttribute('data-starting-style');
    expect(panel.style.justifyContent).toBe('initial');
    await waitFor(() => expect(panel.style.justifyContent).toBe('center'));
    expect(panel.style.alignItems).toBe('end');
  });
  deferred('unmounts a zero-size panel without waiting for unrelated transitions', async () => {
    const view = await render(() => <Collapsible.Root defaultOpen>
      <Collapsible.Trigger>Toggle</Collapsible.Trigger>
      <Collapsible.Panel data-testid="panel" style={{ width: '0', height: '0', overflow: 'hidden', transition: 'opacity 10s linear' }} />
    </Collapsible.Root>);
    await view.user.click(view.getByRole('button'));
    await waitFor(() => expect(view.queryByTestId('panel')).toBeNull());
  });
  deferred('keeps measured dimensions when a late open completion resolves during close', async () => {
    const animation = new Animation(new KeyframeEffect(null, [], 10_000), document.timeline);
    animation.play();
    let watched = false;
    try {
      const view = await render(() => <Collapsible.Root defaultOpen>
        <Collapsible.Trigger>Toggle</Collapsible.Trigger>
        <Collapsible.Panel keepMounted data-testid="panel" style={{ transition: 'height 10s linear' }} ref={(node) => {
          if (node) node.getAnimations = () => {
            if (node.hasAttribute('data-open')) { watched = true; return [animation]; }
            return [];
          };
        }}><div style={{ height: '80px' }}>Contents</div></Collapsible.Panel>
      </Collapsible.Root>);
      await waitFor(() => expect(watched).toBe(true));
      fireEvent.click(view.getByRole('button')); flush();
      animation.finish();
      await Promise.resolve();
      expect(view.getByTestId('panel').style.getPropertyValue('--collapsible-panel-height')).toMatch(/px$/);
    } finally { animation.cancel(); }
  });
  deferred('does not unmount or restart entrance after late exit completion on a reopened panel', async () => {
    const animation = new Animation(new KeyframeEffect(null, [], 10_000), document.timeline);
    animation.play();
    let watched = false;
    try {
      const view = await render(() => <><style>{css}</style><Collapsible.Root defaultOpen>
        <Collapsible.Trigger>Toggle</Collapsible.Trigger>
        <Collapsible.Panel class="collapsible-transition" data-testid="panel" ref={(node) => {
          if (node) node.getAnimations = () => {
            if (node.hasAttribute('data-ending-style')) { watched = true; return [animation]; }
            return [];
          };
        }}><div style={{ height: '80px' }}>Contents</div></Collapsible.Panel>
      </Collapsible.Root></>);
      const panel = view.getByTestId('panel');
      fireEvent.click(view.getByRole('button')); flush();
      await waitFor(() => expect(watched).toBe(true));
      fireEvent.click(view.getByRole('button')); flush();
      await waitFor(() => expect(panel).not.toHaveAttribute('data-starting-style'));
      animation.finish();
      await Promise.resolve();
      expect(view.getByTestId('panel')).toBe(panel);
      expect(panel).toHaveAttribute('data-open');
      expect(panel).not.toHaveAttribute('data-starting-style');
    } finally { animation.cancel(); }
  });
  deferred('reveals find-in-page content in the dispatch task before staged state commits', async () => {
    const view = await render(() => <><style>{css}</style><Collapsible.Root>
      <Collapsible.Panel hiddenUntilFound class="collapsible-transition" data-testid="panel">
        <div style={{ height: '80px' }}>Contents</div>
      </Collapsible.Panel>
    </Collapsible.Root></>);
    const panel = view.getByTestId('panel');
    let height: number | undefined;
    panel.addEventListener('beforematch', () => {
      panel.removeAttribute('hidden');
      height = panel.getBoundingClientRect().height;
    });
    fireEvent(panel, new Event('beforematch'));
    expect(height).toBeGreaterThan(0);
  });
  deferred('applies starting styles while mounting an opening panel and measures both dimensions', async () => {
    const view = await render(() => <><style>{css}</style><Collapsible.Root>
      <Collapsible.Trigger>Toggle</Collapsible.Trigger>
      <Collapsible.Panel class="collapsible-transition" data-testid="panel" style={{ width: '120px' }}>
        <div style={{ height: '80px' }}>Contents</div>
      </Collapsible.Panel>
    </Collapsible.Root></>);
    expect(view.queryByTestId('panel')).toBeNull();
    fireEvent.click(view.getByRole('button')); flush();
    const panel = view.getByTestId('panel');
    expect(panel).toHaveAttribute('data-starting-style');
    expect(panel.style.getPropertyValue('--collapsible-panel-height')).toBe('80px');
    expect(panel.style.getPropertyValue('--collapsible-panel-width')).toBe('120px');
    await waitFor(() => expect(panel.style.getPropertyValue('--collapsible-panel-height')).toBe('auto'));
    expect(panel.style.getPropertyValue('--collapsible-panel-width')).toBe('auto');
  });
  deferred('does not suppress a later animated open after a no-motion beforematch open', async () => {
    const view = await render(() => {
      const [motion, setMotion] = createSignal(false);
      return <><style>{css}</style><button onClick={() => setMotion(true)}>Enable motion</button><Collapsible.Root>
        <Collapsible.Trigger>Toggle</Collapsible.Trigger>
        <Collapsible.Panel class={motion() ? 'collapsible-transition' : undefined} hiddenUntilFound data-testid="panel">
          <div style={{ height: '80px' }}>Contents</div>
        </Collapsible.Panel>
      </Collapsible.Root></>;
    });
    const panel = view.getByTestId('panel');
    fireEvent(panel, new Event('beforematch')); panel.removeAttribute('hidden');
    await waitFor(() => expect(panel).toHaveAttribute('data-open'));
    await view.user.click(view.getByRole('button', { name: 'Toggle' }));
    await waitFor(() => expect(panel).toHaveAttribute('hidden', 'until-found'));
    await view.user.click(view.getByRole('button', { name: 'Enable motion' }));
    fireEvent.click(view.getByRole('button', { name: 'Toggle' })); flush();
    expect(getComputedStyle(panel).transitionDuration).toBe('0.15s');
    await waitFor(() => expect(panel.getAnimations().length).toBeGreaterThan(0));
  });
  deferred('does not leave a hidden transition running after a searchable panel closes', async () => {
    const view = await render(() => <><style>{css}{`
      .collapsible-transition { opacity:1; transition:height 150ms linear, opacity 150ms linear; }
      .collapsible-transition[data-starting-style], .collapsible-transition[data-ending-style] { opacity:0; }
    `}</style><Collapsible.Root>
      <Collapsible.Trigger>Toggle</Collapsible.Trigger>
      <Collapsible.Panel hiddenUntilFound class="collapsible-transition" data-testid="panel">
        <div style={{ height: '80px' }}>Contents</div>
      </Collapsible.Panel>
    </Collapsible.Root></>);
    const panel = view.getByTestId('panel');
    await view.user.click(view.getByRole('button'));
    await waitFor(() => expect(panel.style.getPropertyValue('--collapsible-panel-height')).toBe('auto'));
    await view.user.click(view.getByRole('button'));
    await waitFor(() => expect(panel).toHaveAttribute('hidden', 'until-found'));
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    expect(panel.getAnimations().filter((animation) => animation.playState !== 'finished')).toHaveLength(0);
    expect(getComputedStyle(panel).opacity).toBe('0');
  });
  deferred('refused keyframe beforematch restores the steady closed state without adding starting styles', async () => {
    const view = await render(() => {
      const [open, setOpen] = createSignal(false);
      return <><style>{css}</style><Collapsible.Root open={open()} onOpenChange={(next, details) => {
        if (details.reason !== 'none') setOpen(next);
      }}>
        <Collapsible.Trigger>Toggle</Collapsible.Trigger>
        <Collapsible.Panel hiddenUntilFound class="collapsible-keyframe" data-testid="panel">
          <div style={{ height: '80px' }}>Contents</div>
        </Collapsible.Panel>
      </Collapsible.Root></>;
    });
    const panel = view.getByTestId('panel');
    await view.user.click(view.getByRole('button'));
    await waitFor(() => expect(panel.style.getPropertyValue('--collapsible-panel-height')).toBe('auto'));
    await view.user.click(view.getByRole('button'));
    await waitFor(() => expect(panel).toHaveAttribute('hidden', 'until-found'));
    expect(panel).not.toHaveAttribute('data-starting-style');
    fireEvent(panel, new Event('beforematch')); panel.removeAttribute('hidden');
    await waitFor(() => expect(panel).toHaveAttribute('hidden', 'until-found'));
    expect(panel).not.toHaveAttribute('data-starting-style');
    await view.user.click(view.getByRole('button'));
    expect(getComputedStyle(panel).animationDuration).toBe('0.15s');
    expect(panel.getAnimations().length).toBeGreaterThan(0);
  });
  deferred('animates a reopen after initially open with only entrance keyframes defined', async () => {
    const view = await render(() => <><style>{css}{`
      .collapsible-keyframe[data-closed] { animation-name:none; }
    `}</style><Collapsible.Root defaultOpen>
      <Collapsible.Trigger>Toggle</Collapsible.Trigger>
      <Collapsible.Panel keepMounted class="collapsible-keyframe" data-testid="panel">
        <div style={{ height: '80px' }}>Contents</div>
      </Collapsible.Panel>
    </Collapsible.Root></>);
    const panel = view.getByTestId('panel');
    expect(panel.getAnimations()).toHaveLength(0);
    await view.user.click(view.getByRole('button'));
    await waitFor(() => expect(panel).toHaveAttribute('hidden'));
    await view.user.click(view.getByRole('button'));
    expect(getComputedStyle(panel).animationName).toBe('collapsible-in');
    expect(panel.getAnimations()).toHaveLength(1);
  });
  for (const mode of ['transition', 'keyframe']) {
    deferred(`${mode}: restores authored inline duration when a beforematch open is disposed`, async () => {
      const view = await render(() => <><style>{css}</style><Collapsible.Root>
        <Collapsible.Panel hiddenUntilFound class={`collapsible-${mode}`} data-testid="panel" style={
          mode === 'transition' ? { 'transition-duration': '123ms' } : { 'animation-duration': '123ms' }
        }><div style={{ height: '80px' }}>Contents</div></Collapsible.Panel>
      </Collapsible.Root></>);
      const panel = view.getByTestId('panel');
      const property = mode === 'transition' ? 'transition-duration' : 'animation-duration';
      fireEvent(panel, new Event('beforematch')); panel.removeAttribute('hidden');
      await waitFor(() => expect(panel.style.getPropertyValue(property)).toBe('0s'));
      view.unmount();
      expect(panel.style.getPropertyValue(property)).toBe('123ms');
    });
  }
});
