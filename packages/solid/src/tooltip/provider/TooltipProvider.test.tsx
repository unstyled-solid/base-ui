import { beforeEach, describe, expect, vi } from 'vitest';
import { createRenderer, screen, fireEvent, advanceTimers, sourceCase, waitFor } from '../../../test';
import { Tooltip } from '../index';
import { Fixture, hover, settle, upstream } from '../Tooltip.test-utils';

const { render, renderProps } = createRenderer();
const source = `${upstream}provider/TooltipProvider.test.tsx`;
const check = (title: string, run: () => Promise<void>) => sourceCase({ source, case: title, environment: 'jsdom' }, run);
describe('Tooltip.Provider', () => {
  // Only provider/hover delays are virtual; native geometry observers keep
  // their real animation-frame clock.
  beforeEach(() => vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] }));
  for (const [providerDelay, triggerDelay, expectedDelay] of [[10000, undefined, 10000], [0, undefined, 0], [10, 100, 100], [0, 100, 100]] as const) {
    check(`delay provider=${providerDelay}/trigger=${triggerDelay}`, async () => {
      const view = await render(() => <Tooltip.Provider delay={providerDelay}><Fixture trigger={{ delay: triggerDelay }} /></Tooltip.Provider>);
      hover(screen.getByText('Toggle'));
      if (expectedDelay) expect(screen.queryByText('Content')).toBeNull();
      if (expectedDelay) {
        if (expectedDelay === 10000) {
          await advanceTimers(1000); expect(screen.queryByText('Content')).toBeNull();
          await advanceTimers(8999);
        } else await advanceTimers(expectedDelay - 1);
        expect(screen.queryByText('Content')).toBeNull();
        await advanceTimers(1);
      } else await advanceTimers(0);
      expect(screen.getByText('Content')).toBeInTheDocument(); view.unmount();
    });
  }
  for (const triggerCloseDelay of [undefined, 0, 200]) {
    check(`uses the latest closeDelay after the prop updates/trigger=${triggerCloseDelay}`, async () => {
      const view = await renderProps((props: { closeDelay: number }) => <Tooltip.Provider delay={0} closeDelay={props.closeDelay}>
        <Fixture trigger={{ closeDelay: triggerCloseDelay }} />
      </Tooltip.Provider>, { closeDelay: 400 });
      const trigger = screen.getByText('Toggle'); hover(trigger); await settle();
      expect(screen.getByText('Content')).toBeInTheDocument();
      await view.setProps({ closeDelay: 1000 });
      fireEvent.mouseLeave(trigger); await settle();
      const delay = triggerCloseDelay ?? 1000;
      if (delay) { await advanceTimers(delay - 1); expect(screen.getByText('Content')).toBeInTheDocument(); await advanceTimers(1); }
      expect(screen.queryByText('Content')).toBeNull(); view.unmount();
    });
  }
  for (const timeout of [undefined, 0, 400, 1000]) {
    check(`adjacent instant opening, sibling close and full-delay reset/timeout=${timeout}`, async () => {
      const view = await render(() => <Tooltip.Provider delay={100} timeout={timeout}>
        {['One', 'Two'].map(name => <Tooltip.Root>
          <Tooltip.Trigger>{name}</Tooltip.Trigger>
          <Tooltip.Portal><Tooltip.Positioner><Tooltip.Popup>{`Content ${name}`}</Tooltip.Popup></Tooltip.Positioner></Tooltip.Portal>
        </Tooltip.Root>)}
      </Tooltip.Provider>);
      const first = screen.getByText('One'); const second = screen.getByText('Two');
      hover(first); await advanceTimers(100);
      expect(screen.getByText('Content One')).toBeInTheDocument();
      hover(second); await advanceTimers(0);
      expect(screen.getByText('Content Two')).toBeInTheDocument();
      expect(screen.queryByText('Content One')).toBeNull();
      fireEvent.mouseLeave(second); await settle(); await advanceTimers(timeout ?? 400);
      hover(first); await advanceTimers(99); expect(screen.queryByText('Content One')).toBeNull();
      await advanceTimers(1); expect(screen.getByText('Content One')).toBeInTheDocument(); view.unmount();
    });
  }
  check('respects a trigger delay over delay=0 outside the instant phase', async () => {
    const view = await render(() => <Tooltip.Provider delay={0} timeout={400}>
      {['One', 'Two'].map(name => <Tooltip.Root><Tooltip.Trigger delay={100}>{name}</Tooltip.Trigger>
        <Tooltip.Portal><Tooltip.Positioner><Tooltip.Popup>{`Content ${name}`}</Tooltip.Popup></Tooltip.Positioner></Tooltip.Portal>
      </Tooltip.Root>)}
    </Tooltip.Provider>);
    const first = screen.getByText('One'); const second = screen.getByText('Two');
    hover(first); await advanceTimers(99); expect(screen.queryByText('Content One')).toBeNull();
    await advanceTimers(1); expect(screen.getByText('Content One')).toBeInTheDocument();
    fireEvent.mouseLeave(first); hover(second); await advanceTimers(0);
    expect(screen.getByText('Content Two')).toBeInTheDocument();
    expect(screen.queryByText('Content One')).toBeNull();
    fireEvent.mouseLeave(second); await settle(); await advanceTimers(400);
    hover(first); await advanceTimers(99); expect(screen.queryByText('Content One')).toBeNull();
    await advanceTimers(1); expect(screen.getByText('Content One')).toBeInTheDocument(); view.unmount();
  });
  check('waits for the closeDelay before hiding the tooltip', async () => {
    const view = await render(() => <Tooltip.Provider closeDelay={400}><Fixture /></Tooltip.Provider>);
    const trigger = screen.getByText('Toggle');
    fireEvent.mouseEnter(trigger); fireEvent.mouseMove(trigger);
    await advanceTimers(600);
    expect(screen.getByText('Content')).toBeInTheDocument();
    fireEvent.mouseLeave(trigger);
    await advanceTimers(300);
    expect(screen.getByText('Content')).toBeInTheDocument();
    await advanceTimers(300);
    await waitFor(() => expect(screen.queryByText('Content')).toBeNull());
    view.unmount();
  });
});
