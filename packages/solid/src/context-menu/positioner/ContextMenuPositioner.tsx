import { MenuPositioner } from '../../menu/positioner/MenuPositioner';
import type { MenuPositionerProps, MenuPositionerState } from '../../menu/positioner/MenuPositioner';
import type { BaseUIComponentProps } from '../../internals/contracts/render';

export interface ContextMenuPositionerState extends MenuPositionerState {}
/** Positions against the pointer (root) or submenu trigger; the Menu engine owns defaults. */
export const ContextMenuPositioner = MenuPositioner;
export interface ContextMenuPositionerProps extends
  Omit<MenuPositionerProps, keyof BaseUIComponentProps<'div', ContextMenuPositionerState> |
    'anchor' | 'positionMethod' | 'side' | 'sideOffset' | 'align' | 'alignOffset' | 'arrowPadding'>,
  BaseUIComponentProps<'div', ContextMenuPositionerState> {
  anchor?: MenuPositionerProps['anchor'];
  /** @deprecated This prop has no effect on Context Menu. */
  positionMethod?: MenuPositionerProps['positionMethod'];
  /** @default 'bottom' (submenus: 'inline-end') */
  side?: MenuPositionerProps['side'];
  /** Root default: -5 when side is omitted and align is not center; otherwise 0. */
  sideOffset?: MenuPositionerProps['sideOffset'];
  /** @default 'start' */
  align?: MenuPositionerProps['align'];
  /** Root default: 2 when side is omitted and align is not center; otherwise 0. */
  alignOffset?: MenuPositionerProps['alignOffset'];
  /** Root context menus always use 0; submenus default to 5. */
  arrowPadding?: MenuPositionerProps['arrowPadding'];
}
export namespace ContextMenuPositioner {
  export type Props = ContextMenuPositionerProps;
  export type State = ContextMenuPositionerState;
}
