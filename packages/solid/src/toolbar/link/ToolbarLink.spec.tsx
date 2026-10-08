import { expectType } from '../../../test';
import type { ComponentProps } from '@solidjs/web';
import { Toolbar } from '../index';

// Solid native anchor props, including the RC13 nullable href union, are retained.
<Toolbar.Link render={(props) => {
  expectType<ComponentProps<'a'>['href'], typeof props.href>(props.href);
  return <a {...props} />;
}} />;
