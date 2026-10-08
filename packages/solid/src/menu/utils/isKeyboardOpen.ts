export function isKeyboardClick(reason: string | null, event: Event | undefined): boolean {
  return (reason === 'trigger-press' || reason === 'item-press') && (event as MouseEvent | undefined)?.detail === 0;
}
export function isKeyboardOpen(reason: string | null, event: Event | undefined): boolean {
  return reason === 'list-navigation' || isKeyboardClick(reason, event);
}
