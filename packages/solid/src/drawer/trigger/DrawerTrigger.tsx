import type { JSX } from '@solidjs/web';
import { DialogTrigger, type DialogTriggerProps, type DialogTriggerState } from '../../dialog/trigger/DialogTrigger';
import type { DrawerHandle } from '../handle';
export const DrawerTrigger = DialogTrigger as DrawerTrigger;
export interface DrawerTrigger { <Payload = unknown>(props: DrawerTriggerProps<Payload>): JSX.Element }
export interface DrawerTriggerProps<Payload = unknown> extends Omit<DialogTriggerProps<Payload>, 'handle'> { handle?: DrawerHandle<Payload> }
export type DrawerTriggerState = DialogTriggerState;
export namespace DrawerTrigger { export type Props<Payload = unknown> = DrawerTriggerProps<Payload>; export type State = DrawerTriggerState; }
