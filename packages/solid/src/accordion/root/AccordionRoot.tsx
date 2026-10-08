import { createEffect, omit, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import type { BaseUIComponentProps, Orientation } from '../../internals/types';
import type { BaseUIChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { createControlled } from '../../utils/createControlled';
import { warn } from '../../utils/warn';
import { CompositeList } from '../../internals/composite';
import { createRenderElement } from '../../internals/createRenderElement';
import { AccordionRootContext } from './AccordionRootContext';

/** Groups an accordion's disclosures. Keyboard focus follows normal document order. */
export function AccordionRoot<Value = any>(props: AccordionRootProps<Value>): JSX.Element {
  const elementsRef = { current: [] as (HTMLElement | null)[] };
  const selection = createControlled<AccordionValue<Value>, AccordionRootChangeEventDetails>({
    value: () => props.value,
    defaultValue: untrack(() => props.defaultValue ?? []),
    onChange: () => props.onValueChange,
    name: 'Accordion',
    state: 'value',
  });
  const state: AccordionRootState<Value> = {
    get value() { return selection.value(); },
    get disabled() { return props.disabled ?? false; },
    get orientation() { return props.orientation ?? 'vertical'; },
  };
  createEffect(
    () => Boolean(props.hiddenUntilFound && props.keepMounted === false),
    (conflict) => {
      if (process.env.NODE_ENV !== 'production' && conflict) {
        warn('The `keepMounted={false}` prop on `Accordion.Root` is ignored when `hiddenUntilFound` is enabled, since panels must remain mounted while closed.');
      }
    },
  );
  const context: AccordionRootContext<Value> = {
    state,
    get value() { return selection.value(); },
    get disabled() { return state.disabled; },
    get hiddenUntilFound() { return props.hiddenUntilFound ?? false; },
    get keepMounted() { return props.keepMounted ?? false; },
    handleValueChange(itemValue, nextOpen, details) {
      const value = selection.value();
      const nextValue = !props.multiple
        ? value[0] === itemValue ? [] : [itemValue]
        : nextOpen ? [...value, itemValue] : value.filter((item) => item !== itemValue);
      selection.request(nextValue, details);
    },
  };
  function Host() {
    return createRenderElement('div', props, {
      state,
      get ref() { return props.ref; },
      props: omit(props, 'render', 'class', 'style', 'ref', 'disabled', 'hiddenUntilFound', 'keepMounted', 'loopFocus', 'onValueChange', 'multiple', 'orientation', 'value', 'defaultValue'),
      stateAttributesMapping: { value: null },
    });
  }
  return (
    <AccordionRootContext value={context}>
      <CompositeList elementsRef={elementsRef}><Host /></CompositeList>
    </AccordionRootContext>
  );
}

export type AccordionValue<Value = any> = Value[];
export interface AccordionRootState<Value = any> {
  value: AccordionValue<Value>;
  disabled: boolean;
  /** @deprecated Does not affect keyboard focus behavior. */
  orientation: Orientation;
}
export interface AccordionRootProps<Value = any> extends BaseUIComponentProps<'div', AccordionRootState<Value>, JSX.IntrinsicElements['div']> {
  value?: AccordionValue<Value>;
  defaultValue?: AccordionValue<Value>;
  disabled?: boolean;
  hiddenUntilFound?: boolean;
  keepMounted?: boolean;
  /** @deprecated Does not affect keyboard focus behavior. */
  loopFocus?: boolean;
  onValueChange?: (value: AccordionValue<Value>, details: AccordionRootChangeEventDetails) => void;
  multiple?: boolean;
  /** @deprecated Does not affect keyboard focus behavior. */
  orientation?: Orientation;
}
export type AccordionRootChangeEventReason = 'trigger-press' | 'none';
export type AccordionRootChangeEventDetails = BaseUIChangeEventDetails<AccordionRootChangeEventReason>;
export namespace AccordionRoot {
  export type Value<TValue = any> = AccordionValue<TValue>;
  export type State<TValue = any> = AccordionRootState<TValue>;
  export type Props<TValue = any> = AccordionRootProps<TValue>;
  export type ChangeEventReason = AccordionRootChangeEventReason;
  export type ChangeEventDetails = AccordionRootChangeEventDetails;
}
