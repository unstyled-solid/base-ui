import type { JSX } from '@solidjs/web';
import { flush } from 'solid-js';
import { fireEvent, firePointer, flushMicrotasks } from '../../test';
import { Tooltip } from './index';

export const upstream = 'packages/react/src/tooltip/';
export type Arrangement = 'contained' | 'detached' | 'multiple-detached';
export interface FixtureProps {
  arrangement?: Arrangement;
  root?: Tooltip.Root.Props<string>;
  trigger?: Tooltip.Trigger.Props<string>;
  portal?: Tooltip.Portal.Props;
  positioner?: Tooltip.Positioner.Props;
  popup?: Tooltip.Popup.Props;
  arrow?: Tooltip.Arrow.Props;
  showTrigger?: boolean;
  viewport?: boolean;
  children?: JSX.Element;
}
export function Fixture(props: FixtureProps) {
  const handle = Tooltip.createHandle<string>();
  const Trigger = () => <Tooltip.Trigger {...props.trigger}
    handle={props.arrangement === 'contained' || !props.arrangement ? undefined : handle}
    id="trigger" payload="first">Toggle</Tooltip.Trigger>;
  const Content = () => <Tooltip.Portal {...props.portal}>
    <Tooltip.Positioner data-testid="positioner" {...props.positioner}>
      <Tooltip.Popup data-testid="popup" {...props.popup}>
        {props.viewport ? <Tooltip.Viewport data-testid="viewport">Content</Tooltip.Viewport> : 'Content'}
        <Tooltip.Arrow data-testid="arrow" {...props.arrow} />
      </Tooltip.Popup>
    </Tooltip.Positioner>
  </Tooltip.Portal>;
  return <>
    {props.arrangement && props.arrangement !== 'contained' && props.showTrigger !== false && <Trigger />}
    {props.arrangement === 'multiple-detached' && <Tooltip.Trigger handle={handle} id="other" payload="second">Other</Tooltip.Trigger>}
    <Tooltip.Root {...props.root} handle={props.arrangement && props.arrangement !== 'contained' ? handle : props.root?.handle}>
      {(!props.arrangement || props.arrangement === 'contained') && props.showTrigger !== false && <Trigger />}
      <Content />
      {props.children}
    </Tooltip.Root>
  </>;
}
export function hover(trigger: HTMLElement, pointerType = 'mouse', coordinates: MouseEventInit = {}) {
  firePointer.down(trigger, { pointerType, timeStamp: 1, ...coordinates });
  fireEvent.mouseEnter(trigger, coordinates);
  fireEvent.mouseMove(trigger, coordinates);
  flush();
}
export async function settle() { flush(); await flushMicrotasks(); flush(); }
