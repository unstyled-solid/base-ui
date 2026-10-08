import { ScrollArea } from './index';
import type { ScrollAreaViewportProps } from './viewport/ScrollAreaViewport';
import type { ScrollAreaScrollbarProps } from './scrollbar/ScrollAreaScrollbar';
import type { ScrollAreaThumbProps } from './thumb/ScrollAreaThumb';
import type { ScrollAreaRootProps } from './root/ScrollAreaRoot';
import { DirectionContext } from '../internals/direction-context/DirectionContext';

export function dimensions(node: HTMLElement | null, values: Record<string, number>) {
  if (!node) return;
  for (const [key, value] of Object.entries(values)) Object.defineProperty(node, key, { configurable: true, value });
}
export function capture(node: HTMLElement | null) {
  if (!node) return { drop() {} };
  let id: number | null = null;
  Object.assign(node, {
    setPointerCapture(next: number) { id = next; },
    hasPointerCapture(next: number) { return id === next; },
    releasePointerCapture(next: number) { if (id === next) id = null; },
  });
  return { drop() { id = null; } };
}
export interface FixtureProps {
  direction?: 'ltr' | 'rtl';
  contentSize?: number;
  root?: ScrollAreaRootProps;
  viewport?: ScrollAreaViewportProps;
  scrollbar?: ScrollAreaScrollbarProps;
  thumb?: ScrollAreaThumbProps;
  mock?: boolean;
}
export function ScrollAreaFixture(props: FixtureProps) {
  return <DirectionContext value={() => props.direction ?? 'ltr'}>
    <ScrollArea.Root data-testid="root" style={{ width: '200px', height: '200px', direction: props.direction ?? 'ltr' }} {...props.root}>
      <ScrollArea.Viewport data-testid="viewport" style={{ width: '100%', height: '100%', 'scroll-snap-type': 'both mandatory' }}
        ref={(node) => { if (props.mock && node) {
          dimensions(node, { clientWidth: 200, clientHeight: 200, scrollWidth: 1000, scrollHeight: 1000 });
          // Mock geometry needs matching mock scroll storage. Native Firefox
          // quantizes scroll positions in the runner's scaled iframe.
          Object.defineProperties(node, {
            scrollLeft: { configurable: true, writable: true, value: 0 },
            scrollTop: { configurable: true, writable: true, value: 0 },
          });
        } }} {...props.viewport}>
        <ScrollArea.Content data-testid="content">
          <div style={{ width: `${props.contentSize ?? 1000}px`, height: `${props.contentSize ?? 1000}px` }} />
        </ScrollArea.Content>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar data-testid="vertical" keepMounted style={{ width: '10px' }}
        ref={(node) => { if (props.mock) dimensions(node, { offsetWidth: 10, offsetHeight: 200 }); }} {...props.scrollbar}>
        <ScrollArea.Thumb data-testid="thumb-y" ref={(node) => { capture(node); if (props.mock) dimensions(node, { offsetHeight: 40 }); }} {...props.thumb} />
      </ScrollArea.Scrollbar>
      <ScrollArea.Scrollbar data-testid="horizontal" orientation="horizontal" keepMounted style={{ height: '10px' }}
        ref={(node) => { if (props.mock) dimensions(node, { offsetWidth: 200, offsetHeight: 10 }); }}>
        <ScrollArea.Thumb data-testid="thumb-x" ref={(node) => { capture(node); if (props.mock) dimensions(node, { offsetWidth: 40 }); }} />
      </ScrollArea.Scrollbar>
      <ScrollArea.Corner data-testid="corner" />
    </ScrollArea.Root>
  </DirectionContext>;
}
