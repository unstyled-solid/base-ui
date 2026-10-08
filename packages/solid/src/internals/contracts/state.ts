import type { Accessor } from 'solid-js';
import type { ChangeEventDetails } from './events';

export interface ControlledOptions<T, Details extends ChangeEventDetails = ChangeEventDetails> {
  /** Mode is selected initially; reads remain live. */
  value: Accessor<T | undefined>;
  /** Captured once, untracked. */
  defaultValue: T;
  onChange?: Accessor<((nextValue: T, details: Details) => void) | undefined>;
  name: string;
  state?: string | undefined;
}
export interface ChangeRequest<T, Details extends ChangeEventDetails = ChangeEventDetails> {
  /** Explicit proposal, never inferred by reading immediately after a staged write. */
  readonly nextValue: T;
  readonly details: Details;
}
export type ChangeRequestResult<T> =
  | { readonly accepted: false; readonly nextValue: T }
  | { readonly accepted: true; readonly nextValue: T; readonly controlled: boolean };
export interface ControlledState<T, Details extends ChangeEventDetails = ChangeEventDetails> {
  readonly value: Accessor<T>;
  readonly controlled: boolean;
  /** Calls current callback, checks cancellation, then stages allowed local state. */
  request(nextValue: T, details: Details): ChangeRequestResult<T>;
  /** Silent native-form reset. Controlled values remain authoritative. */
  reset(nextValue?: T): void;
}
/** Small read-through model for selectors and inert detached views, not a subscription store. */
export interface ReadableModel<State> {
  readonly state: Readonly<State>;
  select<T>(selector: (state: Readonly<State>) => T): T;
}
