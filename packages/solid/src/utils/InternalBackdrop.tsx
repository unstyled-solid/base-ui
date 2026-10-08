import { createEffect, createSignal, omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
export interface InternalBackdropProps extends JSX.HTMLAttributes<HTMLDivElement> { cutout?: Element | null | undefined }
export function InternalBackdrop(props: InternalBackdropProps): JSX.Element {
  const [rect, setRect] = createSignal<DOMRect | undefined>(undefined);
  createEffect(() => props.cutout, (element) => {
    if (!element) { setRect(undefined); return; }
    const update = () => setRect(element.getBoundingClientRect()); update();
    const win = element.ownerDocument.defaultView!, observer = typeof win.ResizeObserver === 'function' ? new win.ResizeObserver(update) : undefined;
    observer?.observe(element); win.addEventListener('resize', update); element.ownerDocument.addEventListener('scroll', update, true);
    return () => { observer?.disconnect(); win.removeEventListener('resize', update); element.ownerDocument.removeEventListener('scroll', update, true); };
  });
  const style = (): JSX.CSSProperties => { const box = rect(); return { position: 'fixed', inset: '0', 'user-select': 'none', '-webkit-user-select': 'none',
    'clip-path': box ? `polygon(0% 0%,100% 0%,100% 100%,0% 100%,0% 0%,${box.left}px ${box.top}px,${box.left}px ${box.bottom}px,${box.right}px ${box.bottom}px,${box.right}px ${box.top}px,${box.left}px ${box.top}px)` : undefined }; };
  return <div role="presentation" data-base-ui-inert="" {...omit(props, 'cutout', 'style')} style={style()} />;
}
export interface InternalBackdropState {}
export namespace InternalBackdrop { export type Props = InternalBackdropProps; export type State = InternalBackdropState }
