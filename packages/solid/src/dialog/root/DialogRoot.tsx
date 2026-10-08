import type { JSX } from '@solidjs/web';
import type { BaseUIChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import type { DialogHandle } from '../store/DialogHandle';
import { createRenderDialogRoot } from './useRenderDialogRoot';

export function DialogRoot<Payload = unknown>(props: DialogRootProps<Payload>): JSX.Element {
  return createRenderDialogRoot('dialog', props);
}
export interface DialogRootState {}
export interface DialogRootActions { unmount(): void; close(): void }
export type DialogRootChangeEventReason = 'trigger-press' | 'outside-press' | 'escape-key' | 'close-press' | 'focus-out' | 'imperative-action' | 'none';
export type DialogRootChangeEventDetails = BaseUIChangeEventDetails<DialogRootChangeEventReason, { preventUnmountOnClose(): void }>;
export interface DialogRootProps<Payload = unknown> {
  /** Controlled open state. Defaults seed only this root's uncontrolled lifetime. */
  open?: boolean;
  defaultOpen?: boolean;
  /** true: trap focus and lock scroll/pointers; false: nonmodal; trap-focus: focus only. */
  modal?: boolean | 'trap-focus';
  /** Also suppresses nonmodal focus-out dismissal; Escape and explicit close remain available. */
  disablePointerDismissal?: boolean;
  onOpenChange?: (open: boolean, details: DialogRootChangeEventDetails) => void;
  onOpenChangeComplete?: (open: boolean) => void;
  /** Retention is requested by details.preventUnmountOnClose(), not by providing actionsRef. */
  actionsRef?: { current: DialogRootActions | null } | ((actions: DialogRootActions | null) => void);
  /** A root owns its model; swapping this handle never resets that model. */
  handle?: DialogHandle<Payload>;
  triggerId?: string | null;
  defaultTriggerId?: string | null;
  /** Read context.payload live in JSX; it follows the active trigger without recreating the subtree. */
  children?: JSX.Element | ((context: { readonly payload: Payload | undefined }) => JSX.Element);
}
export namespace DialogRoot {
  export type Props<Payload = unknown> = DialogRootProps<Payload>;
  export type State = DialogRootState;
  export type Actions = DialogRootActions;
  export type ChangeEventReason = DialogRootChangeEventReason;
  export type ChangeEventDetails = DialogRootChangeEventDetails;
}
