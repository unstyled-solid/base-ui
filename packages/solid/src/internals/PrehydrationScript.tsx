import { isServer } from '@solidjs/web';
import { createIsHydrating } from '../utils/hydration';
import { useCSPContext } from './csp-context';
export function PrehydrationScript(props: PrehydrationScript.Props) {
  const csp = useCSPContext(), hydrating = createIsHydrating();
  return <>{hydrating() && <script nonce={csp?.nonce} innerHTML={isServer ? props.script : undefined} />}</>;
}
export namespace PrehydrationScript { export interface Props { script: string } }
