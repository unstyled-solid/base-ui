import { expect, it } from 'vitest';
import { mergePropsN } from './mergeProps';

it('enumerates nested merged bags without recursively probing every preceding descriptor', () => {
  let membershipReads = 0;
  const source = new Proxy({ id: 'tab', tabIndex: -1 }, {
    has(target, key) { membershipReads++; return Reflect.has(target, key); },
  });
  let props: Record<string, unknown> = source;
  for (let index = 0; index < 8; index++) {
    props = mergePropsN<any>([props, { [`data-stage-${index}`]: '' }]);
  }
  membershipReads = 0;
  expect(Object.keys(props)).toEqual(['id', 'tabIndex', ...Array.from({ length: 8 }, (_, i) => `data-stage-${i}`)]);
  expect(membershipReads).toBeLessThanOrEqual(2);
  expect(props.id).toBe('tab');
  expect(props.tabIndex).toBe(-1);
});

it('keeps key enumeration live across functional stages without reading getters or exposing non-enumerable keys', () => {
  let reads = 0;
  const source: Record<string, unknown> = { id: 'tab', get title() { reads++; return this.id; } };
  Object.defineProperty(source, 'hidden', { value: true });
  const props = mergePropsN<any>([source, previous => mergePropsN([previous, { id: undefined }])]);
  expect(Object.keys(props)).toEqual(['id', 'title']);
  expect(reads).toBe(0);
  expect(props.id).toBeUndefined();
  expect(props.title).toBe('tab');
  source['data-active'] = '';
  delete source.title;
  expect(Object.keys(props)).toEqual(['id', 'data-active']);
  expect(props['data-active']).toBe('');
  expect(Object.getOwnPropertyDescriptor(props, 'absent')).toBeUndefined();
  expect(reads).toBe(1);
});
