import { describe, expect, it, vi } from 'vitest';
import type { ComponentProps, JSX } from '@solidjs/web';
import { createRenderer } from '../../test/createRenderer';
import { waitFor } from '@testing-library/dom';
import { ScrollArea } from './index';
import { dimensions } from './ScrollArea.fixture';
import { describeConformance } from '../../test/describeConformance';

interface HostProps {
  'data-testid'?: string;
  title?: string;
  class?: JSX.ClassValue;
  style?: JSX.CSSProperties;
  ref?: (node: HTMLDivElement) => void;
  onClick?: (event: MouseEvent) => void;
  render?: (props: ComponentProps<'div'>) => JSX.Element;
}
/** Pinned generated conformance cases, adapted to native refs/classes and live callback hosts. */
describe('ScrollArea all-part conformance', () => {
  describe('Root generated source conformance', () => describeConformance(
    (props: ComponentProps<typeof ScrollArea.Root>) => <ScrollArea.Root {...props} />,
    { initialProps: {}, refInstanceof: HTMLDivElement },
  ));
  describe('Viewport generated source conformance', () => describeConformance(
    (props: ComponentProps<typeof ScrollArea.Viewport>) => <ScrollArea.Root><ScrollArea.Viewport {...props} /></ScrollArea.Root>,
    { initialProps: {}, refInstanceof: HTMLDivElement },
  ));
  describe('Content generated source conformance', () => describeConformance(
    (props: ComponentProps<typeof ScrollArea.Content>) => <ScrollArea.Root><ScrollArea.Viewport><ScrollArea.Content {...props} /></ScrollArea.Viewport></ScrollArea.Root>,
    { initialProps: {}, refInstanceof: HTMLDivElement },
  ));
  describe('Scrollbar generated source conformance', () => describeConformance<ScrollArea.Scrollbar.State, ScrollArea.Scrollbar.Props, HTMLDivElement>(
    (props: ComponentProps<typeof ScrollArea.Scrollbar>) => <ScrollArea.Root><ScrollArea.Scrollbar {...props} /></ScrollArea.Root>,
    { initialProps: { keepMounted: true }, refInstanceof: HTMLDivElement },
  ));
  describe('Thumb generated source conformance', () => describeConformance(
    (props: ComponentProps<typeof ScrollArea.Thumb>) => <ScrollArea.Root><ScrollArea.Scrollbar keepMounted><ScrollArea.Thumb {...props} /></ScrollArea.Scrollbar></ScrollArea.Root>,
    { initialProps: {}, refInstanceof: HTMLDivElement },
  ));
  describe('Corner generated source conformance', () => describeConformance(
    (props: ComponentProps<typeof ScrollArea.Corner>) => <ScrollArea.Root>
      <ScrollArea.Viewport ref={(node) => dimensions(node, { clientWidth: 100, clientHeight: 100, scrollWidth: 1000, scrollHeight: 1000 })} />
      <ScrollArea.Scrollbar keepMounted style={{ width: '10px' }} />
      <ScrollArea.Scrollbar keepMounted orientation="horizontal" style={{ height: '10px' }} />
      <ScrollArea.Corner {...props} />
    </ScrollArea.Root>,
    { initialProps: {}, refInstanceof: HTMLDivElement },
  ));
  const { renderProps } = createRenderer();
  const parts: Record<string, (props: HostProps) => JSX.Element> = {
    Root: (props) => <ScrollArea.Root {...props} />,
    Viewport: (props) => <ScrollArea.Root><ScrollArea.Viewport {...props} /></ScrollArea.Root>,
    Content: (props) => <ScrollArea.Root><ScrollArea.Viewport><ScrollArea.Content {...props} /></ScrollArea.Viewport></ScrollArea.Root>,
    Scrollbar: (props) => <ScrollArea.Root><ScrollArea.Scrollbar keepMounted {...props} /></ScrollArea.Root>,
    Thumb: (props) => <ScrollArea.Root><ScrollArea.Scrollbar keepMounted><ScrollArea.Thumb {...props} /></ScrollArea.Scrollbar></ScrollArea.Root>,
    Corner: (props) => <ScrollArea.Root><ScrollArea.Viewport ref={(node) => dimensions(node, { clientWidth: 100, clientHeight: 100, scrollWidth: 1000, scrollHeight: 1000 })} />
      <ScrollArea.Scrollbar keepMounted /><ScrollArea.Scrollbar keepMounted orientation="horizontal" /><ScrollArea.Corner {...props} /></ScrollArea.Root>,
  };
  for (const [part, factory] of Object.entries(parts)) {
    for (const customized of [false, true]) it(`${part}: live props/class/style/ref/callbacks retain ${customized ? 'custom' : 'default'} host`, async () => {
      const ref = vi.fn(); const first = vi.fn(); const second = vi.fn();
      const render = (props: ComponentProps<'div'>) => <div {...props} data-custom="yes" />;
      const view = await renderProps<HostProps>(factory, { 'data-testid': 'part', title: 'before', class: 'before', style: { color: 'green' },
        ref, onClick: first, ...(customized ? { render } : {}) });
      await waitFor(() => expect(view.queryByTestId('part')).not.toBeNull());
      const host = view.getByTestId('part');
      expect(host).toBeInstanceOf(HTMLDivElement); expect(ref).toHaveBeenCalledWith(host);
      expect(host).toHaveAttribute('title', 'before'); expect(host).toHaveClass('before'); expect(host.style.color).toBe('green');
      if (customized) expect(host).toHaveAttribute('data-custom', 'yes');
      await view.user.click(host); expect(first).toHaveBeenCalledTimes(1);
      await view.setProps({ title: 'after', class: ['after', { active: true }], style: { color: 'red' }, onClick: second });
      expect(view.getByTestId('part')).toBe(host); expect(host).toHaveAttribute('title', 'after');
      expect(host).toHaveClass('after', 'active'); expect(host).not.toHaveClass('before'); expect(host.style.color).toBe('red');
      await view.user.click(host); expect(second).toHaveBeenCalledTimes(1); expect(first).toHaveBeenCalledTimes(1);
      view.unmount(); expect(host.isConnected).toBe(false);
    });
  }
});
