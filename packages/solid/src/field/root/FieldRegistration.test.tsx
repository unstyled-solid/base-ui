// Stage-1 foundation contract fixture cases from FieldRoot.test.tsx. Real heterogeneous
// NumberField/Checkbox/Radio/Select/Slider/Switch replay is assigned to bsolid-integration.
import { describe, expect, it, vi } from 'vitest';
import { createRenderer, fireEvent, flushMicrotasks, screen, advanceTimers } from '../../../test';
import { Field } from '../index';
import { Form } from '../../form/Form';
import { RegisteredControl } from '../fixtures/RegisteredControl';

const { renderProps } = createRenderer();
describe('Field foundation-registration contract', () => {
  it('drops group label suppression when a text control replaces the group', async () => {
    const view = await renderProps((p: { group: boolean }) => <Field.Root><Field.Label>Answer</Field.Label>{p.group ? <RegisteredControl value={['a']} group /> : <Field.Control />}</Field.Root>, { group: true });
    expect(screen.getByText('Answer')).not.toHaveAttribute('for');
    await view.setProps({ group: false });
    const control = screen.getByRole('textbox');
    expect(screen.getByText('Answer')).toHaveAttribute('for', control.id);
  });

  it('submits the active replacement registration and excludes its retired predecessor', async () => {
    const submitted = vi.fn();
    const view = await renderProps((p: { swapped: boolean }) => <Form onFormSubmit={submitted} data-testid="form"><Field.Root name="value">{p.swapped ? <RegisteredControl value={12} /> : <Field.Control defaultValue="sans" />}</Field.Root></Form>, { swapped: false });
    fireEvent.submit(screen.getByTestId('form'));
    await flushMicrotasks();
    expect(submitted.mock.lastCall?.[0]).toEqual({ value: 'sans' });
    await view.setProps({ swapped: true });
    fireEvent.submit(screen.getByTestId('form'));
    await flushMicrotasks();
    expect(submitted.mock.lastCall?.[0]).toEqual({ value: 12 });
  });

  it('removes registration-gated values when the root name is removed', async () => {
    const submitted = vi.fn();
    const view = await renderProps((p: { name?: string }) => <Form onFormSubmit={submitted} data-testid="form"><Field.Root name={p.name}><RegisteredControl value={['apple']} group /></Field.Root></Form>, { name: 'fruits' });
    fireEvent.submit(screen.getByTestId('form'));
    await flushMicrotasks();
    expect(submitted.mock.lastCall?.[0]).toEqual({ fruits: ['apple'] });
    await view.setProps({ name: undefined });
    fireEvent.submit(screen.getByTestId('form'));
    await flushMicrotasks();
    expect(submitted.mock.lastCall?.[0]).toEqual({});
  });

  it('updates logical name fallbacks without retaining a stale Map entry', async () => {
    const submitted = vi.fn();
    const view = await renderProps((p: { name?: string }) => <Form onFormSubmit={submitted} data-testid="form"><Field.Root><RegisteredControl value={13} name={p.name} /></Field.Root></Form>, { name: 'quantity' });
    fireEvent.submit(screen.getByTestId('form'));
    await flushMicrotasks();
    expect(submitted.mock.lastCall?.[0]).toEqual({ quantity: 13 });
    await view.setProps({ name: 'amount' });
    fireEvent.submit(screen.getByTestId('form'));
    await flushMicrotasks();
    expect(submitted.mock.lastCall?.[0]).toEqual({ amount: 13 });
    await view.setProps({ name: undefined });
    fireEvent.submit(screen.getByTestId('form'));
    await flushMicrotasks();
    expect(submitted.mock.lastCall?.[0]).toEqual({});
  });

  it('does not recapture a null logical baseline on the first selected value', async () => {
    const view = await renderProps<{ value: string | null }>((p) => <Field.Root data-testid="root"><RegisteredControl value={p.value} /></Field.Root>, { value: null });
    await view.setProps({ value: 'a' });
    expect(screen.getByTestId('root')).toHaveAttribute('data-dirty');
    await view.setProps({ value: 'b' });
    await view.setProps({ value: 'a' });
    expect(screen.getByTestId('root')).toHaveAttribute('data-dirty');
    await view.setProps({ value: null });
    expect(screen.getByTestId('root')).not.toHaveAttribute('data-dirty');
  });

  it('debounces logical registered values through the same validation engine', async () => {
    vi.useFakeTimers();
    try {
      const validate = vi.fn((_value: unknown) => 'Error');
      const view = await renderProps((p: { value: boolean }) => <Field.Root validationMode="onChange" validationDebounceTime={100} validate={validate}><RegisteredControl value={p.value} /><Field.Error /></Field.Root>, { value: false });
      await view.setProps({ value: true });
      await advanceTimers(99);
      expect(validate).not.toHaveBeenCalled();
      await advanceTimers(1);
      expect(validate).toHaveBeenCalledTimes(1);
      expect(validate.mock.lastCall?.[0]).toBe(true);
      view.unmount();
    } finally { vi.useRealTimers(); }
  });

  it('cancels queued work when a new logical control takes ownership', async () => {
    vi.useFakeTimers();
    try {
      const validate = vi.fn(() => 'Error');
      const view = await renderProps((p: { extra: boolean }) => <Field.Root validationMode="onChange" validationDebounceTime={100} validate={validate}><Field.Control />{p.extra && <RegisteredControl value={false} />}<Field.Error /></Field.Root>, { extra: false });
      fireEvent.input(screen.getByRole('textbox'), { target: { value: 'old' } });
      await flushMicrotasks();
      await advanceTimers(99);
      await view.setProps({ extra: true });
      await advanceTimers(100);
      expect(validate).not.toHaveBeenCalled();
      expect(screen.queryByText('Error')).toBeNull();
      view.unmount();
    } finally { vi.useRealTimers(); }
  });
});
