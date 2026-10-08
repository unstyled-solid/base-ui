import { describe, expect, it } from 'vitest';
import { Errored } from 'solid-js';
import { createRenderer, describeConformance } from '../../test';
import { Accordion } from './index';

// Native factories replace the upstream cloneElement/forwardRef conformance adapters.
describe('Accordion.Root conformance', () => {
  describeConformance<Accordion.Root.State, {}>((props) => <Accordion.Root {...props} />, {
    initialProps: {}, refInstanceof: HTMLDivElement,
  });
});
describe('Accordion.Item conformance', () => {
  describeConformance<Accordion.Item.State, {}>((props) => <Accordion.Root><Accordion.Item {...props} /></Accordion.Root>, {
    initialProps: {}, refInstanceof: HTMLDivElement,
  });
});
describe('Accordion.Header conformance', () => {
  describeConformance<Accordion.Header.State, {}>((props) => <Accordion.Root><Accordion.Item><Accordion.Header {...props} /></Accordion.Item></Accordion.Root>, {
    initialProps: {}, refInstanceof: HTMLHeadingElement,
  });
});
describe('Accordion.Trigger conformance', () => {
  describeConformance<Accordion.Trigger.State, {}>((props) => <Accordion.Root><Accordion.Item><Accordion.Trigger {...props} /></Accordion.Item></Accordion.Root>, {
    initialProps: {}, refInstanceof: HTMLButtonElement, button: true, testRenderPropWith: 'div',
  });
});
describe('Accordion.Panel conformance', () => {
  describeConformance<Accordion.Panel.State, {}>((props) => <Accordion.Root><Accordion.Item><Accordion.Panel keepMounted {...props} /></Accordion.Item></Accordion.Root>, {
    initialProps: {}, refInstanceof: HTMLDivElement,
  });
});
describe('Accordion required contexts', () => {
  const { render } = createRenderer();
  it('requires Root for Item', async () => {
    const view = await render(() => <Errored fallback={(error) => <output>{String(error())}</output>}><Accordion.Item /></Errored>);
    expect(view.getByRole('status')).toHaveTextContent(/context/i);
  });
  it('requires Item for Header', async () => {
    const view = await render(() => <Errored fallback={(error) => <output>{String(error())}</output>}><Accordion.Header /></Errored>);
    expect(view.getByRole('status')).toHaveTextContent(/context/i);
  });
});
