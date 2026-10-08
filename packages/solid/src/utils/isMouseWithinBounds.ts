/** @deprecated Retained for source API correspondence. */
export function isMouseWithinBounds(event: (MouseEvent | PointerEvent) & { currentTarget: HTMLElement }) {
  const rect = event.currentTarget.getBoundingClientRect();
  return rect.top + 1 <= event.clientY && event.clientY <= rect.bottom - 1 &&
    rect.left + 1 <= event.clientX && event.clientX <= rect.right - 1;
}
