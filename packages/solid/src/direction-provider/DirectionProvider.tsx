import type { JSX } from '@solidjs/web';
import { DirectionContext, type TextDirection } from '../internals/direction-context';
export interface DirectionProviderProps { children?: JSX.Element; direction?: TextDirection | undefined }
export interface DirectionProviderState {}
export function DirectionProvider(props: DirectionProviderProps): JSX.Element {
  return <DirectionContext value={() => props.direction ?? 'ltr'}>{props.children}</DirectionContext>;
}
export namespace DirectionProvider {
  export type Props = DirectionProviderProps;
  export type State = DirectionProviderState;
}
