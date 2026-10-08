import * as popupVars from '../popup/NavigationMenuPopupCssVars';
import * as positionerVars from '../positioner/NavigationMenuPositionerCssVars';
export function setSharedFixedSize(popup: HTMLElement, positioner: HTMLElement, width: number, height: number) {
  popup.style.setProperty(popupVars.popupWidth, `${width}px`);
  popup.style.setProperty(popupVars.popupHeight, `${height}px`);
  positioner.style.setProperty(positionerVars.positionerWidth, `${width}px`);
  positioner.style.setProperty(positionerVars.positionerHeight, `${height}px`);
}
export function preserveClosingSize(popup: HTMLElement, positioner: HTMLElement) {
  const width = parseFloat(positioner.style.getPropertyValue(positionerVars.positionerWidth));
  const height = parseFloat(positioner.style.getPropertyValue(positionerVars.positionerHeight));
  if (width > 0 && height > 0) setSharedFixedSize(popup, positioner, width, height);
}
