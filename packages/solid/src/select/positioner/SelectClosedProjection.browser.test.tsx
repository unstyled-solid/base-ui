import { expect, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { browserCase, createRenderer, screen, waitFor } from '../../../test';
import { Select } from '../index';

const { render } = createRenderer();
browserCase({ source: 'packages/react/src/internals/useAnchorPositioning.ts', case: 'Select retained positioner follows a moving trigger during ancestor scrolling', environment: 'browser', issue: 'bsolid-positioning' }, async () => {
  await render(() => <Select.Root defaultOpen defaultValue="a" modal={false}>
    <div data-testid="scroller" style={{ position: 'fixed', top: '100px', left: '100px', width: '300px', height: '200px', overflow: 'auto' }}>
      <div style={{ height: '600px', padding: '70px 0 0' }}><Select.Trigger><Select.Value /></Select.Trigger></div>
    </div>
    <Select.Portal><Select.Positioner data-testid="positioner" alignItemWithTrigger={false} side="bottom" align="start" collisionAvoidance={{ side: 'none', align: 'none' }}>
      <Select.Popup><Select.Item value="a">a</Select.Item><Select.Item value="b">b</Select.Item></Select.Popup>
    </Select.Positioner></Select.Portal>
  </Select.Root>);
  const positioner = screen.getByTestId('positioner');
  await waitFor(() => expect(positioner.style.opacity).toBe(''));
  const initialTop = positioner.getBoundingClientRect().top;
  screen.getByTestId('scroller').scrollTop = 40;
  await waitFor(() => expect(positioner.getBoundingClientRect().top).toBe(initialTop - 40));
  expect(screen.getByTestId('positioner')).toBe(positioner);
  expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
});

browserCase({ source: 'packages/react/src/select/root/SelectRoot.test.tsx', case: 'onOpenChange cancel() prevents opening while uncontrolled: force-mounted positioner transform origin', environment: 'browser', issue: 'bsolid-browser-differential-replay' }, async () => {
  const changed = vi.fn((_open, details) => details.cancel());
  const bodyStyle = document.body.getAttribute('style');
  const htmlStyle = document.documentElement.getAttribute('style');
  await render(() => <Select.Root defaultValue="a" onOpenChange={changed}>
    <Select.Trigger><Select.Value /></Select.Trigger>
    <Select.Portal><Select.Positioner data-testid="positioner" alignItemWithTrigger={false}>
      <Select.Popup><Select.Item value="a">a</Select.Item><Select.Item value="b">b</Select.Item></Select.Popup>
    </Select.Positioner></Select.Portal>
  </Select.Root>);
  await userEvent.click(screen.getByRole('combobox'));
  await waitFor(() => expect(changed).toHaveBeenCalledOnce());
  expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
  expect(screen.queryByRole('listbox')).toBeNull();
  const positioner = screen.getByTestId('positioner');
  expect(positioner).toHaveAttribute('hidden');
  expect(positioner.style.position).toBe('fixed');
  expect(positioner.style.top).toBe('0px');
  expect(positioner.style.left).toBe('0px');
  await waitFor(() => expect(positioner.style.getPropertyValue('--transform-origin')).toBe('0px 0px'));
  expect(positioner.style.opacity).toBe('0');
  expect(positioner.style.transform).toBe('');
  expect(positioner.style.getPropertyValue('--available-width')).toBe('100vw');
  expect(positioner.style.getPropertyValue('--available-height')).toBe('100vh');
  expect(positioner.style.getPropertyValue('--anchor-width')).toBe('');
  expect(positioner.style.getPropertyValue('--anchor-height')).toBe('');
  expect(document.body.getAttribute('style')).toBe(bodyStyle);
  expect(document.documentElement.getAttribute('style')).toBe(htmlStyle);
});
