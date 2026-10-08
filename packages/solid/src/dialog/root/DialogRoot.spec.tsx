import { expectType } from '../../../test';
import { Dialog } from '../index';

const handle = Dialog.createHandle<number>();
const direct = <Dialog.Root handle={handle}><Dialog.Portal /></Dialog.Root>;
const callback = <Dialog.Root handle={handle}>{(context) => {
  expectType<number | undefined, typeof context.payload>(context.payload);
  return <span>{context.payload}</span>;
}}</Dialog.Root>;
const trigger = <Dialog.Trigger handle={handle} payload={42} />;
const noPayload = <Dialog.Trigger handle={handle} />;
// @ts-expect-error A handle's payload type cannot be widened by a trigger.
const invalid = <Dialog.Trigger handle={handle} payload="invalid" />;
void [direct, callback, trigger, noPayload, invalid];
