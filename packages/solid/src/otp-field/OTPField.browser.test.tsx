import { expect } from 'vitest';
import { browserCase, createRenderer, screen } from '../../test';
import { Fixture, focus, input, paste, slots, values } from './OTPField.test-utils';
import { DirectionProvider } from '../direction-provider';
import { OTPField } from './index';

const { render, renderProps } = createRenderer();
browserCase({ source: 'packages/react/src/otp-field/input/OTPFieldInput.test.tsx',
  case: 'native last-slot selection and tab exit', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const { user } = await render(() => <><Fixture defaultValue="12345" /><button>Next</button></>);
  await user.click(slots()[5]);
  await user.keyboard('6');
  expect(slots()[5].selectionStart).toBe(0);
  expect(slots()[5].selectionEnd).toBe(1);
  await user.tab();
  expect(screen.getByRole('button')).toHaveFocus();
});

browserCase({ source: 'packages/react/src/otp-field/root/OTPFieldRoot.test.tsx',
  case: 'native invalid form focus survives autosubmit', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  await render(() => <form><input aria-label="Email" type="email" required /><Fixture name="otp" required autoSubmit /></form>);
  const email = screen.getByRole<HTMLInputElement>('textbox', { name: 'Email' });
  await input(slots().filter((slot) => slot !== email)[0], '123456');
  expect(email).toHaveFocus();
});

browserCase({ source: 'packages/react/src/otp-field/input/OTPFieldInput.test.tsx',
  case: 'shared native label accessible names on every slot', environment: 'browser', issue: 'bsolid-accessibility' }, async () => {
  await render(() => <><label for="browser-otp">Verification code</label><Fixture id="browser-otp" /></>);
  slots().forEach((slot) => expect(slot).toHaveAccessibleName('Verification code'));
});

browserCase({ source: 'packages/react/src/otp-field/input/OTPFieldInput.test.tsx',
  case: 'real typing replaces selected slots, deletes contiguously and preserves middle-paste suffix', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const { user } = await render(() => <Fixture defaultValue="123456" />);
  await user.click(slots()[1]);
  await user.keyboard('2');
  expect(slots()[2]).toHaveFocus();
  expect(values()).toBe('123456');
  await user.keyboard('{Backspace}');
  expect(values()).toBe('12456');
  expect(slots()[1]).toHaveFocus();
  expect(slots()[1].selectionStart).toBe(0);
  expect(slots()[1].selectionEnd).toBe(1);
  await paste(slots()[1], '99');
  expect(values()).toBe('19956');
  expect(slots()[3]).toHaveFocus();
});

browserCase({ source: 'packages/react/src/otp-field/input/OTPFieldInput.test.tsx',
  case: 'native readonly RTL arrows retain navigation without edits', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const { user } = await render(() => <DirectionProvider direction="rtl"><Fixture defaultValue="12" readOnly /></DirectionProvider>);
  await user.click(slots()[1]);
  await user.keyboard('{ArrowLeft}');
  expect(slots()[2]).toHaveFocus();
  await user.keyboard('{ArrowRight}{Backspace}9');
  expect(slots()[1]).toHaveFocus();
  expect(values()).toBe('12');
});

browserCase({ source: 'packages/react/src/otp-field/input/OTPFieldInput.test.tsx',
  case: 'composed native focus prevention and blur prevention retain source state', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  let nativeDefaultPrevented: boolean | undefined;
  const view = await renderProps((props: { preventFocus: boolean }) => <><OTPField.Root length={1} defaultValue="1">
    <OTPField.Input onFocus={(event) => {
      if (props.preventFocus) event.preventDefault();
      nativeDefaultPrevented = event.defaultPrevented;
    }} onBlur={(event) => event.preventDefault()} />
  </OTPField.Root><button>Outside</button></>, { preventFocus: true });
  // Programmatic focus emits Chromium's actual noncancelable focus event.
  await focus(slots()[0]);
  expect(slots()[0]).toHaveFocus();
  expect(nativeDefaultPrevented).toBe(false);
  expect(screen.getByRole('group')).not.toHaveAttribute('data-focused');
  await focus(screen.getByRole<HTMLButtonElement>('button'));
  await view.setProps({ preventFocus: false });
  await focus(slots()[0]);
  await view.user.tab();
  expect(screen.getByRole('button')).toHaveFocus();
  expect(screen.getByRole('group')).toHaveAttribute('data-focused');
});

browserCase({ source: 'packages/react/src/otp-field/root/OTPFieldRoot.test.tsx',
  case: 'retained standalone focused slot reindexes without focus transfer after sibling removal', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  let focusEvents = 0;
  const view = await renderProps((props: { first: boolean }) => <OTPField.Root length={props.first ? 3 : 2} defaultValue="1">
    {props.first && <OTPField.Input />}<OTPField.Input onFocus={() => { focusEvents++; }} /><OTPField.Input />
  </OTPField.Root>, { first: true });
  const retained = slots()[1];
  await view.user.click(slots()[0]);
  await view.user.click(retained);
  expect(focusEvents).toBe(1);
  await view.setProps({ first: false });
  expect(slots()[0]).toBe(retained);
  expect(retained).toHaveFocus();
  expect(screen.getByRole('group')).toHaveAttribute('data-focused');
  expect(slots().map((slot) => slot.tabIndex)).toEqual([0, -1]);
  expect(focusEvents).toBe(1);
  await view.user.keyboard('{ArrowRight}');
  expect(slots()[1]).toHaveFocus();
});
