import { expect, it } from 'vitest';
import { children, createMemo, Loading, lazy } from 'solid-js';
import { Portal } from '@solidjs/web';
import { createRenderer, expectDiagnostic } from '../../../test';

it('pins RC13 native Portal outer-Loading limitation independently of Base UI rendering', async () => {
  let resolve!: (module: { default: () => ReturnType<typeof Content> }) => void;
  const Content = () => <output>Native resolved</output>;
  const promise = new Promise<{ default: typeof Content }>((done) => { resolve = done; });
  const Async = lazy(() => promise);
  await expectDiagnostic({ code: 'ASYNC_OUTSIDE_LOADING_BOUNDARY', message: /ASYNC_OUTSIDE_LOADING_BOUNDARY/, count: 1 }, async () => {
    const view = await createRenderer().render(() => <Loading fallback="Native loading"><Portal mount={document.body}><Async /></Portal></Loading>);
    expect(view.queryByText('Native loading')).toBeNull();
    resolve({ default: Content });
    expect(await view.findByText('Native resolved')).toBeInTheDocument();
  });
});

it('a public native children projection above Portal preserves the inherited Loading boundary', async () => {
  let resolve!: (module: { default: () => ReturnType<typeof Content> }) => void;
  const Content = () => <output>Projected resolved</output>;
  const promise = new Promise<{ default: typeof Content }>((done) => { resolve = done; });
  const Async = lazy(() => promise);
  function ProjectedPortal() {
    const content = children(() => <Async />);
    const projection = createMemo(() => {
      const value = content();
      return <Portal mount={document.body}>{value}</Portal>;
    });
    return <>{projection()}</>;
  }
  const view = await createRenderer().render(() => <Loading fallback="Projected loading"><ProjectedPortal /></Loading>);
  expect(view.getByText('Projected loading')).toBeInTheDocument();
  resolve({ default: Content });
  expect(await view.findByText('Projected resolved')).toBeInTheDocument();
});
