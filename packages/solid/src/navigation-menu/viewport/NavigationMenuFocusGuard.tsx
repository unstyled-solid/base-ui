import { createMergedRefs } from '../../utils/createMergedRefs';
import { FocusGuard } from '../../utils/FocusGuard';
import { useNavigationMenuRootContext } from '../root/NavigationMenuRootContext';
export function NavigationMenuFocusGuard(props: { slot: 'beforeInside' | 'afterInside' | 'beforeOutside' | 'afterOutside'; onFocus(event: FocusEvent): void }) {
  const root = useNavigationMenuRootContext();
  let previous: HTMLSpanElement | null = null;
  const ref = createMergedRefs<HTMLSpanElement>((node: HTMLSpanElement | null) => {
    if (node || root.guards[props.slot] === previous) root.guards[props.slot] = node;
    previous = node;
  });
  // React's onFocus runs on focusin, after the positioner/portal capture
  // listeners restore tabbability. Native focus runs before that restoration.
  return <FocusGuard ref={ref} onFocusIn={(event) => props.onFocus(event)} />;
}
