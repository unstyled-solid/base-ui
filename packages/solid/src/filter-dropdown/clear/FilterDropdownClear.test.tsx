import { createSignal } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { describe, expect, vi } from 'vitest';
import { createRenderer, describeConformance, sourceCase } from '../../../test';
import type { ConformantComponentProps } from '../../../test/describeConformance';
import { FilterDropdownClear as Clear } from './FilterDropdownClear';
import { FilterDropdownInput as Input } from '../input/FilterDropdownInput';
import { PartContext } from '../test/context';

const source = 'packages/react/src/filter-dropdown/clear/FilterDropdownClear.test.tsx';
describe('FilterDropdown Clear', () => {
  const { render } = createRenderer();
  describeConformance<Clear.State, Clear.Props & ConformantComponentProps<Clear.State>>(
    props => <PartContext value="can"><Clear {...props} /></PartContext>, { initialProps: {}, refInstanceof: HTMLButtonElement, button: true },
  );
  sourceCase({ source, case: 'does not render when the filter value is empty', environment: 'jsdom' }, async () => {
    const view = await render(() => <PartContext><Clear data-testid="clear" /></PartContext>);
    expect(view.queryByTestId('clear')).toBeNull();
  });
  sourceCase({ source, case: 'clears the filter value and focuses the input when clicked', environment: 'jsdom' }, async () => {
    const changed = vi.fn();
    const view = await render(() => {
      const [value, setValue] = createSignal('can');
      return <PartContext value={value()} onValueChange={(next, details) => { changed(next, details); if (!details.isCanceled) setValue(next); }}><Input /><Clear aria-label="Clear filter" /></PartContext>;
    });
    const input = view.getByRole('searchbox'); const clear = view.getByLabelText('Clear filter');
    expect(clear).toHaveAttribute('tabindex', '-1'); expect(clear).toHaveAttribute('aria-hidden', 'true');
    expect(clear).not.toHaveAttribute('data-visible');
    await view.user.click(clear);
    expect(input).toHaveValue(''); expect(input).toHaveFocus(); expect(view.queryByLabelText('Clear filter')).toBeNull();
    expect(changed).toHaveBeenLastCalledWith('', expect.objectContaining({ reason: 'clear-press' }));
  });
  for (const native of [true, false]) {
    sourceCase({ source, case: native ? 'does nothing when disabled' : 'ignores a click on a disabled non-native button', environment: 'jsdom' }, async () => {
      const changed = vi.fn();
      const view = await render(() => <PartContext value="can" onValueChange={changed}><Input /><Clear disabled nativeButton={native} render={native ? undefined : props => <div {...props as JSX.HTMLAttributes<HTMLDivElement>} />} aria-label="Clear" /></PartContext>);
      const clear = view.getByLabelText('Clear');
      if (native) expect(clear).toBeDisabled();
      await view.user.click(clear); expect(changed).not.toHaveBeenCalled(); expect(view.getByRole('searchbox')).toHaveValue('can');
    });
  }
  sourceCase({ source, case: 'canceled clear retains query and refocuses the input', environment: 'jsdom', adaptation: 'additional native cancellation regression' }, async () => {
    const view = await render(() => <PartContext value="can" onValueChange={(_next, details) => { details.cancel(); details.allowPropagation(); }}><Input /><Clear aria-label="Clear" /></PartContext>);
    await view.user.click(view.getByLabelText('Clear'));
    expect(view.getByRole('searchbox')).toHaveValue('can'); expect(view.getByRole('searchbox')).toHaveFocus();
  });
});
