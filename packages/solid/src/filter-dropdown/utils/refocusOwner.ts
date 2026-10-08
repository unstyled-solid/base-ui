let refocusing = false;
/** Focus events dispatch synchronously, including events seen by enclosing popups. */
export function refocusOwner(owner: HTMLElement) {
  const previous = refocusing;
  refocusing = true;
  try { owner.focus({ preventScroll: true }); } finally { refocusing = previous; }
}
export function isRefocusingOwner() { return refocusing; }
