import { createContext, useContext, type Setter } from 'solid-js';
import type { FieldRootContextValue } from '../../internals/field-root-context/FieldRootContext';
import type { CompositeMetadata } from '../../internals/contracts/items';
import type { MutableCell } from '../../internals/contracts/core';
import type { SliderRoot, SliderRootState } from './SliderRoot';
export interface ThumbMetadata { inputId: string | undefined }
export interface SliderRootContext {
  readonly active: number;
  readonly lastUsedThumbIndex: number;
  readonly disabled: boolean;
  readonly dragging: boolean;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly largeStep: number;
  readonly minStepsBetweenValues: number;
  readonly orientation: 'horizontal' | 'vertical';
  readonly thumbCollisionBehavior: 'push' | 'swap' | 'none';
  readonly inset: boolean;
  readonly renderBeforeHydration: boolean;
  readonly isArrayValue: boolean;
  readonly values: readonly number[];
  readonly format: Intl.NumberFormatOptions | undefined;
  readonly locale: Intl.LocalesArgument | undefined;
  readonly name: string | undefined;
  readonly form: string | undefined;
  readonly labelId: string | undefined;
  readonly rootLabelId: string;
  readonly indicatorPosition: (number | undefined)[];
  readonly thumbMap: Map<Node, CompositeMetadata<ThumbMetadata>>;
  readonly state: SliderRootState;
  readonly field: FieldRootContextValue | null;
  controlRef: MutableCell<HTMLElement | null>;
  readonly controlElement: HTMLElement | null;
  registerControl(element: HTMLElement | null): void;
  thumbRefs: MutableCell<(HTMLElement | null)[]>;
  pressedThumbCenterOffsetRef: MutableCell<number | null>;
  pressedThumbIndexRef: MutableCell<number>;
  pressedValuesRef: MutableCell<readonly number[] | null>;
  lastChangeReasonRef: MutableCell<SliderRoot.ChangeEventReason>;
  setActive(index: number): void;
  setDragging: Setter<boolean>;
  setIndicatorPosition: Setter<(number | undefined)[]>;
  setLabelId: Setter<string | undefined>;
  setValue(value: number | number[], details: SliderRoot.ChangeEventDetails, previous?: number | readonly number[]): boolean;
  handleInputChange(value: number, index: number, event: Event): void;
  inputValues(): readonly number[];
  onValueCommitted(value: number | readonly number[], details: SliderRoot.CommitEventDetails): void;
}
export const SliderRootContext = createContext<SliderRootContext | null>(null);
export function useSliderRootContext() {
  const context = useContext(SliderRootContext);
  if (!context) throw new Error('Base UI: SliderRootContext is missing. Slider parts must be placed within <Slider.Root>.');
  return context;
}
