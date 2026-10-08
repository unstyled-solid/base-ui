import { Slider } from './index';
const scalar = <Slider.Root value={25} onValueChange={(value, details) => {
  const number: number = value; void number;
  if (details.reason === 'keyboard') { const event: KeyboardEvent = details.event; void event; }
  if (details.reason === 'drag') {
    const event: PointerEvent | TouchEvent = details.event; void event;
    // @ts-expect-error A drag is not a wheel event.
    const wheel: WheelEvent = details.event; void wheel;
  }
}} />;
const range = <Slider.Root value={Object.freeze([20, 40])} onValueCommitted={(value) => { const array: readonly number[] = value; void array; }} />;
void scalar; void range;
