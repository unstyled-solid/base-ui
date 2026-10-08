import type { JSX } from '@solidjs/web';
/** Native action. */
export declare function Action(props: Action.Props): JSX.Element;
export interface ActionProps extends Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  /** Ignore interaction.
   * @default false
   */
  disabled?: boolean;
  onChange?: (value: string, details: ChangeDetails) => void;
}
export interface ActionState { disabled: boolean }
export interface ChangeDetails { event: MouseEvent; cancel(): void }
export declare namespace Action {
  type Props = ActionProps;
  type State = ActionState;
}
export declare namespace ActionDataAttributes {
  /** Present when disabled. */
  const disabled: 'data-disabled';
}
export declare namespace ActionCssVars {
  /** Measured width. */
  const width: '--action-width';
}
export declare function Generic<T>(props: GenericProps<T>): JSX.Element;
export interface GenericProps<T> { value: T; onValueChange?: (value: T) => void }
export declare namespace Compound {
  function Root(props: ActionProps): JSX.Element;
  function Trigger(props: GenericProps<string>): JSX.Element;
  type State = ActionState;
}
export { Action as AliasedAction };
export declare function helper(value: string): number;
export type OnlyType = { native: KeyboardEvent };
