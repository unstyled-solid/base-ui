import { describe, expect, it } from 'vitest';
import { createSignal } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { screen } from '@solidjs/testing-library';
import { createRenderer, describeConformance, browserCase } from '../../test';
import type { ConformantComponentProps } from '../../test/describeConformance';
import { Drawer } from './index';
import type { DrawerPopupProps, DrawerPopupState } from './popup/DrawerPopup';
import type { DrawerViewportProps, DrawerViewportState } from './viewport/DrawerViewport';
import type { DrawerSwipeAreaProps, DrawerSwipeAreaState } from './swipe-area/DrawerSwipeArea';
import { DialogTrigger } from '../dialog/trigger/DialogTrigger';
import { DialogClose } from '../dialog/close/DialogClose';
import { DialogTitle } from '../dialog/title/DialogTitle';
import { DialogDescription } from '../dialog/description/DialogDescription';
import { DialogPortal } from '../dialog/portal/DialogPortal';

function InlinePortal(props: { children?: JSX.Element }) {
  const [container, setContainer] = createSignal<HTMLDivElement | null>(null);
  return <div ref={setContainer}><Drawer.Portal container={container}>{props.children}</Drawer.Portal></div>;
}

describe('Drawer.Popup source conformance', () => {
  describeConformance<DrawerPopupState, ConformantComponentProps<DrawerPopupState, HTMLDivElement>, HTMLDivElement>(
    props => <Drawer.Root open modal={false}><InlinePortal><Drawer.Viewport><Drawer.Popup {...props} id={typeof props.id === 'string' ? props.id : undefined} render={props.render as DrawerPopupProps['render']} /></Drawer.Viewport></InlinePortal></Drawer.Root>,
    { initialProps: {}, refInstanceof: HTMLDivElement, click: 'dispatch' },
  );
});
describe('Drawer.Viewport source conformance', () => {
  describeConformance<DrawerViewportState, ConformantComponentProps<DrawerViewportState, HTMLDivElement>, HTMLDivElement>(
    props => <Drawer.Root open modal={false}><InlinePortal><Drawer.Viewport {...props} render={props.render as DrawerViewportProps['render']} /></InlinePortal></Drawer.Root>,
    { initialProps: {}, refInstanceof: HTMLDivElement, click: 'dispatch' },
  );
});
describe('Drawer.SwipeArea source conformance', () => {
  describeConformance<DrawerSwipeAreaState, ConformantComponentProps<DrawerSwipeAreaState, HTMLDivElement>, HTMLDivElement>(
    props => <Drawer.Root><Drawer.SwipeArea {...props} render={props.render as DrawerSwipeAreaProps['render']} /></Drawer.Root>,
    { initialProps: {}, refInstanceof: HTMLDivElement, click: 'dispatch' },
  );
});

describe('Drawer borrowed parts and live DOM', () => {
  const { render, renderProps } = createRenderer();
  it('retains the actual Dialog aliases', () => {
    expect(Drawer.Trigger).toBe(DialogTrigger);
    expect(Drawer.Close).toBe(DialogClose);
    expect(Drawer.Title).toBe(DialogTitle);
    expect(Drawer.Description).toBe(DialogDescription);
    expect(Drawer.Portal).toBe(DialogPortal);
  });
  it('applies native pointer/selection CSS defaults on stable parts', async () => {
    const view = await renderProps((props: { disabled: boolean; direction: 'left' | 'up' }) => <Drawer.Root>
      <Drawer.SwipeArea data-testid="area" disabled={props.disabled} swipeDirection={props.direction} />
      <Drawer.Portal keepMounted><Drawer.Backdrop data-testid="backdrop" /><Drawer.Viewport><Drawer.Popup /></Drawer.Viewport></Drawer.Portal>
    </Drawer.Root>, { disabled: true, direction: 'up' as 'left' | 'up' });
    const area = screen.getByTestId('area'), backdrop = screen.getByTestId('backdrop');
    expect(area.style.pointerEvents).toBe('none');
    expect(backdrop.style.pointerEvents).toBe('none');
    expect(backdrop.style.userSelect).toBe('none');
    await view.setProps({ disabled: false, direction: 'left' });
    expect(screen.getByTestId('area')).toBe(area);
    expect(area.style.pointerEvents).toBe('');
  });
  browserCase({ source: 'packages/react/src/drawer/swipe-area/DrawerSwipeArea.tsx', case: 'resolveTouchAction follows live opening axis', environment: 'browser', issue: 'bsolid-browser', adaptation: 'jsdom cssstyle drops touch-action even through native setProperty; retain actual CSS assertions in browsers' }, async () => {
    const view = await renderProps((props: { direction: 'left' | 'up' }) => <Drawer.Root><Drawer.SwipeArea data-testid="area" swipeDirection={props.direction} /></Drawer.Root>, { direction: 'up' as 'left' | 'up' });
    const area = view.getByTestId('area');
    expect(area.style.getPropertyValue('touch-action')).toBe('pan-x');
    await view.setProps({ direction: 'left' });
    expect(view.getByTestId('area')).toBe(area);
    expect(area.style.getPropertyValue('touch-action')).toBe('pan-y');
  });
  it('forwards native refs, live labels, backdrop overrides and content markers on stable nodes', async () => {
    let title: HTMLHeadingElement | undefined;
    const view = await renderProps((props: { title: string; description: string; class: string }) => <Drawer.Root open modal={false}>
      <Drawer.Portal><Drawer.Backdrop data-testid="backdrop" class={props.class} style={{ 'pointer-events': 'auto', 'user-select': 'text', '-webkit-user-select': 'text' }} />
        <Drawer.Viewport><Drawer.Popup data-testid="popup"><Drawer.Title ref={node => { title = node; }}>{props.title}</Drawer.Title>
          <Drawer.Description>{props.description}</Drawer.Description><Drawer.Content data-testid="content" />
        </Drawer.Popup></Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>, { title: 'Title', description: 'Description', class: 'first' });
    const popup = screen.getByRole('dialog', { name: 'Title' });
    const backdrop = screen.getByTestId('backdrop');
    expect(title).toBe(screen.getByRole('heading'));
    expect(title!.tagName).toBe('H2');
    expect(popup).toHaveAccessibleDescription('Description');
    expect(backdrop).toHaveAttribute('role', 'presentation');
    expect(backdrop.style.pointerEvents).toBe('auto');
    expect(backdrop.style.userSelect).toBe('text');
    expect(screen.getByTestId('content')).toHaveAttribute('data-drawer-content');
    await view.setProps({ title: 'Next title', description: 'Next description', class: 'second' });
    expect(screen.getByRole('dialog', { name: 'Next title' })).toBe(popup);
    expect(popup).toHaveAccessibleDescription('Next description');
    expect(screen.getByTestId('backdrop')).toBe(backdrop);
    expect(backdrop).toHaveClass('second');
    expect(backdrop).not.toHaveClass('first');
  });
  it('suppresses nested backdrops unless forced and masks the generic viewport nested attribute', async () => {
    const view = await renderProps((props: { force: boolean }) => <Drawer.Root open modal={false}>
      <Drawer.Portal><Drawer.Viewport data-testid="parent-viewport"><Drawer.Popup>
        <Drawer.Root open modal={false}><Drawer.Portal><Drawer.Backdrop data-testid="nested-backdrop" forceRender={props.force} />
          <Drawer.Viewport><Drawer.Popup>Child</Drawer.Popup></Drawer.Viewport>
        </Drawer.Portal></Drawer.Root>
      </Drawer.Popup></Drawer.Viewport></Drawer.Portal>
    </Drawer.Root>, { force: false });
    expect(screen.queryByTestId('nested-backdrop')).toBeNull();
    expect(screen.getByTestId('parent-viewport')).not.toHaveAttribute('data-nested-dialog-open');
    await view.setProps({ force: true });
    expect(screen.getByTestId('nested-backdrop')).toHaveAttribute('data-open');
  });
  it('contains composite navigation keys while allowing ordinary keys to bubble', async () => {
    const keys: string[] = [];
    const view = await render(() => <div onKeyDown={event => keys.push(event.key)}><Drawer.Root open modal={false}>
      <Drawer.Portal><Drawer.Viewport><Drawer.Popup><input aria-label="field" /></Drawer.Popup></Drawer.Viewport></Drawer.Portal>
    </Drawer.Root></div>);
    const field = screen.getByRole('textbox');
    field.focus();
    await view.user.keyboard('{ArrowDown}a');
    expect(keys).toEqual(['a']);
  });
});
