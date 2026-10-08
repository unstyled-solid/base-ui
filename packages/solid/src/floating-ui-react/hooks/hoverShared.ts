import type { Placement } from '@floating-ui/dom';
import type { FloatingTreeType } from '../../internals/contracts/floating';
import { isMouseLikePointerType } from '../utils/event';
export { isTargetInsideEnabledTrigger as isInsideEnabledTrigger } from '../utils/element';
export interface HandleCloseOptions { blockPointerEvents?: boolean | undefined; getScope?: (() => HTMLElement | SVGSVGElement | null) | undefined }
export interface HandleCloseContext { x: number | null; y: number | null; placement: Placement | null; elements: { domReference: Element | null; floating: HTMLElement | null }; onClose(): void; nodeId?: string | undefined; tree?: FloatingTreeType | null | undefined; leave?: boolean | undefined }
export type HandleCloseContextBase = Omit<HandleCloseContext, 'onClose' | 'tree' | 'x' | 'y'>;
export interface HandleClose { (context: HandleCloseContext): (event: MouseEvent) => void; __options?: HandleCloseOptions | undefined; dispose?(): void }
export type HoverDelay = number | Partial<{ open: number; close: number }>;
export function getDelay(value: HoverDelay | (() => HoverDelay) | undefined, prop: 'open' | 'close', pointerType?: string) {
  if (pointerType != null && !isMouseLikePointerType(pointerType)) return 0;
  const result = typeof value === 'function' ? value() : value;
  return typeof result === 'number' ? result : result?.[prop];
}
export const getRestMs = (value: number | (() => number)): number => typeof value === 'function' ? value() : value;
export const isClickLikeOpenEvent = (type: string | undefined, interactedInside: boolean): boolean => interactedInside || type === 'click' || type === 'mousedown';
export const isHoverOpenEvent = (type: string | undefined) => !!type?.includes('mouse') && type !== 'mousedown';
