import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';

/** Suite assignment is a guard against omissions, not a behavioral pass ledger. */
export const menuSourceStages = {
  'bsolid-c-menu': [
    'root/MenuRoot.test.tsx', 'root/MenuRoot.detached-triggers.test.tsx', 'root/MenuRoot.triggerless.test.tsx', 'root/MenuRoot.spec.tsx',
    'trigger/MenuTrigger.test.tsx', 'portal/MenuPortal.test.tsx', 'positioner/MenuPositioner.test.tsx', 'positioner/MenuPositioner.spec.tsx',
    'popup/MenuPopup.test.tsx', 'popup/MenuPopupEnterTransition.test.tsx', 'popup/MenuPopupTransitionState.test.tsx',
    'arrow/MenuArrow.test.tsx', 'backdrop/MenuBackdrop.test.tsx',
  ],
  'bsolid-c-menu-items': [
    'item/MenuItem.test.tsx', 'link-item/MenuLinkItem.test.tsx', 'link-item/MenuLinkItem.spec.tsx',
    'checkbox-item/MenuCheckboxItem.test.tsx', 'checkbox-item-indicator/MenuCheckboxItemIndicator.test.tsx',
    'radio-group/MenuRadioGroup.test.tsx', 'radio-item/MenuRadioItem.test.tsx', 'radio-item-indicator/MenuRadioItemIndicator.test.tsx',
    'group/MenuGroup.test.tsx', 'group-label/MenuGroupLabel.test.tsx', 'viewport/MenuViewport.test.tsx',
    'submenu-trigger/MenuSubmenuTrigger.test.tsx', 'submenu-trigger/MenuSubmenuTrigger.voiceOver.test.tsx', 'submenu-trigger/MenuSubmenuTrigger.screenReaderPress.test.tsx',
  ],
  'bsolid-c-menu-filtering': [
    'list/MenuList.test.tsx', 'filter-root/MenuFilterParts.test.tsx', 'filter-root/MenuFilterPopup.test.tsx',
    'filter-root/MenuFilterGroup.test.tsx', 'filter-root/MenuFilterRoot.test.tsx', 'filter-root/MenuFilterRoot.scoping.test.tsx',
    'filter-root/MenuFilterRoot.initialHighlight.test.tsx', 'filter-root/MenuFilterRoot.webkit.test.tsx', 'filter-root/MenuFilterRoot.react17.test.tsx',
    'filter-root/useMenuFilterItem.test.tsx', 'filter-root/useMenuFilterSubmenuTrigger.test.tsx', 'filter-root/useMenuFilterKeyDown.test.ts',
    'filter-submenu-root/MenuFilterSubmenuRoot.test.tsx', 'filter-submenu-root/MenuFilterSubmenuRoot.pointerFocus.test.tsx',
  ],
} as const;
it('Menu assigns every actual pinned source suite to an open stage', () => {
  const root = resolve('upstream/base-ui/packages/react/src/menu');
  const actual = readdirSync(root, { recursive: true, encoding: 'utf8' }).filter(path => /\.(test|spec)\.tsx?$/.test(path)).sort();
  const assigned = Object.values(menuSourceStages).flat().sort();
  expect(assigned).toEqual(actual);
});
it('Menu preserves every pinned part export and source-corresponding leaf path', () => {
  const source = readFileSync(resolve('upstream/base-ui/packages/react/src/menu/index.parts.ts'), 'utf8');
  const target = readFileSync(resolve('packages/solid/src/menu/index.parts.ts'), 'utf8');
  const exports = (text: string) => [...text.matchAll(/export\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/g)].flatMap(match => match[1].split(',').map(name => ({ name: name.trim(), path: match[2] })));
  expect(exports(target).sort((a, b) => a.name.localeCompare(b.name))).toEqual(exports(source).sort((a, b) => a.name.localeCompare(b.name)));
});
