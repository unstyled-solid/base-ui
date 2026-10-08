import { Tooltip } from './index';

const handle = Tooltip.createHandle<{ label: string }>();
<Tooltip.Trigger handle={handle} payload={{ label: 'Tooltip' }} render={props => <button {...props} />} />;
<Tooltip.Trigger render={props => <input {...props} />} />;
<Tooltip.Root handle={handle}>{state => <Tooltip.Portal><Tooltip.Positioner>
  <Tooltip.Popup><Tooltip.Viewport>{state.payload?.label}</Tooltip.Viewport></Tooltip.Popup>
</Tooltip.Positioner></Tooltip.Portal>}</Tooltip.Root>;
// @ts-expect-error keepMounted belongs to Portal, not Positioner.
<Tooltip.Positioner keepMounted />;
// @ts-expect-error payload must match the handle's payload type.
<Tooltip.Trigger handle={handle} payload={42} />;
<Tooltip.Root onOpenChange={(_, details) => {
  if (details.reason === 'escape-key') details.event.key;
  details.cancel(); details.allowPropagation(); details.preventUnmountOnClose();
}} />;
