import type { JSX } from '@solidjs/web';
import { Separator, SeparatorDataAttributes, type SeparatorProps, type SeparatorState } from './index';

export const separatorProps: SeparatorProps = {
  orientation: 'vertical',
  class: (state) => [state.orientation, { vertical: state.orientation === 'vertical' }],
  style: (state) => ({ display: state.orientation === 'vertical' ? 'inline-block' : 'block' }),
  render: (props, state) => <div {...props} data-orientation={state.orientation} />,
  ref: (element: HTMLDivElement) => { element.dataset.separator = ''; },
  onClick: (event) => {
    const element: HTMLDivElement = event.currentTarget;
    element.focus();
    event.preventBaseUIHandler();
  },
};

export const separatorState: Separator.State = { orientation: 'horizontal' } satisfies SeparatorState;
export const dataAttribute: 'data-orientation' = SeparatorDataAttributes.orientation;
export const separatorFixture = (): JSX.Element => <Separator {...separatorProps} />;

// @ts-expect-error Only the two source orientations are public API.
export const invalidOrientation: Separator.Props = { orientation: 'diagonal' };
// @ts-expect-error Solid composition accepts a callback, not an instantiated JSX node.
export const invalidRender: Separator.Props = { render: <div /> };
// @ts-expect-error There is no decorative mode in the pinned source API.
export const invalidDecorative: Separator.Props = { decorative: true };
// @ts-expect-error Solid uses class, not React className.
export const invalidClass: Separator.Props = { className: 'separator' };
