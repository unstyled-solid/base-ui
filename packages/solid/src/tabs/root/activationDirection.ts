import type { TabMap } from './TabsRootContext';
import type { TabsTab } from '../tab/TabsTab';

export function findTabElement(map: TabMap, value: TabsTab.Value): HTMLElement | null {
  for (const [element, metadata] of map) {
    if (metadata.value === value) return element as HTMLElement;
  }
  return null;
}

// Base UI 19511bb: physical geometry, not value order (except before registration).
export function computeActivationDirection(
  oldValue: TabsTab.Value, newValue: TabsTab.Value,
  orientation: 'horizontal' | 'vertical', map: TabMap,
): TabsTab.ActivationDirection {
  if (oldValue == null || newValue == null) return 'none';
  const [axis, backward, forward] = orientation === 'horizontal'
    ? ['left', 'left', 'right'] as const : ['top', 'up', 'down'] as const;
  const oldTab = findTabElement(map, oldValue);
  const newTab = findTabElement(map, newValue);
  if (!oldTab || !newTab) {
    if (oldTab !== newTab &&
      ((typeof oldValue === 'number' && typeof newValue === 'number') ||
       (typeof oldValue === 'string' && typeof newValue === 'string'))) {
      return newValue > oldValue ? forward : backward;
    }
    return 'none';
  }
  const previous = oldTab.getBoundingClientRect()[axis];
  const next = newTab.getBoundingClientRect()[axis];
  return next < previous ? backward : next > previous ? forward : 'none';
}
