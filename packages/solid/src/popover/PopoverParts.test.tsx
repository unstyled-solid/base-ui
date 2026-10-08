import { describe } from 'vitest';
import { describeConformance } from '../../test';
import type { ConformantComponentProps } from '../../test/describeConformance';
import { Popover } from './index';

// All source small-part conformance suites, using native factory composition.
// Test-boundary assertions bridge the harness's native event callback view to the
// enhanced Base UI prop view; the actual renderer/cancellation engine runs unchanged.
describe('Popover Trigger conformance', () => {
  describeConformance((props: ConformantComponentProps<Popover.Trigger.State>) =>
    <Popover.Root open><Popover.Trigger {...(props as Popover.Trigger.Props)} /></Popover.Root>,
  { initialProps: {}, refInstanceof: HTMLButtonElement, button: true });
});
describe('Popover Close conformance', () => {
  describeConformance((props: ConformantComponentProps<Popover.Close.State>) =>
    <Popover.Root open><Popover.Trigger>Trigger</Popover.Trigger><Popover.Portal><Popover.Positioner><Popover.Popup><Popover.Close {...(props as Popover.Close.Props)} /></Popover.Popup></Popover.Positioner></Popover.Portal></Popover.Root>,
  { initialProps: {}, refInstanceof: HTMLButtonElement, button: true });
});
describe('Popover Title conformance', () => {
  describeConformance((props: ConformantComponentProps<Popover.Title.State>) =>
    <Popover.Root open><Popover.Trigger>Trigger</Popover.Trigger><Popover.Portal><Popover.Positioner><Popover.Popup><Popover.Title {...(props as Popover.Title.Props)} /></Popover.Popup></Popover.Positioner></Popover.Portal></Popover.Root>,
  { initialProps: {}, refInstanceof: HTMLHeadingElement });
});
describe('Popover Description conformance', () => {
  describeConformance((props: ConformantComponentProps<Popover.Description.State>) =>
    <Popover.Root open><Popover.Trigger>Trigger</Popover.Trigger><Popover.Portal><Popover.Positioner><Popover.Popup><Popover.Description {...(props as Popover.Description.Props)} /></Popover.Popup></Popover.Positioner></Popover.Portal></Popover.Root>,
  { initialProps: {}, refInstanceof: HTMLParagraphElement });
});
describe('Popover Backdrop conformance', () => {
  describeConformance((props: ConformantComponentProps<Popover.Backdrop.State>) =>
    <Popover.Root open><Popover.Backdrop {...(props as Popover.Backdrop.Props)} /></Popover.Root>,
  { initialProps: {}, refInstanceof: HTMLDivElement });
});
describe('Popover Portal conformance', () => {
  describeConformance((props: ConformantComponentProps<Popover.Portal.State>) =>
    <Popover.Root open><Popover.Portal {...(props as Popover.Portal.Props)} /></Popover.Root>,
  { initialProps: {}, refInstanceof: HTMLDivElement });
});
describe('Popover Positioner conformance', () => {
  describeConformance((props: ConformantComponentProps<Popover.Positioner.State>) =>
    <Popover.Root open><Popover.Trigger>Toggle</Popover.Trigger><Popover.Portal><Popover.Positioner {...(props as Popover.Positioner.Props)} /></Popover.Portal></Popover.Root>,
  { initialProps: {}, refInstanceof: HTMLDivElement });
});
describe('Popover Popup conformance', () => {
  describeConformance((props: ConformantComponentProps<Popover.Popup.State>) =>
    <Popover.Root open><Popover.Trigger>Toggle</Popover.Trigger><Popover.Portal><Popover.Positioner><Popover.Popup {...(props as Popover.Popup.Props)} /></Popover.Positioner></Popover.Portal></Popover.Root>,
  { initialProps: {}, refInstanceof: HTMLDivElement });
});
describe('Popover Arrow conformance', () => {
  describeConformance((props: ConformantComponentProps<Popover.Arrow.State>) =>
    <Popover.Root open><Popover.Trigger>Toggle</Popover.Trigger><Popover.Portal><Popover.Positioner><Popover.Popup><Popover.Arrow {...(props as Popover.Arrow.Props)} /></Popover.Popup></Popover.Positioner></Popover.Portal></Popover.Root>,
  { initialProps: {}, refInstanceof: HTMLDivElement });
});
describe('Popover Viewport conformance', () => {
  describeConformance((props: ConformantComponentProps<Popover.Viewport.State>) =>
    <Popover.Root open><Popover.Trigger>Toggle</Popover.Trigger><Popover.Portal><Popover.Positioner><Popover.Popup><Popover.Viewport {...(props as Popover.Viewport.Props)} /></Popover.Popup></Popover.Positioner></Popover.Portal></Popover.Root>,
  { initialProps: {}, refInstanceof: HTMLDivElement });
});
