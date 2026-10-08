import type { JSX } from '@solidjs/web';

/** Render callbacks receive already-composed native handlers and a callback ref.
 * The broad callback accepts each concrete HTML host (including input triggers).
 */
export type TooltipRenderProps = Omit<JSX.HTMLAttributes<HTMLElement>, 'ref'> & {
  ref?: (element: HTMLElement | null) => void;
};
