import { closest } from '../../utils/shadowDom';
export function findRootOwnerId(element: Element | null): string | undefined {
  return closest(element, '[data-rootownerid]')?.getAttribute('data-rootownerid') ?? undefined;
}
