import { createEffect, type Accessor, type Setter } from 'solid-js';
import { isServer } from '@solidjs/web';
import { createBaseUiId } from '../internals/createBaseUiId';
export function createRegisteredLabelId(idProp: string | undefined | Accessor<string | undefined>, setLabelId: Setter<string | undefined>): Accessor<string> {
  const id = createBaseUiId(idProp);
  if (!isServer) createEffect(id, (next) => {
    setLabelId(next);
    return () => { setLabelId((current) => current === next ? undefined : current); };
  }, { transparent: true });
  return id;
}
export { createRegisteredLabelId as useRegisteredLabelId };
