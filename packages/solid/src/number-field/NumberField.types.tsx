import type { ComponentProps } from '@solidjs/web';
import { NumberField } from './index';
const props: NumberField.Root.Props = {
  onValueChange(value, details) {
    const numeric: number | null = value;
    if (details.reason === 'wheel') {
      const event: WheelEvent = details.event;
      // @ts-expect-error Wheel reasons do not expose pointer fields.
      const pointer: PointerEvent = details.event;
      void [event, pointer];
    }
    details.cancel(); void numeric;
  },
  onValueCommitted(_value, details) {
    if (details.reason === 'scrub') { const pointer: PointerEvent = details.event; void pointer; }
    // @ts-expect-error Generic commits cannot be canceled.
    details.cancel();
  },
};
export const numberFieldTypes = <NumberField.Root {...props}><NumberField.Input render={(inputProps) => {
  const native: Readonly<ComponentProps<'input'>> = inputProps;
  return <input {...native} />;
}} /></NumberField.Root>;
