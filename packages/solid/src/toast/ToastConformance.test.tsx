import { describe } from 'vitest';
import { createSignal } from 'solid-js';
import { describeConformance } from '../../test';
import type { ConformantComponentProps } from '../../test/describeConformance';
import { Toast } from './index';
import type { ToastRootState, ToastRootProps } from './root/ToastRoot';
import type { ToastViewportState, ToastViewportProps } from './viewport/ToastViewport';
import type { ToastContentState, ToastContentProps } from './content/ToastContent';
import type { ToastTitleState, ToastTitleProps } from './title/ToastTitle';
import type { ToastDescriptionState, ToastDescriptionProps } from './description/ToastDescription';
import type { ToastActionState, ToastActionProps } from './action/ToastAction';
import type { ToastCloseState, ToastCloseProps } from './close/ToastClose';
import type { ToastPortalState, ToastPortalProps } from './portal/ToastPortal';
import type { ToastPositionerState, ToastPositionerProps } from './positioner/ToastPositioner';
import type { ToastArrowState, ToastArrowProps } from './arrow/ToastArrow';
const toast = { id: 'conformance', title: 'Title', description: 'Description', timeout: 0 };
function PortalFixture(props: ToastPortalProps) {
  const [container, setContainer] = createSignal<HTMLDivElement | null>(null, { ownedWrite: true });
  return <><div ref={setContainer} /><Toast.Portal {...props} container={container()} /></>;
}
// Harness props are native HTMLElement props; Base UI's public cancellation
// typing is strengthened at the family boundary rather than emulated in JSX.
describe('Toast canonical generated part conformance', () => {
  describe('Root', () => describeConformance<ToastRootState, ConformantComponentProps<ToastRootState>>(
    (props) => <Toast.Provider><Toast.Root {...props as ToastRootProps} toast={toast} /></Toast.Provider>, { initialProps: {}, refInstanceof: HTMLDivElement }));
  describe('Viewport', () => describeConformance<ToastViewportState, ConformantComponentProps<ToastViewportState>>(
    (props) => <Toast.Provider><Toast.Viewport {...props as ToastViewportProps} /></Toast.Provider>, { initialProps: {}, refInstanceof: HTMLDivElement }));
  describe('Content', () => describeConformance<ToastContentState, ConformantComponentProps<ToastContentState>>(
    (props) => <Toast.Provider><Toast.Root toast={toast}><Toast.Content {...props as ToastContentProps} /></Toast.Root></Toast.Provider>, { initialProps: {}, refInstanceof: HTMLDivElement }));
  describe('Title', () => describeConformance<ToastTitleState, ConformantComponentProps<ToastTitleState>>(
    (props) => <Toast.Provider><Toast.Root toast={toast}><Toast.Title {...props as ToastTitleProps} /></Toast.Root></Toast.Provider>, { initialProps: {}, refInstanceof: HTMLHeadingElement }));
  describe('Description', () => describeConformance<ToastDescriptionState, ConformantComponentProps<ToastDescriptionState>>(
    (props) => <Toast.Provider><Toast.Root toast={toast}><Toast.Description {...props as ToastDescriptionProps} /></Toast.Root></Toast.Provider>, { initialProps: {}, refInstanceof: HTMLParagraphElement }));
  describe('Action', () => describeConformance<ToastActionState, ConformantComponentProps<ToastActionState>>(
    (props) => <Toast.Provider><Toast.Root toast={toast}><Toast.Action {...props as ToastActionProps} /></Toast.Root></Toast.Provider>, { initialProps: { children: 'Action' }, refInstanceof: HTMLButtonElement, button: true }));
  describe('Close', () => describeConformance<ToastCloseState, ConformantComponentProps<ToastCloseState>>(
    (props) => <Toast.Provider><Toast.Root toast={toast}><Toast.Close {...props as ToastCloseProps} /></Toast.Root></Toast.Provider>, { initialProps: { children: 'Close' }, refInstanceof: HTMLButtonElement, button: true }));
  describe('Portal', () => describeConformance<ToastPortalState, ConformantComponentProps<ToastPortalState>>(
    (props) => <PortalFixture {...props as ToastPortalProps} />, { initialProps: {}, refInstanceof: HTMLDivElement }));
  describe('Positioner', () => describeConformance<ToastPositionerState, ConformantComponentProps<ToastPositionerState>>(
    (props) => <Toast.Provider><Toast.Positioner {...props as ToastPositionerProps} toast={toast} /></Toast.Provider>, { initialProps: {}, refInstanceof: HTMLDivElement }));
  describe('Arrow', () => describeConformance<ToastArrowState, ConformantComponentProps<ToastArrowState>>(
    (props) => <Toast.Provider><Toast.Positioner toast={toast}><Toast.Arrow {...props as ToastArrowProps} /></Toast.Positioner></Toast.Provider>, { initialProps: {}, refInstanceof: HTMLDivElement }));
});
