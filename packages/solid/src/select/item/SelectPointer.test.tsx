import { describe, expect, it, vi } from 'vitest';
import { createRenderer, fireEvent, firePointer, screen, waitFor } from '../../../test';
import { Select } from '../index';

const { render } = createRenderer();
function Fixture(props: { disabled?: boolean; hover?: boolean; onClick?: Select.Item.Props['onClick']; changed?: Select.Root.Props<string>['onValueChange'] }) {
  return <Select.Root defaultOpen defaultValue="a" highlightItemOnHover={props.hover} onValueChange={props.changed}>
    <Select.Trigger><Select.Value /></Select.Trigger><Select.Portal><Select.Positioner alignItemWithTrigger={false}><Select.Popup>
      <Select.Item value="a">Apple</Select.Item><Select.Item value="b" disabled={props.disabled} onClick={props.onClick}>Banana</Select.Item>
      <Select.Item value="c">Citrus</Select.Item>
    </Select.Popup></Select.Positioner></Select.Portal>
  </Select.Root>;
}
describe('Select native pointer selection safeguards', () => {
  it('ignores release and real click if the opening press did not begin on that item', async () => {
    const changed = vi.fn();
    await render(() => <Fixture changed={changed} hover={false} />);
    const banana = screen.getByRole('option', { name: 'Banana' });
    fireEvent.mouseUp(banana); fireEvent.click(banana, { detail: 1 });
    expect(changed).not.toHaveBeenCalled();
  });
  it('commits a real unhighlighted item click once when the press starts there', async () => {
    const changed = vi.fn(); const click = vi.fn();
    await render(() => <Fixture changed={changed} onClick={click} hover={false} />);
    const banana = screen.getByRole('option', { name: 'Banana' });
    firePointer.down(banana, { pointerType: 'mouse', timeStamp: 10 });
    fireEvent.mouseDown(banana); fireEvent.mouseUp(banana); fireEvent.click(banana, { detail: 1 });
    await waitFor(() => expect(changed).toHaveBeenCalledOnce());
    expect(click).toHaveBeenCalledOnce();
    expect(changed.mock.calls[0][0]).toBe('b');
  });
  it('rejects generic detail-zero virtual activation on unhighlighted items', async () => {
    const changed = vi.fn();
    await render(() => <Fixture changed={changed} hover={false} />);
    fireEvent.click(screen.getByRole('option', { name: 'Banana' }), { detail: 0 });
    expect(changed).not.toHaveBeenCalled();
  });
  it('accumulates drag distance across options and emits one cancelable native click', async () => {
    const changed = vi.fn(); const click = vi.fn();
    await render(() => <Fixture changed={changed} onClick={click} hover={false} />);
    const apple = screen.getByRole('option', { name: 'Apple' });
    const banana = screen.getByRole('option', { name: 'Banana' });
    firePointer.move(apple, { pointerType: 'mouse', buttons: 1, movementY: 4, timeStamp: 10 });
    firePointer.move(banana, { pointerType: 'mouse', buttons: 1, movementY: 4, timeStamp: 20 });
    fireEvent.mouseUp(banana);
    await waitFor(() => expect(changed).toHaveBeenCalledOnce());
    expect(click).toHaveBeenCalledOnce();
  });
  it('small drag motion does not bypass the opening release gate', async () => {
    const changed = vi.fn();
    await render(() => <Fixture changed={changed} />);
    const banana = screen.getByRole('option', { name: 'Banana' });
    firePointer.move(banana, { pointerType: 'mouse', buttons: 1, movementY: 2, timeStamp: 10 });
    fireEvent.mouseUp(banana);
    expect(changed).not.toHaveBeenCalled();
  });
  it('disabled drag release never synthesizes a consumer click', async () => {
    const changed = vi.fn(); const click = vi.fn();
    await render(() => <Fixture changed={changed} onClick={click} disabled />);
    const banana = screen.getByRole('option', { name: 'Banana' });
    firePointer.move(banana, { pointerType: 'mouse', buttons: 1, movementY: 8, timeStamp: 10 });
    fireEvent.mouseUp(banana);
    expect(click).not.toHaveBeenCalled(); expect(changed).not.toHaveBeenCalled();
  });
  it('preventBaseUIHandler cancels drag-generated activation without replacing native prevention', async () => {
    const changed = vi.fn(); const click = vi.fn(event => event.preventBaseUIHandler());
    await render(() => <Fixture changed={changed} onClick={click} hover={false} />);
    const banana = screen.getByRole('option', { name: 'Banana' });
    firePointer.move(banana, { pointerType: 'mouse', buttons: 1, movementY: 8, timeStamp: 10 });
    fireEvent.mouseUp(banana);
    expect(click).toHaveBeenCalledOnce(); expect(changed).not.toHaveBeenCalled();
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });
  it('touch mouseup does not become drag selection', async () => {
    const changed = vi.fn();
    await render(() => <Fixture changed={changed} />);
    const banana = screen.getByRole('option', { name: 'Banana' });
    firePointer.down(banana, { pointerType: 'touch', timeStamp: 10 }); fireEvent.mouseUp(banana);
    expect(changed).not.toHaveBeenCalled();
  });
});
