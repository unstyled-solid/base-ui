import { expect, it } from 'vitest';
import { renderToString } from '@solidjs/web';
import { LabelableProvider } from './LabelableProvider';
import { createLabel } from './createLabel';
import { createLabelableId } from './createLabelableId';
import { createField } from '../field-core/createField';
import { FieldRootContext } from '../field-root-context';
import { createRegisterFieldControl } from '../field-register-control/createRegisterFieldControl';

it('server labels and named field controls render without registration writes', () => {
  function Label() { return <label {...createLabel({ native: true })}>Name</label>; }
  function Control() {
    const id = createLabelableId({ id: 'explicit' });
    createRegisterFieldControl(() => null, id, () => 'initial', undefined, () => true, () => 'email');
    return <input id={id()} name="email" value="initial" />;
  }
  function Field() {
    const field = createField({});
    return <FieldRootContext value={field}><Label /><Control /><output>{field.name ?? 'unregistered'}</output></FieldRootContext>;
  }
  const html = renderToString(() => <LabelableProvider><Field /></LabelableProvider>);
  const controlId = /<input[^>]* id="([^"]+)"/.exec(html)?.[1];
  expect(controlId).toBeTruthy(); expect(controlId).not.toBe('explicit');
  expect(html).toContain(`for="${controlId}"`);
  expect(html).toContain('unregistered'); expect(html).toContain('name="email"');
});
