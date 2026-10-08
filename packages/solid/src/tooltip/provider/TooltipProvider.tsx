import type { JSX } from '@solidjs/web';
import { FloatingDelayGroup } from '../../floating-ui-react/components/FloatingDelayGroup';
import { TooltipProviderContext } from './TooltipProviderContext';

/** Shares hover delays and the instant-opening window between tooltips. */
export function TooltipProvider(props: TooltipProviderProps): JSX.Element {
  return (
    <TooltipProviderContext value={() => props.delay}>
      <FloatingDelayGroup delay={{ open: props.delay, close: props.closeDelay }} timeoutMs={props.timeout ?? 400}>
        {props.children}
      </FloatingDelayGroup>
    </TooltipProviderContext>
  );
}
export interface TooltipProviderState {}
export interface TooltipProviderProps {
  children?: JSX.Element;
  delay?: number;
  closeDelay?: number;
  timeout?: number;
}
export namespace TooltipProvider {
  export type State = TooltipProviderState;
  export type Props = TooltipProviderProps;
}
