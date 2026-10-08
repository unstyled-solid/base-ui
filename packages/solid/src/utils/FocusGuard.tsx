import { createSignal, onSettled } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { visuallyHidden } from './visuallyHidden';
import { platform } from './platform';
export function FocusGuard(props: JSX.HTMLAttributes<HTMLSpanElement>): JSX.Element {
  const [role, setRole] = createSignal<'button' | undefined>(undefined);
  onSettled(() => { if (platform.screenReader.voiceOver && platform.engine.webkit) setRole('button'); });
  return <span {...props} style={visuallyHidden} aria-hidden={role() ? undefined : 'true'} tabindex={0} role={role()} data-base-ui-focus-guard="" />;
}
