import { expect, it } from 'vitest';
import * as parts from './index.parts';
import * as menu from '../menu/index.parts';
import { Separator } from '../separator/Separator';

// These aliases inherit the corresponding Menu conformance/navigation/selection tests.
it('ContextMenu exports only source-indexed parts and shares the Menu implementations', () => {
  const aliases = ['Backdrop', 'Portal', 'Popup', 'Arrow', 'Group', 'GroupLabel', 'Item',
    'CheckboxItem', 'CheckboxItemIndicator', 'LinkItem', 'RadioGroup', 'RadioItem',
    'RadioItemIndicator', 'SubmenuRoot', 'SubmenuTrigger', 'Positioner'] as const;
  for (const part of aliases) expect(parts[part]).toBe(menu[part]);
  expect(parts.Separator).toBe(Separator);
  expect(Object.keys(parts).sort()).toEqual([...aliases, 'Root', 'Trigger', 'Separator'].sort());
});
