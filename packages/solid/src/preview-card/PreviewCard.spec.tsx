import type { ComponentProps } from '@solidjs/web';
import { expectType } from '../../test';
import { PreviewCard } from './index';

const handle = PreviewCard.createHandle<number>();
<PreviewCard.Root handle={handle}><PreviewCard.Portal /></PreviewCard.Root>;
<PreviewCard.Root handle={handle}>{(context) => {
  expectType<number | undefined, typeof context.payload>(context.payload);
  return <span>{context.payload}</span>;
}}</PreviewCard.Root>;
<PreviewCard.Trigger handle={handle} payload={42} />;
<PreviewCard.Trigger handle={handle} />;
// @ts-expect-error A handle fixes its payload type.
<PreviewCard.Trigger handle={handle} payload="invalid" />;
<PreviewCard.Trigger render={(props) => {
  expectType<ComponentProps<'a'>['href'], typeof props.href>(props.href);
  return <a {...props} />;
}} />;
// @ts-expect-error keepMounted belongs to Portal.
<PreviewCard.Positioner keepMounted />;
<PreviewCard.Root actionsRef={(actions) => { actions?.close(); actions?.unmount(); }} />;
// @ts-expect-error Solid uses class, not className.
<PreviewCard.Popup className="react-only" />;
<PreviewCard.Positioner anchor={() => null} sideOffset={({ anchor, positioner }) => anchor.width + positioner.width} />;
