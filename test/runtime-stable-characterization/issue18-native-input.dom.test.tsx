import { afterEach, expect, test } from 'vitest';
import { createSignal, flush } from 'solid-js';
import { render } from '@solidjs/web';
import { SwitchRoot } from '../../packages/solid/src/switch/root/SwitchRoot';
import { RadioRoot } from '../../packages/solid/src/radio/root/RadioRoot';
import { RadioGroup } from '../../packages/solid/src/radio-group/RadioGroup';

const disposers: (() => void)[] = [];
afterEach(() => { disposers.splice(0).reverse().forEach(dispose => dispose()); document.body.replaceChildren(); });

test.each(['switch', 'radio'])('actual %s native input omission, replacement, empty string, form and reset', async kind => {
  let change!: (value: string | undefined) => void;
  const host = document.createElement('div'); document.body.append(host);
  disposers.push(render(() => {
    const [value, setValue] = createSignal<string | undefined>(undefined); change = setValue;
    return <form>{kind === 'switch'
      ? <SwitchRoot name="choice" checked value={value()} />
      : <RadioGroup name="choice" value={value()}><RadioRoot value={value()} /></RadioGroup>}</form>;
  }, host));
  const input = host.querySelector<HTMLInputElement>(`input[type=${kind === 'switch' ? 'checkbox' : 'radio'}]`)!;
  const form = host.querySelector('form')!;
  for (const value of [undefined, 'explicit', undefined, '', undefined, 'again', undefined]) {
    change(value); flush();
    expect(host.querySelector(`input[type=${input.type}]`)).toBe(input);
    expect(input.value).toBe(value ?? 'on'); expect(input.getAttribute('value')).toBe(value ?? null);
    input.checked = true; expect(new FormData(form).get('choice')).toBe(value ?? 'on');
    form.reset(); await new Promise<void>(resolve => queueMicrotask(resolve)); flush();
    expect(input.value).toBe(value ?? 'on'); expect(input.getAttribute('value')).toBe(value ?? null);
  }
});
