import type { JSX } from '@solidjs/web';
import type {
  BaseUIComponentProps, BaseUIEvent, ComponentRenderFn, ControlledState,
  FieldControlRegistration, FloatingRootContext, FloatingTreeType, ItemRegistry,
  NativeRef, PopupHandleAttachment, PopupHandleStoreWithOpen, PortalContainer,
  TransitionStatus, WithBaseUIEvent,
} from 'baseui-solid2/internals/contracts';

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Assert<T extends true> = T;
type CountState = { count: number };
type Props = BaseUIComponentProps<'button', CountState, JSX.ButtonHTMLAttributes<HTMLButtonElement>>;
export type StateStatus = Assert<Equal<TransitionStatus, 'starting' | 'ending' | 'idle' | undefined>>;
export type CallbackPreserved = Assert<Equal<WithBaseUIEvent<{ changed: (value: number) => string }>['changed'], (value: number) => string>>;

export const callback: ComponentRenderFn<JSX.ButtonHTMLAttributes<HTMLButtonElement>, CountState> =
  (props, state) => <button {...props} data-count={state.count} />;
export const props: Props = {
  class: (state) => ['proof', { active: state.count > 0 }],
  style: (state) => ({ opacity: state.count }),
  onClick: (event) => { event.preventBaseUIHandler(); event.currentTarget.disabled = true; },
  render: callback,
};
export const bound: Props = { onClick: [(data: string, event: BaseUIEvent<MouseEvent>) => { event.preventBaseUIHandler(); data.toUpperCase(); }, 'bound'] };
export const ref: NativeRef<HTMLButtonElement> = (element) => { element.focus(); };
export const container: PortalContainer = () => null;
// @ts-expect-error Intentional negative contract: className is not Solid's class prop.
export const wrongClass: Props = { className: 'wrong' };
// @ts-expect-error Intentional negative contract: JSX is not a cloneable render callback.
export const wrongRender: Props = { render: <button /> };
// @ts-expect-error Intentional negative contract: native Event has no synthetic nativeEvent member.
export const synthetic = (event: BaseUIEvent<MouseEvent>) => event.nativeEvent;

/** Compile-only consumer seams; no runtime component implementations. */
export function consumer(
  state: ControlledState<number>, registry: ItemRegistry<string, { disabled: boolean }>,
  root: FloatingRootContext, tree: FloatingTreeType,
  handle: PopupHandleAttachment<PopupHandleStoreWithOpen>, field: FieldControlRegistration,
) {
  const request = state.request(2, {
    reason: 'keyboard', event: new KeyboardEvent('keydown'), trigger: undefined,
    cancel() {}, allowPropagation() {}, isCanceled: false, isPropagationAllowed: false,
  });
  if (request.accepted) { request.controlled satisfies boolean; }
  registry.liveItems.get('item')?.disabled;
  const detach = handle.attachStore(handle.store);
  tree.addNode({ id: 'child', parentId: 'parent', context: root });
  field.controlRef()?.focus();
  return detach;
}
