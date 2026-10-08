import { afterEach, describe, expect, it } from 'vitest';
import { createSignal } from 'solid-js';
import { createRenderer, describeConformance, browserCase, waitFor } from '../../../test';
import { Radio } from '..';
import { RadioGroup } from '../../radio-group';

describe('RadioIndicator', () => {
  const { render, renderProps } = createRenderer();
  afterEach(() => { globalThis.BASE_UI_ANIMATIONS_DISABLED = true; });
  describeConformance((props) => <Radio.Root value=""><Radio.Indicator {...props} /></Radio.Root>, {
    initialProps: {}, refInstanceof: HTMLSpanElement, testRenderPropWith: 'span',
  });
  it('keeps mounted indicators live with checked and field-independent state attributes', async () => {
    const view = await renderProps((props: { value: string; disabled: boolean }) => <RadioGroup value={props.value} disabled={props.disabled} required readOnly>
      <Radio.Root value="a"><Radio.Indicator keepMounted data-testid="indicator" class={(state) => state.checked ? 'checked' : 'unchecked'} /></Radio.Root>
    </RadioGroup>, { value: 'a', disabled: false });
    const indicator = view.getByTestId('indicator');
    expect(indicator).toHaveAttribute('data-checked');
    expect(indicator).toHaveAttribute('data-readonly');
    expect(indicator).toHaveAttribute('data-required');
    await view.setProps({ value: 'b', disabled: true });
    expect(view.getByTestId('indicator')).toBe(indicator);
    expect(indicator).toHaveClass('unchecked');
    expect(indicator).toHaveAttribute('data-unchecked');
    expect(indicator).toHaveAttribute('data-disabled');
  });

  it.each([false, true])('preserves selection and kept indicator identity through repeated native clicks (controlled=%s)', async (controlled) => {
    const changes: string[] = [];
    const view = await render(() => {
      const [value, setValue] = createSignal('a');
      return <RadioGroup name="apple" defaultValue={controlled ? undefined : 'a'}
        value={controlled ? value() : undefined} onValueChange={(next: string) => {
          changes.push(next);
          if (controlled) setValue(next);
        }}>
        <label><Radio.Root value="a"><Radio.Indicator keepMounted data-testid="a" /></Radio.Root>Fuji</label>
        <label><Radio.Root value="b"><Radio.Indicator keepMounted data-testid="b" /></Radio.Root>Gala</label>
        <label><Radio.Root value="c"><Radio.Indicator keepMounted data-testid="c" /></Radio.Root>Granny Smith</label>
      </RadioGroup>;
    });
    const radios = view.getAllByRole('radio');
    const indicators = ['a', 'b', 'c'].map((value) => view.getByTestId(value));
    for (const index of [1, 0, 1, 0]) {
      await view.user.click(radios[index]);
      for (let other = 0; other < radios.length; other++) {
        expect(view.getAllByRole('radio')[other]).toBe(radios[other]);
        expect(radios[other]).toHaveAttribute('aria-checked', String(other === index));
        expect((radios[other].nextElementSibling as HTMLInputElement).checked).toBe(other === index);
        expect(view.getByTestId(['a', 'b', 'c'][other])).toBe(indicators[other]);
        expect(indicators[other]).toHaveAttribute(other === index ? 'data-checked' : 'data-unchecked');
      }
    }
    expect(changes).toEqual(['b', 'a', 'b', 'a']);
  });

  browserCase({ source: 'packages/react/src/radio/indicator/RadioIndicator.test.tsx',
    case: 'applies ending style then unmounts after animation', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    globalThis.BASE_UI_ANIMATIONS_DISABLED = false;
    const view = await renderProps((props: { value: string }) => <>
      <style>{'@keyframes radio-out { to { opacity: 0 } } .radio-indicator[data-ending-style] { animation: radio-out 50ms; }'}</style>
      <RadioGroup value={props.value}>
        <Radio.Root value="a" aria-label="A"><Radio.Indicator class="radio-indicator" data-testid="indicator" /></Radio.Root>
        <Radio.Root value="b" aria-label="B" />
      </RadioGroup>
    </>, { value: 'a' });
    expect(view.getByTestId('indicator')).toBeInTheDocument();
    await view.setProps({ value: 'b' });
    expect(view.getByTestId('indicator')).toHaveAttribute('data-ending-style');
    await waitFor(() => expect(view.queryByTestId('indicator')).toBeNull());
  });

  browserCase({ source: 'packages/react/src/radio/indicator/RadioIndicator.test.tsx',
    case: 'removes the indicator without an exit animation', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const view = await renderProps((props: { value: string }) => <RadioGroup value={props.value}>
      <Radio.Root value="a"><Radio.Indicator data-testid="indicator" /></Radio.Root>
    </RadioGroup>, { value: 'a' });
    expect(view.getByTestId('indicator')).toBeInTheDocument();
    await view.setProps({ value: 'b' });
    await waitFor(() => expect(view.queryByTestId('indicator')).toBeNull());
  });

  browserCase({ source: 'packages/react/src/radio/indicator/RadioIndicator.test.tsx',
    case: 'enters via starting style and retains keepMounted through exit', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    globalThis.BASE_UI_ANIMATIONS_DISABLED = false;
    const ended = { count: 0 };
    const view = await renderProps((props: { value: string }) => <>
      <style>{'.radio-transition { transition: opacity 50ms } .radio-transition[data-unchecked], .radio-transition[data-starting-style], .radio-transition[data-ending-style] { opacity: 0 }'}</style>
      <RadioGroup value={props.value}>
        <Radio.Root value="a"><Radio.Indicator keepMounted class="radio-transition" data-testid="indicator" onTransitionEnd={() => { ended.count += 1; }} /></Radio.Root>
      </RadioGroup>
    </>, { value: 'b' });
    const indicator = view.getByTestId('indicator');
    // Unlike the source's newly mounted indicator, keepMounted needs a hidden
    // unchecked baseline. Commit that CSS state before exercising its entry.
    expect(getComputedStyle(indicator).opacity).toBe('0');
    await view.setProps({ value: 'a' });
    expect(indicator).toHaveAttribute('data-starting-style');
    await waitFor(() => expect(ended.count).toBeGreaterThan(0));
    const enteredCount = ended.count;
    await view.setProps({ value: 'b' });
    await waitFor(() => expect(ended.count).toBeGreaterThan(enteredCount));
    expect(view.getByTestId('indicator')).toBe(indicator);
    expect(indicator).toHaveAttribute('data-unchecked');
  });

  browserCase({ source: 'packages/react/src/radio/indicator/RadioIndicator.test.tsx',
    case: 'delivers native animation end and retains keepMounted', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    globalThis.BASE_UI_ANIMATIONS_DISABLED = false;
    let ended = false;
    const view = await renderProps((props: { value: string }) => <>
      <style>{'@keyframes radio-kept-out { to { opacity: 0 } } .radio-kept[data-ending-style] { animation: radio-kept-out 50ms; }'}</style>
      <RadioGroup value={props.value}><Radio.Root value="a"><Radio.Indicator keepMounted class="radio-kept" data-testid="indicator" onAnimationEnd={() => { ended = true; }} /></Radio.Root></RadioGroup>
    </>, { value: 'a' });
    const indicator = view.getByTestId('indicator');
    await view.setProps({ value: 'b' });
    expect(indicator).toHaveAttribute('data-ending-style');
    await waitFor(() => expect(ended).toBe(true));
    expect(view.getByTestId('indicator')).toBe(indicator);
    expect(indicator).toHaveAttribute('data-unchecked');
  });
});
