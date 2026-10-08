import { expect, describe } from 'vitest';
import { createRenderer, browserCase, waitFor } from '../../../test';
import { Tabs } from '../test/TabsFixture';

describe('Tabs browser activation', () => {
  const { renderProps } = createRenderer();
  for (const orientation of ['horizontal', 'vertical'] as const) {
    browserCase({ source: 'packages/react/src/tabs/root/TabsRoot.test.tsx', case: `controlled direction after refusal, null, and same-update insertion (${orientation})`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
      const view = await renderProps((p: { value: string | null; added: boolean }) => <Tabs.Root value={p.value} orientation={orientation} data-testid="root">
        <Tabs.List style={{ display: 'flex', 'flex-direction': orientation === 'horizontal' ? 'row' : 'column' }}>
          <Tabs.Tab value="Overview">Overview</Tabs.Tab><Tabs.Tab value="Projects">Projects</Tabs.Tab>
          {p.added && <Tabs.Tab value="Account">Account</Tabs.Tab>}
        </Tabs.List>
        <Tabs.Panel value="Overview">Overview panel</Tabs.Panel>
        <Tabs.Panel value="Projects">Projects panel</Tabs.Panel>
        {p.added && <Tabs.Panel value="Account" data-testid="new-panel">Account panel</Tabs.Panel>}
      </Tabs.Root>, { value: 'Overview' as string | null, added: false });
      const root = view.getByTestId('root');
      await view.user.click(view.getByRole('tab', { name: 'Projects' }));
      expect(root).toHaveAttribute('data-activation-direction', 'none');
      await view.setProps({ value: 'Projects' });
      expect(root).toHaveAttribute('data-activation-direction', orientation === 'horizontal' ? 'right' : 'down');
      await view.setProps({ value: null });
      expect(root).toHaveAttribute('data-activation-direction', 'none');
      await view.setProps({ value: 'Overview' });
      expect(root).toHaveAttribute('data-activation-direction', 'none');
      // Alphabetic order is deliberately opposite to physical order.
      await view.setProps({ value: 'Account', added: true });
      await waitFor(() => expect(root).toHaveAttribute('data-activation-direction', orientation === 'horizontal' ? 'right' : 'down'));
      expect(view.getByTestId('new-panel')).toHaveAttribute('data-activation-direction', orientation === 'horizontal' ? 'right' : 'down');
    });
  }
});
