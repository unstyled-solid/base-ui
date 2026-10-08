import { NavigationMenu } from './index';
import { expectType } from '../../test';
import type { JSX } from '@solidjs/web';
<NavigationMenu.Root value="a" onValueChange={(value) => { expectType<string | null, typeof value>(value); }} />;
<NavigationMenu.Root defaultValue={1} onValueChange={(value) => { expectType<number | null, typeof value>(value); }} />;
<NavigationMenu.Root<'a' | 'b'> value="a" />;
<NavigationMenu.Root<'a' | 'b'> onValueChange={(value) => { expectType<'a' | 'b' | null, typeof value>(value); }} />;
<NavigationMenu.Root onValueChange={(value) => { expectType<any, typeof value>(value); }} />;
// @ts-expect-error explicit generic rejects unrelated values
<NavigationMenu.Root<'a' | 'b'> value="c" />;
<NavigationMenu.Link render={(props) => {
  expectType<JSX.AnchorHTMLAttributes<HTMLAnchorElement>['href'], typeof props.href>(props.href);
  return <a {...props} />;
}} />;
export function Wrapper<Value>(props: NavigationMenu.Root.Props<Value>) { return <NavigationMenu.Root {...props} />; }
