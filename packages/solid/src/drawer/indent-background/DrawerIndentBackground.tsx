import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { useDrawerProviderContext } from '../provider/DrawerProviderContext';
export function DrawerIndentBackground(props: DrawerIndentBackgroundProps) {
  const provider = useDrawerProviderContext();
  return createRenderElement('div', props, {
    state: { get active() { return provider?.active ?? false; } },
    stateAttributesMapping: { active: value => ({ [value ? 'data-active' : 'data-inactive']: '' }) },
    props: omit(props, 'render', 'class', 'style'),
  });
}
export interface DrawerIndentBackgroundState { active: boolean }
export interface DrawerIndentBackgroundProps extends BaseUIComponentProps<'div', DrawerIndentBackgroundState> {}
export namespace DrawerIndentBackground { export type Props = DrawerIndentBackgroundProps; export type State = DrawerIndentBackgroundState; }
import { omit } from 'solid-js';
