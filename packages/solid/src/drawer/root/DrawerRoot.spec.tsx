import { Drawer } from '../index';
import type { DialogHandle } from '../../dialog/store/DialogHandle';

type Details = Parameters<NonNullable<Drawer.Root.Props['onOpenChange']>>[1];
type SwipeEvent = Extract<Details, { reason: 'swipe' }>['event'];
const swipeEvent: SwipeEvent = new PointerEvent('pointerdown');
void swipeEvent;
function narrow(details: Details) {
  if (details.reason === 'swipe') {
    const event: PointerEvent | TouchEvent = details.event;
    // @ts-expect-error swipe details cannot contain keyboard events
    const keyboard: KeyboardEvent = details.event;
    void event; void keyboard;
  }
  if (details.reason === 'escape-key') { const event: KeyboardEvent = details.event; void event; }
  if (details.reason === 'close-watcher') { const event: Event = details.event; void event; }
}
const handle = Drawer.createHandle<{ id: number }>();
const parts = <Drawer.Provider><Drawer.Indent /><Drawer.IndentBackground /><Drawer.Root handle={handle} onOpenChange={(_, details) => narrow(details)} snapPoints={[0.5, '30rem', '148px']}>
  {context => <><Drawer.Trigger handle={handle} payload={{ id: 1 }} /><Drawer.SwipeArea /><Drawer.VirtualKeyboardProvider><Drawer.Portal container={null}><Drawer.Viewport><Drawer.Backdrop forceRender /><Drawer.Popup initialFocus={false}><Drawer.Title>Title</Drawer.Title><Drawer.Description>Description</Drawer.Description><Drawer.Content>{context.payload?.id}<Drawer.Close /></Drawer.Content></Drawer.Popup></Drawer.Viewport></Drawer.Portal></Drawer.VirtualKeyboardProvider></>}
</Drawer.Root></Drawer.Provider>;
void parts;
declare const dialogHandle: DialogHandle<{ id: number }>;
// @ts-expect-error handles preserve the source Drawer nominal brand
const drawerHandle: Drawer.Handle<{ id: number }> = dialogHandle;
void drawerHandle;
