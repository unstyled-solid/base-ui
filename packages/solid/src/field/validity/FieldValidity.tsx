import type { JSX } from '@solidjs/web';
import { useFieldRootContext } from '../../internals/field-root-context';
import { createTransitionStatus, type TransitionStatus } from '../../internals/createTransitionStatus';
import type { FieldValidityData } from '../root/FieldRoot';

/** A stable getter-backed validity view; unrelated focus/value styling does not recreate it. */
export function FieldValidity(props: FieldValidityProps) {
  const root = useFieldRootContext(false);
  const transition = createTransitionStatus(() => root.invalid === true || root.validityData.state.valid === false);
  const validity = new Proxy({} as FieldValidityData['state'], {
    get(_, key) { return key === 'valid' && root.invalid ? false : Reflect.get(root.validityData.state, key); },
    ownKeys() { return Reflect.ownKeys(root.validityData.state); },
    getOwnPropertyDescriptor() { return { enumerable: true, configurable: true }; },
  });
  const state: FieldValidityState = {
    validity,
    get error() { return root.validityData.error; },
    get errors() { return root.validityData.errors; },
    get value() { return root.validityData.value; },
    get initialValue() { return root.validityData.initialValue; },
    get transitionStatus() { return transition.transitionStatus; },
  };
  return <>{props.children(state)}</>;
}
export interface FieldValidityState extends Omit<FieldValidityData, 'state'> {
  validity: FieldValidityData['state'];
  transitionStatus: TransitionStatus;
}
export interface FieldValidityProps { children: (state: FieldValidityState) => JSX.Element }
export namespace FieldValidity { export type Props = FieldValidityProps; export type State = FieldValidityState; }
