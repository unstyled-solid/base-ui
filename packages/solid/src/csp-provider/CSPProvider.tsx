import type { JSX } from '@solidjs/web';
import { CSPContext, type CSPContextValue } from '../internals/csp-context';
export interface CSPProviderProps { children?: JSX.Element; nonce?: string | undefined; disableStyleElements?: boolean | undefined }
export interface CSPProviderState {}
export function CSPProvider(props: CSPProviderProps): JSX.Element {
  const value: CSPContextValue = {
    get nonce() { return props.nonce; },
    get disableStyleElements() { return props.disableStyleElements; },
  };
  return <CSPContext value={value}>{props.children}</CSPContext>;
}
export namespace CSPProvider {
  export type Props = CSPProviderProps;
  export type State = CSPProviderState;
}
