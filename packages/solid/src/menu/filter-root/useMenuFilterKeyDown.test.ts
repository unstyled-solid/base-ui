import { describe, expect, it } from 'vitest';
import { getMenuFilterKeyAction, type MenuFilterKeyAction } from './useMenuFilterKeyDown';
type Key = Parameters<typeof getMenuFilterKeyAction>[0];
const key = (value: string, init: Partial<Key> = {}): Key => ({ key: value, which: 0, shiftKey: false, ctrlKey: false, altKey: false, metaKey: false, ...init });
type Case = [string, Key, boolean, boolean, MenuFilterKeyAction, boolean?];
describe('Menu filter input key ownership (pinned source table)', () => {
  it.each<Case>([
    ['IME composition', key('Enter', { which: 229 }), true, true, 'ignore'],
    ['Tab', key('Tab'), true, false, 'ignore'],
    ['Shift+Tab', key('Tab', { shiftKey: true }), false, false, 'close'],
    ['Enter on a highlight', key('Enter'), true, false, 'activate'],
    ['Enter without a highlight', key('Enter'), false, true, 'navigate'],
    ['character', key('a'), true, false, 'edit'],
    ['Space', key(' '), true, false, 'edit'],
    ['Shift+ArrowDown', key('ArrowDown', { shiftKey: true }), true, true, 'edit'],
    ['Ctrl+ArrowLeft', key('ArrowLeft', { ctrlKey: true }), true, true, 'edit'],
    ['Shift+Escape', key('Escape', { shiftKey: true }), true, true, 'navigate'],
    ['ArrowDown', key('ArrowDown'), false, true, 'navigate'],
    ['Home without highlight', key('Home'), false, false, 'edit'],
    ['Home in empty input', key('Home'), true, false, 'navigate'],
    ['Home in nonempty input', key('Home'), true, true, 'edit'],
    ['submenu entry', key('ArrowRight'), true, true, 'submenu', true],
    ['submenu exit', key('ArrowLeft'), true, false, 'submenu', true],
    ['cross axis with value', key('ArrowRight'), true, true, 'edit'],
    ['cross axis without value', key('ArrowLeft'), true, false, 'navigate'],
    ['input caret with value', key('ArrowLeft'), false, true, 'edit'],
    ['empty input cross axis', key('ArrowLeft'), false, false, 'navigate'],
    ['Escape', key('Escape'), true, true, 'navigate'],
  ])('vertical: %s', (_, event, hasActiveItem, hasValue, expected, activeItemOpensSubmenu = false) => {
    expect(getMenuFilterKeyAction(event, { orientation: 'vertical', rtl: false, hasActiveItem, hasValue, activeItemOpensSubmenu })).toBe(expected);
  });
  it.each<Case>([
    ['ArrowDown without highlight', key('ArrowDown'), false, true, 'enter-list'],
    ['ArrowUp without highlight', key('ArrowUp'), false, false, 'enter-list'],
    ['ArrowDown submenu', key('ArrowDown'), true, true, 'submenu', true],
    ['ArrowDown on item', key('ArrowDown'), true, true, 'edit'],
    ['ArrowRight nonempty input', key('ArrowRight'), false, true, 'edit'],
    ['ArrowRight empty input', key('ArrowRight'), false, false, 'navigate'],
    ['ArrowRight highlight', key('ArrowRight'), true, true, 'navigate'],
  ])('horizontal: %s', (_, event, hasActiveItem, hasValue, expected, activeItemOpensSubmenu = false) => {
    expect(getMenuFilterKeyAction(event, { orientation: 'horizontal', rtl: false, hasActiveItem, hasValue, activeItemOpensSubmenu })).toBe(expected);
  });
  it.each(['ArrowLeft', 'ArrowRight'])('RTL submenu owns %s', arrow => {
    expect(getMenuFilterKeyAction(key(arrow), { orientation: 'vertical', rtl: true, hasActiveItem: true, hasValue: true, activeItemOpensSubmenu: true })).toBe('submenu');
  });
});
