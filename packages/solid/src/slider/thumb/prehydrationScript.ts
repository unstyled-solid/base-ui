// Base UI MIT, 19511bb171f3b360b006c94cf6d07e53cb446505. Plain DOM script:
// no framework streaming markers or client-side resource ownership.
export const script = `(function(){
  const thumb = document.currentScript?.parentElement;
  const control = thumb?.closest('[data-base-ui-slider-control]');
  if (!control) return;
  const indicator = control.querySelector('[data-base-ui-slider-indicator]');
  const rect = control.getBoundingClientRect();
  const side = control.getAttribute('data-orientation') === 'vertical' ? 'height' : 'width';
  const inputs = control.querySelectorAll('input[type="range"]');
  let start = null;
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    const value = parseFloat(input.getAttribute('value') ?? '');
    const element = input.parentElement;
    if (Number.isNaN(value) || !element) return;
    const max = parseFloat(input.getAttribute('max') ?? '100');
    const min = parseFloat(input.getAttribute('min') ?? '0');
    const size = element.getBoundingClientRect()[side];
    const valuePercent = ((value - min) * 100) / (max - min);
    const offset = size / 2 + ((rect[side] - size) * valuePercent) / 100;
    const percent = (offset / rect[side]) * 100;
    element.style.setProperty('--position', percent + '%');
    if (!Number.isFinite(percent)) continue;
    element.style.removeProperty('visibility');
    if (!indicator) continue;
    if (i === 0) {
      start = percent;
      indicator.style.setProperty('--start-position', percent + '%');
      if (inputs.length === 1) indicator.style.removeProperty('visibility');
    } else if (i === inputs.length - 1) {
      indicator.style.setProperty('--end-position', percent + '%');
      indicator.style.setProperty('--relative-size', (percent - (start ?? 0)) + '%');
      indicator.style.removeProperty('visibility');
    }
  }
})();`;
