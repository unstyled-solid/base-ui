import { createSignal } from 'solid-js';
import { render } from '@solidjs/web';
import { Button } from 'baseui-solid2/button';
import { Checkbox } from 'baseui-solid2/checkbox';

function Diagnostics() {
  const [checked, setChecked] = createSignal<boolean | undefined>(true);
  return <>
    <Button render={props => <div {...props} />}>Wrong native host</Button>
    <Checkbox.Root checked={checked()} aria-label="Diagnostic checkbox" />
    <button id="make-uncontrolled" onClick={() => setChecked(undefined)}>Make uncontrolled</button>
  </>;
}

const dispose = render(() => <Diagnostics />, document.querySelector('main')!);
Object.assign(window, { diagnosticsReady: true, disposeDiagnostics: dispose });
