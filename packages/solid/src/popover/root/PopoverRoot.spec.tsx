import { expectType } from '../../../test';
import { Popover } from '../index';

const numberHandle = Popover.createHandle<number>();
<Popover.Root handle={numberHandle}><Popover.Portal /></Popover.Root>;
<Popover.Root handle={numberHandle}>{(state) => {
  expectType<number | undefined, typeof state.payload>(state.payload);
  return null;
}}</Popover.Root>;
<Popover.Trigger handle={numberHandle} payload={42} />;
<Popover.Trigger handle={numberHandle} />;
// @ts-expect-error A handle determines the trigger's payload type.
<Popover.Trigger handle={numberHandle} payload="invalid" />;
<Popover.Root onOpenChange={(_open, details) => {
  if (details.reason === 'escape-key') expectType<KeyboardEvent, typeof details.event>(details.event);
  details.preventUnmountOnClose();
}} />;
// @ts-expect-error keepMounted is a Portal option, not Positioner state.
<Popover.Positioner keepMounted />;
// @ts-expect-error JSX instances are not native Solid render factories.
<Popover.Trigger render={<button />} />;
