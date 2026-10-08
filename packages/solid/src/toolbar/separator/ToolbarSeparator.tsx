import { Separator, type SeparatorProps, type SeparatorState } from '../../separator';
import { useToolbarRootContext } from '../root/ToolbarRootContext';

/** A separator perpendicular to its toolbar unless explicitly overridden. */
export function ToolbarSeparator(props: ToolbarSeparatorProps) {
  const root = useToolbarRootContext();
  return <Separator orientation={root.orientation === 'vertical' ? 'horizontal' : 'vertical'} {...props} />;
}
export interface ToolbarSeparatorState extends SeparatorState {}
export interface ToolbarSeparatorProps extends SeparatorProps {}
export namespace ToolbarSeparator {
  export type State = ToolbarSeparatorState;
  export type Props = ToolbarSeparatorProps;
}
