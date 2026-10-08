import { describe } from 'vitest';
import { createMemo } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { describeConformance, type ConformantComponentProps } from '../../test/describeConformance';
import { NavigationMenu } from './index';
type HostProps = ConformantComponentProps;
// The harness's generic native HTMLElement callback and the public branded/
// anchor-specific callback differ only in static host typing. Keep the original
// live record and state, and keep this wrapper stable across ordinary prop writes.
function adaptProps(props: HostProps) {
  const render = (host: Record<string, any>, state: unknown) => props.render!(host, state);
  return createMemo(() => {
    const { render: callback, ...rest } = props;
    return { ...rest, render: callback ? render : undefined };
  });
}
function Root(props: { children?: JSX.Element }) { return <NavigationMenu.Root defaultValue="a">{props.children}</NavigationMenu.Root>; }
function Item(props: { children?: JSX.Element }) { return <NavigationMenu.Item value="a">{props.children}</NavigationMenu.Item>; }
function Positioner(props: { children?: JSX.Element }) { return <NavigationMenu.Portal keepMounted><NavigationMenu.Positioner>{props.children}</NavigationMenu.Positioner></NavigationMenu.Portal>; }
const cases = [
  ['Root', HTMLElement, (props: HostProps) => { const forwarded = adaptProps(props); return <NavigationMenu.Root {...forwarded()} />; }],
  ['List', HTMLUListElement, (props: HostProps) => { const forwarded = adaptProps(props); return <Root><NavigationMenu.List {...forwarded()} /></Root>; }],
  ['Link', HTMLAnchorElement, (props: HostProps) => { const forwarded = adaptProps(props); return <Root><NavigationMenu.List><NavigationMenu.Link {...forwarded()} /></NavigationMenu.List></Root>; }],
  ['Icon', HTMLSpanElement, (props: HostProps) => { const forwarded = adaptProps(props); return <Root><Item><NavigationMenu.Icon {...forwarded()} /></Item></Root>; }],
  ['Trigger', HTMLButtonElement, (props: HostProps) => { const forwarded = adaptProps(props); return <Root><NavigationMenu.List><Item><NavigationMenu.Trigger {...forwarded()} /></Item></NavigationMenu.List></Root>; }],
  ['Portal', HTMLDivElement, (props: HostProps) => { const forwarded = adaptProps(props); return <Root><NavigationMenu.Portal {...forwarded()} keepMounted /></Root>; }],
  ['Positioner', HTMLDivElement, (props: HostProps) => { const forwarded = adaptProps(props); return <Root><NavigationMenu.Portal><NavigationMenu.Positioner {...forwarded()} /></NavigationMenu.Portal></Root>; }],
  ['Popup', HTMLElement, (props: HostProps) => { const forwarded = adaptProps(props); return <Root><Positioner><NavigationMenu.Popup {...forwarded()} /></Positioner></Root>; }],
  ['Arrow', HTMLDivElement, (props: HostProps) => { const forwarded = adaptProps(props); return <Root><Positioner><NavigationMenu.Arrow {...forwarded()} /></Positioner></Root>; }],
  ['Backdrop', HTMLDivElement, (props: HostProps) => { const forwarded = adaptProps(props); return <Root><NavigationMenu.Backdrop {...forwarded()} /></Root>; }],
  ['Viewport', HTMLDivElement, (props: HostProps) => { const forwarded = adaptProps(props); return <Root><Positioner><NavigationMenu.Viewport {...forwarded()} /></Positioner></Root>; }],
  ['Content', HTMLDivElement, (props: HostProps) => { const forwarded = adaptProps(props); return <Root><NavigationMenu.List><Item><NavigationMenu.Content {...forwarded()} /></Item></NavigationMenu.List><Positioner><NavigationMenu.Popup><NavigationMenu.Viewport /></NavigationMenu.Popup></Positioner></Root>; }],
] as const;
for (const [name, constructor, factory] of cases) {
  describe(`NavigationMenu.${name} conformance`, () => {
    describeConformance(factory, { initialProps: {}, refInstanceof: constructor, testRenderPropWith: name === 'Trigger' ? 'button' : 'div', button: name === 'Trigger' });
  });
}
