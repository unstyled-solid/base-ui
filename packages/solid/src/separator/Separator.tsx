import { omit } from 'solid-js';
import type { BaseUIComponentProps, Orientation } from '../internals/types';
import { createRenderElement } from '../internals/createRenderElement';

/**
 * A separator element accessible to screen readers.
 * Renders a `<div>` element.
 */
export function Separator(componentProps: Separator.Props) {
  const orientation = () =>
    componentProps.orientation === undefined ? 'horizontal' : componentProps.orientation;
  const state: SeparatorState = {
    get orientation() {
      return orientation();
    },
  };
  const elementProps = omit(componentProps, 'class', 'render', 'orientation', 'style');

  return createRenderElement('div', componentProps, {
    state,
    props: [
      {
        role: 'separator',
        get 'aria-orientation'() {
          return orientation();
        },
      },
      elementProps,
    ],
  });
}

export interface SeparatorProps extends BaseUIComponentProps<'div', SeparatorState> {
  /**
   * The orientation of the separator.
   * @default 'horizontal'
   */
  orientation?: Orientation | undefined;
}

export interface SeparatorState {
  /** The orientation of the separator. */
  orientation: Orientation;
}

export namespace Separator {
  export type Props = SeparatorProps;
  export type State = SeparatorState;
}
