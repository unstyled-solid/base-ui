import { afterEach, expect, it } from 'vitest';
import { getDefaultFormSubmitter } from './getDefaultFormSubmitter';
afterEach(() => { document.body.replaceChildren(); });
it.each([
  ['external', '<button id="expected" form="form">External</button><form id="form"><button>Internal</button></form>'],
  ['disabled first', '<form id="form"><button id="expected" disabled>Disabled</button><button>Enabled</button></form>'],
  ['default type', '<form id="form"><button id="expected">Default</button><button type="submit">Explicit</button></form>'],
  ['input submitter', '<form id="form"><button type="button"></button><input type="reset"><input type="submit" id="expected"></form>'],
  ['no submitter', '<form id="form"><input type="checkbox"><button type="button"></button></form>'],
])('source form selection: %s', (_, html) => {
  document.body.innerHTML = html;
  expect(getDefaultFormSubmitter(document.querySelector('form'))).toBe(document.querySelector('#expected'));
});
it('null form', () => { expect(getDefaultFormSubmitter(null)).toBeNull(); });
