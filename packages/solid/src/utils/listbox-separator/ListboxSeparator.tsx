import { omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import type { BaseUIComponentProps, Orientation } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
export interface ListboxSeparatorState { readonly orientation: Orientation }
export interface ListboxSeparatorProps extends BaseUIComponentProps<'div', ListboxSeparatorState, JSX.HTMLAttributes<HTMLDivElement>> { orientation?: Orientation | undefined }
export function ListboxSeparator(props: ListboxSeparatorProps): JSX.Element {
  const state: ListboxSeparatorState = { get orientation() { return props.orientation ?? 'horizontal'; } };
  return createRenderElement<ListboxSeparatorState, HTMLDivElement>('div', props, { state,
    get ref() { return props.ref; }, props: [{ role: 'presentation' }, omit(props, 'render', 'class', 'style', 'ref', 'orientation')] });
}
export namespace ListboxSeparator { export type Props = ListboxSeparatorProps; export type State = ListboxSeparatorState }
