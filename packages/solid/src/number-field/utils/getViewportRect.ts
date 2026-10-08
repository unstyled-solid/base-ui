// Adapted from Base UI (MIT), 19511bb171f3b360b006c94cf6d07e53cb446505.
import { ownerWindow } from '../../utils/owner';

export function getViewportRect(teleportDistance: number | undefined, scrubAreaEl: HTMLElement) {
  const win = ownerWindow(scrubAreaEl);
  if (teleportDistance != null) {
    const rect = scrubAreaEl.getBoundingClientRect();
    return { left: rect.left - teleportDistance / 2, top: rect.top - teleportDistance / 2,
      right: rect.right + teleportDistance / 2, bottom: rect.bottom + teleportDistance / 2 };
  }
  const viewport = win.visualViewport;
  if (viewport) return { left: viewport.offsetLeft, top: viewport.offsetTop,
    right: viewport.offsetLeft + viewport.width, bottom: viewport.offsetTop + viewport.height };
  return { left: 0, top: 0, right: win.document.documentElement.clientWidth, bottom: win.document.documentElement.clientHeight };
}
