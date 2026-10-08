import type { JSX } from '@solidjs/web';
import { Menubar } from './Menubar';

// Framework-native public adaptation: component handlers are preventable native
// div events; render output can be forwarded to an ordinary Solid div handler.
export function MenubarNativeHostTypes() {
  return <Menubar ref={(node) => {
    const host: HTMLDivElement = node;
    void host;
  }} onKeyDown={(event) => {
    const host: HTMLDivElement = event.currentTarget;
    event.preventBaseUIHandler();
    void host;
  }} render={(props, state) => {
    const handler: JSX.HTMLAttributes<HTMLDivElement>['onKeyDown'] = props.onKeyDown;
    const inspect: Extract<NonNullable<typeof props.onKeyDown>, (event: never) => unknown> = (event) => {
      const host: HTMLDivElement = event.currentTarget;
      // @ts-expect-error A div render callback must not advertise input currentTarget.
      const input: HTMLInputElement = event.currentTarget;
      // @ts-expect-error Render output accepts an ordinary native event.
      event.preventBaseUIHandler();
      void host;
      void input;
    };
    void inspect;
    return <div {...props} ref={(node) => props.ref?.(node)} onKeyDown={handler} data-orientation={state.orientation} />;
  }} />;
}
