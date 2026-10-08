import { createMemo, createSignal, omit } from 'solid-js';
import type { BaseUIComponentProps, CompositeMetadata, Orientation } from '../../internals/types';
import { CompositeRoot } from '../../internals/composite';
import { ToolbarRootContext } from './ToolbarRootContext';

/** Groups controls into one ordered, roving-focus toolbar. */
export function ToolbarRoot(componentProps: ToolbarRootProps) {
  const elementProps = omit(componentProps, 'disabled', 'loopFocus', 'orientation', 'class', 'render', 'style', 'ref');
  const [itemMap, setItemMap] = createSignal(new Map<Node, CompositeMetadata<ToolbarRootItemMetadata>>());
  const context: ToolbarRootContext = {
    get disabled() { return componentProps.disabled ?? false; },
    get orientation() { return componentProps.orientation ?? 'horizontal'; },
  };
  const state: ToolbarRootState = context;
  const disabledIndices = createMemo(() => {
    const indices: number[] = [];
    for (const item of itemMap().values()) {
      if (item.disabled && !item.focusableWhenDisabled) indices.push(item.index);
    }
    return indices;
  });
  const defaults = {
    role: 'toolbar',
    get 'aria-orientation'() { return context.orientation; },
  };
  return (
    <ToolbarRootContext value={context}>
      <CompositeRoot<ToolbarRootItemMetadata, ToolbarRootState>
        render={componentProps.render}
        class={componentProps.class}
        style={componentProps.style}
        state={state}
        refs={[componentProps.ref]}
        props={[defaults, elementProps]}
        disabledIndices={disabledIndices()}
        loopFocus={componentProps.loopFocus}
        onMapChange={(map) => setItemMap(map)}
        orientation={context.orientation}
      />
    </ToolbarRootContext>
  );
}

export interface ToolbarRootItemMetadata {
  disabled: boolean;
  focusableWhenDisabled: boolean;
}
export type ToolbarRootOrientation = Orientation;
export interface ToolbarRootState {
  disabled: boolean;
  orientation: ToolbarRootOrientation;
}
export interface ToolbarRootProps extends BaseUIComponentProps<'div', ToolbarRootState> {
  disabled?: boolean;
  /** @default 'horizontal' */
  orientation?: ToolbarRootOrientation;
  /** Wrap keyboard focus at the ends. @default true */
  loopFocus?: boolean;
}
export namespace ToolbarRoot {
  export type ItemMetadata = ToolbarRootItemMetadata;
  export type Orientation = ToolbarRootOrientation;
  export type State = ToolbarRootState;
  export type Props = ToolbarRootProps;
}
