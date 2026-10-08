import { onCleanup } from 'solid-js';
import { Timeout } from './createTimeout';

export class Interval extends Timeout {
  static override create() { return new Interval(); }
  override start(delay: number, fn: () => void) {
    this.clear();
    this.currentId = setInterval(fn, delay);
  }
  override clear = () => {
    if (this.currentId !== 0) { clearInterval(this.currentId); this.currentId = 0; }
  };
}
export function createInterval() {
  const interval = Interval.create();
  onCleanup(interval.clear);
  return interval;
}
export { createInterval as useInterval };
