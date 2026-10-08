import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { createRenderer, describeConformance, advanceTimers } from '../../../test';
import { AvatarRoot } from '../root/AvatarRoot';
import { AvatarImage } from '../image/AvatarImage';
import { mockImageLoading } from '../testImage';
import { AvatarFallback } from './AvatarFallback';
import type { AvatarFallbackProps, AvatarFallbackState } from './AvatarFallback';
import type { ConformantComponentProps } from '../../../test/describeConformance';
const Avatar = { Root: AvatarRoot, Fallback: AvatarFallback };

describe('Avatar.Fallback', () => {
  const { render, renderProps } = createRenderer();
  describeConformance<AvatarFallbackState, AvatarFallbackProps & ConformantComponentProps<AvatarFallbackState>>((props) => <Avatar.Root><Avatar.Fallback {...props} /></Avatar.Root>, {
    initialProps: {}, refInstanceof: HTMLSpanElement,
  });

  it('renders without an image and suppresses internal props', async () => {
    const view = await render(() => <Avatar.Root><Avatar.Fallback data-testid="fallback" delay={0}>AC</Avatar.Fallback></Avatar.Root>);
    expect(view.getByText('AC').tagName).toBe('SPAN');
    expect(view.getByText('AC')).not.toHaveAttribute('delay');
    expect(view.getByText('AC')).not.toHaveAttribute('data-image-loading-status');
  });

  it('keeps fallback mounted and image unmounted while a newly supplied image is loading', async () => {
    const mock = mockImageLoading();
    try {
      const view = await renderProps<{ src?: string }>((props) => <Avatar.Root>
        <AvatarImage data-testid="image" src={props.src} />
        <Avatar.Fallback data-testid="fallback">AC</Avatar.Fallback>
      </Avatar.Root>, {});
      expect(view.queryByTestId('image')).toBeNull();
      expect(view.getByTestId('fallback')).toBeInTheDocument();
      await view.setProps({ src: 'avatar.png' });
      expect(view.queryByTestId('image')).toBeNull();
      expect(view.getByTestId('fallback')).toBeInTheDocument();
    } finally { mock.restore(); }
  });

  describe('delay', () => {
    beforeEach(() => { vi.useFakeTimers(); });
    afterEach(() => { vi.useRealTimers(); });
    const mount = (delay?: number) => renderProps((props: { delay?: number }) =>
      <Avatar.Root><Avatar.Fallback delay={props.delay}>AC</Avatar.Fallback></Avatar.Root>, { delay });

    it('waits the specified delay', async () => {
      const view = await mount(100);
      expect(view.queryByText('AC')).toBeNull();
      await advanceTimers(99);
      expect(view.queryByText('AC')).toBeNull();
      await advanceTimers(1);
      expect(view.getByText('AC')).toBeInTheDocument();
      view.unmount();
    });
    for (const delay of [0, undefined]) {
      it(`shows immediately for ${delay} and never re-hides on a positive delay`, async () => {
        const view = await mount(delay);
        const node = view.getByText('AC');
        await view.setProps({ delay: 100 });
        expect(view.getByText('AC')).toBe(node);
        view.unmount();
        expect(vi.getTimerCount()).toBe(0);
      });
      it(`number -> ${delay} -> number cancels pending work and stays visible`, async () => {
        const view = await mount(100);
        expect(view.queryByText('AC')).toBeNull();
        await view.setProps({ delay });
        const node = view.getByText('AC');
        await view.setProps({ delay: 100 });
        expect(view.getByText('AC')).toBe(node);
        view.unmount();
        expect(vi.getTimerCount()).toBe(0);
      });
    }
    it('restarts a pending delay when the duration changes', async () => {
      const view = await mount(100);
      await advanceTimers(50);
      await view.setProps({ delay: 200 });
      await advanceTimers(199);
      expect(view.queryByText('AC')).toBeNull();
      await advanceTimers(1);
      expect(view.getByText('AC')).toBeInTheDocument();
      view.unmount();
    });
    // Source delay regressions use error, not idle. Keep the idle-only native
    // tests above and replay these against an actual source-less Image owner.
    for (const sequence of [[0], [100, 0], [undefined, 100], [100, undefined, 100]] as const) {
      it(`error image preserves fallback for delay sequence ${sequence.map(String).join(' -> ')}`, async () => {
        const view = await renderProps((props: { delay: number | undefined }) => <Avatar.Root
          data-testid="root" class={(state) => state.imageLoadingStatus}>
          <AvatarImage />
          <Avatar.Fallback delay={props.delay}>AC</Avatar.Fallback>
        </Avatar.Root>, { delay: sequence[0] });
        expect(view.getByTestId('root')).toHaveClass('error');
        if (sequence[0] === 100) expect(view.queryByText('AC')).toBeNull();
        else expect(view.getByText('AC')).toBeInTheDocument();
        for (const delay of sequence.slice(1)) {
          await view.setProps({ delay });
          expect(view.getByText('AC')).toBeInTheDocument();
        }
        view.unmount();
        expect(vi.getTimerCount()).toBe(0);
      });
    }
    it('cancels delayed work on disposal', async () => {
      const view = await mount(100);
      view.unmount();
      expect(vi.getTimerCount()).toBe(0);
      await advanceTimers(100);
      expect(view.queryByText('AC')).toBeNull();
    });
    it('lets the delay elapse while loaded and immediately shows fallback on a later error', async () => {
      const mock = mockImageLoading({ cached: true });
      try {
        const view = await renderProps((props: { src?: string }) => <Avatar.Root>
          <AvatarImage src={props.src} alt="Jane Doe" />
          <Avatar.Fallback delay={100}>AC</Avatar.Fallback>
        </Avatar.Root>, { src: 'avatar.png' });
        expect(view.getByRole('img', { name: 'Jane Doe' })).toBeInTheDocument();
        await advanceTimers(100);
        expect(view.queryByText('AC')).toBeNull();
        await view.setProps({ src: undefined });
        expect(view.getByText('AC')).toBeInTheDocument();
        view.unmount();
        expect(vi.getTimerCount()).toBe(0);
      } finally { mock.restore(); }
    });
  });

});
