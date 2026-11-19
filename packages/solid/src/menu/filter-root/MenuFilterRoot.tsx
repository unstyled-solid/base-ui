import { children as resolveChildren } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { MenuRootInternal, type MenuRootProps } from '../root/MenuRoot';
import type { MenuFilterProviderOptions } from '../filter-provider/MenuFilterProviderOptions';
import { MenuFilterDropdown } from './MenuFilterDropdown';
import { platform } from '../../utils/platform';
import { createIsHydrating } from '../../utils/createIsHydrating';
export type MenuFilterRootProps<Payload = unknown> = MenuRootProps<Payload> & MenuFilterProviderOptions;
export function MenuFilterRoot<Payload = unknown>(props: MenuFilterRootProps<Payload>) {
  const focusOwner = { current: null as HTMLElement | null };
  const hydrating = createIsHydrating();
  const webkitItemSelected = () => !hydrating() && platform.engine.webkit;
  function Content(contentProps: { payload: { payload: Payload | undefined } }): JSX.Element {
    const content = resolveChildren(() => {
      const children = props.children;
      // Keep construction separate from native accessor/descendant resolution.
      const resolved = typeof children === 'function' && 'toArray' in children && typeof children.toArray === 'function';
      return typeof children === 'function' && !resolved ? <>{children(contentProps.payload)}</> : <>{children}</>;
    });
    return <>{content()}</>;
  }
  return <MenuRootInternal {...props} virtualFocus virtualFocusRef={focusOwner}
    allowEscape={!props.autoHighlight} resetOnPointerLeave={props.autoHighlight !== 'always'} webkitItemSelected={webkitItemSelected()}>
    {payload => <MenuFilterDropdown {...props}><Content payload={payload} /></MenuFilterDropdown>}
  </MenuRootInternal>;
}
