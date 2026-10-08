import { createMemo } from 'solid-js';
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
  function Content(contentProps: { payload: { payload: Payload | undefined } }): JSX.Element {
    const content = createMemo(() => {
      const children = props.children;
      const resolvedChildren = typeof children === 'function' && 'toArray' in children
        && typeof children.toArray === 'function';
      return typeof children === 'function' && !resolvedChildren ? children(contentProps.payload) : children;
    });
    return <>{content()}</>;
  }
  return <MenuRootInternal {...props} virtualFocus virtualFocusRef={focusOwner}
    allowEscape={!props.autoHighlight} resetOnPointerLeave={props.autoHighlight !== 'always'} webkitItemSelected={!hydrating() && platform.engine.webkit}>
    {payload => <MenuFilterDropdown {...props}><Content payload={payload} /></MenuFilterDropdown>}
  </MenuRootInternal>;
}
