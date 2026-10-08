import type { JSX } from '@solidjs/web';
import { ComboboxTrigger } from '../../combobox/trigger/ComboboxTrigger';
import type { ComboboxTriggerProps, ComboboxTriggerState } from '../../combobox/trigger/ComboboxTrigger';
import type { BaseUIComponentProps } from '../../internals/types';

export type AutocompleteTriggerState = Omit<ComboboxTriggerState, 'placeholder'>;
export type AutocompleteTriggerProps = Omit<ComboboxTriggerProps, 'class' | 'style' | 'render'> &
  Pick<BaseUIComponentProps<'button', AutocompleteTriggerState>, 'class' | 'style' | 'render'>;
export interface AutocompleteTrigger { (props: AutocompleteTriggerProps): JSX.Element }
export const AutocompleteTrigger = ComboboxTrigger as AutocompleteTrigger;
export namespace AutocompleteTrigger {
  export type Props = AutocompleteTriggerProps;
  export type State = AutocompleteTriggerState;
}
