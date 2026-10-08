import type { JSX } from '@solidjs/web';
import { PreviewCard } from './index';

export interface CardFixtureProps {
  variant?: 'contained' | 'detached' | 'multiple detached';
  root?: PreviewCard.Root.Props<number>;
  trigger?: PreviewCard.Trigger.Props<number>;
  portal?: PreviewCard.Portal.Props;
  positioner?: PreviewCard.Positioner.Props;
  popup?: PreviewCard.Popup.Props;
  viewport?: boolean;
  children?: JSX.Element;
}

export function CardFixture(props: CardFixtureProps) {
  const handle = PreviewCard.createHandle<number>();
  function Triggers() {
    return <>
      <PreviewCard.Trigger href="#preview-card-link" id="trigger-1" payload={1}
        handle={props.variant === 'contained' ? undefined : handle} {...props.trigger}>Link</PreviewCard.Trigger>
      {props.variant === 'multiple detached' && <PreviewCard.Trigger href="#other" id="trigger-2" payload={2} handle={handle}>Other link</PreviewCard.Trigger>}
    </>;
  }
  return <>
    {props.variant !== 'contained' && <Triggers />}
    <PreviewCard.Root handle={props.variant === 'contained' ? undefined : handle} {...props.root}>
      {(context) => <>
        {props.variant === 'contained' && <Triggers />}
        <span data-testid="payload">{context.payload ?? 'none'}</span>
        <PreviewCard.Portal {...props.portal}>
          <PreviewCard.Backdrop data-testid="backdrop" />
          <PreviewCard.Positioner data-testid="positioner" {...props.positioner}>
            <PreviewCard.Popup data-testid="popup" {...props.popup}>
              <PreviewCard.Arrow data-testid="arrow" />
              {props.viewport ? <PreviewCard.Viewport data-testid="viewport">Content {context.payload}</PreviewCard.Viewport> : 'Content'}
              {props.children}
            </PreviewCard.Popup>
          </PreviewCard.Positioner>
        </PreviewCard.Portal>
      </>}
    </PreviewCard.Root>
  </>;
}
