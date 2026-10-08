import { flush } from 'solid-js';
import { fireEvent, isJSDOM, screen } from '../../test';
import { OTPField } from './index';

export function Fixture(props: Omit<OTPField.Root.Props, 'length'> & { length?: number }) {
  return <OTPField.Root {...props} length={props.length ?? 6}>
    <OTPField.Input /><OTPField.Input /><OTPField.Input />
    <OTPField.Input /><OTPField.Input /><OTPField.Input />
  </OTPField.Root>;
}
export function slots() { return screen.getAllByRole<HTMLInputElement>('textbox'); }
export function values() { return slots().map((input) => input.value).join(''); }
export function hidden() { return document.querySelector<HTMLInputElement>('input[aria-hidden="true"]')!; }
export async function settle() { flush(); await Promise.resolve(); flush(); }
export async function input(target: HTMLInputElement, value: string) {
  fireEvent.input(target, { target: { value } });
  await settle();
}
export async function paste(target: HTMLInputElement, value: string) {
  if (isJSDOM) {
    fireEvent.paste(target, { clipboardData: { getData: () => value } });
  } else {
    // Pinned OTPFieldInput.test.tsx uses an Event with clipboard data in real
    // browsers: ClipboardEventInit requires a genuine DataTransfer there.
    const event = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'clipboardData', { value: { getData: () => value } });
    fireEvent(target, event);
  }
  await settle();
}
export async function key(target: HTMLInputElement, key: string, options: KeyboardEventInit = {}) {
  const allowed = fireEvent.keyDown(target, { key, ...options });
  await settle();
  return allowed;
}
export async function focus(target: HTMLElement) { target.focus(); await settle(); }
