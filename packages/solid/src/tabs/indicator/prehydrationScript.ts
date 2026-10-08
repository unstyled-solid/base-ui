// Base UI MIT, 19511bb171f3b360b006c94cf6d07e53cb446505.
// Solid adaptation: only DOM siblings/roles are used, never React streaming markers.
// The shared PrehydrationScript owns CSP nonce and hydration-time removal. This
// body stays server-only through #prehydration/tabs/indicator's conditional mapping.
export const script = String.raw`(function () {
  const script = document.currentScript;
  const indicator = script && script.previousElementSibling;
  if (!indicator) return;
  const list = indicator.closest('[role="tablist"]');
  if (!list) return;
  const tab = list.querySelector('[data-active]');
  if (!tab) return;
  const style = getComputedStyle(tab);
  if (style.transform !== 'none' || style.translate !== 'none' ||
      style.rotate !== 'none' || style.scale !== 'none') return;
  function dimensions(element) {
    const css = getComputedStyle(element);
    let width = parseFloat(css.width) || 0;
    let height = parseFloat(css.height) || 0;
    if (Math.round(width) !== element.offsetWidth || Math.round(height) !== element.offsetHeight) {
      width = element.offsetWidth;
      height = element.offsetHeight;
    }
    return { width, height };
  }
  function cumulative(element) {
    let left = 0, top = 0;
    while (element) {
      left += element.offsetLeft;
      top += element.offsetTop;
      const parent = element.offsetParent;
      if (parent) { left += parent.clientLeft; top += parent.clientTop; }
      element = parent;
    }
    return { left, top };
  }
  function position() {
    const size = dimensions(tab);
    const offset = cumulative(tab);
    const parentOffset = cumulative(list);
    let left = offset.left - parentOffset.left - list.clientLeft;
    let top = offset.top - parentOffset.top - list.clientTop;
    let parent = tab.parentElement;
    while (parent && parent !== list) {
      left -= parent.scrollLeft;
      top -= parent.scrollTop;
      parent = parent.parentElement;
    }
    left = Math.min(left, list.scrollWidth - size.width);
    top = Math.min(top, list.scrollHeight - size.height);
    const values = { left, top, right: list.scrollWidth - left - size.width,
      bottom: list.scrollHeight - top - size.height, width: size.width, height: size.height };
    Object.keys(values).forEach(function (name) {
      indicator.style.setProperty('--active-tab-' + name, values[name] + 'px');
    });
    if (size.width > 0 && size.height > 0) {
      indicator.removeAttribute('hidden');
      return true;
    }
    return false;
  }
  if (position() || typeof ResizeObserver === 'undefined') return;
  let timeout;
  function stop() { observer.disconnect(); clearTimeout(timeout); }
  const observer = new ResizeObserver(function () {
    if (!indicator.isConnected || !indicator.hasAttribute('hidden') || !tab.hasAttribute('data-active')) {
      stop(); return;
    }
    if (position()) stop();
  });
  observer.observe(tab);
  timeout = setTimeout(stop, 10000);
})();`;
