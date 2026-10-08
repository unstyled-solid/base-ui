import { describeConformance } from '../../test';
import type { ConformantComponentProps, ConformanceHostProps } from '../../test/describeConformance';
import { Slider } from './index';
import type { SliderRootState, SliderRootProps } from './root/SliderRoot';
import { merge } from 'solid-js';

// The harness exposes callback-only refs. Production render props retain the
// full native ref union; createRenderElement supplies an owned callback here.
function adapt(props: ConformantComponentProps<SliderRootState>) {
  const targets = new WeakMap<NonNullable<typeof props.render>, NonNullable<SliderRootProps['render']>>();
  return {
    get class() { return props.class; },
    get style() { return props.style; },
    get lang() { return props.lang; },
    get ref() { return props.ref; },
    get 'data-testid'() { return props['data-testid']; },
    get 'data-foobar'() { return props['data-foobar']; },
    get onClick() {
      const handler = props.onClick;
      if (typeof handler === 'function' || handler === undefined) return handler;
      return (event: MouseEvent & { currentTarget: HTMLElement; target: Element }) => handler[0](handler[1], event);
    },
    get render() {
      const render = props.render;
      if (!render) return undefined;
      let target = targets.get(render);
      if (!target) {
        target = (native, state) => {
          const host: ConformanceHostProps = merge(native, {
            get ref() { return typeof native.ref === 'function' ? native.ref : undefined; },
          });
          return render(host, state);
        };
        targets.set(render, target);
      }
      return target;
    },
  };
}

// Each canonical part's describeConformance invocation maps to the shared
// Solid-native callback/class/ref/current-handler/identity assertions.
describeConformance<SliderRootState, ConformantComponentProps<SliderRootState>>(
  (props) => { const live = adapt(props); return <Slider.Root defaultValue={30} {...live} />; },
  { initialProps: {}, refInstanceof: HTMLDivElement, click: 'dispatch' },
);
for (const Part of [Slider.Control, Slider.Track, Slider.Indicator]) {
  describeConformance<SliderRootState, ConformantComponentProps<SliderRootState>>(
    (props) => { const live = adapt(props); return <Slider.Root defaultValue={30}><Part {...live} /></Slider.Root>; },
    // This conformance case checks click composition, not pointer capture.
    // Real capture/drag packets are retained in Slider.browser.test.tsx.
    { initialProps: {}, refInstanceof: HTMLDivElement, click: 'dispatch' },
  );
}
describeConformance<SliderRootState, ConformantComponentProps<SliderRootState>>(
  (props) => { const live = adapt(props); return <Slider.Root defaultValue={30}><Slider.Label {...live} /><Slider.Control><Slider.Thumb /></Slider.Control></Slider.Root>; },
  { initialProps: {}, refInstanceof: HTMLDivElement, click: 'dispatch' },
);
describeConformance<SliderRootState, ConformantComponentProps<SliderRootState>>(
  (props) => { const live = adapt(props); return <Slider.Root defaultValue={30}><Slider.Control><Slider.Thumb {...live} /></Slider.Control></Slider.Root>; },
  { initialProps: {}, refInstanceof: HTMLDivElement, click: 'dispatch' },
);
describeConformance<SliderRootState, ConformantComponentProps<SliderRootState>>(
  (props) => { const live = adapt(props); return <Slider.Root defaultValue={30}><Slider.Value {...live} /></Slider.Root>; },
  { initialProps: {}, refInstanceof: HTMLOutputElement, click: 'dispatch' },
);
