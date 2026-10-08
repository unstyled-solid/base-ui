import type { JSX } from '@solidjs/web';
export const wrongEvent: JSX.EventHandler<HTMLInputElement, InputEvent> = (event: KeyboardEvent) => { event.key.toUpperCase(); };
