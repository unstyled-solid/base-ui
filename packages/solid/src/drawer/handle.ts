import { DialogHandle } from '../dialog/store/DialogHandle';
export class DrawerHandle<Payload = unknown> extends DialogHandle<Payload> {
  declare private readonly __drawerBrand: never;
}
export function createDrawerHandle<Payload = unknown>(): DrawerHandle<Payload> { return new DrawerHandle<Payload>(); }
