var e=`import type { DemoEntry } from '../shared/types';
import Demo1 from './hero/css-modules';
import Demo2 from './hero/tailwind';
import Demo3 from './edge-alignment/css-modules';
import Demo4 from './edge-alignment/tailwind';
import Demo5 from './marks/css-modules';
import Demo6 from './marks/tailwind';
import Demo7 from './range-slider/css-modules';
import Demo8 from './range-slider/tailwind';
import Demo9 from './steps/css-modules';
import Demo10 from './steps/tailwind';
import Demo11 from './vertical/css-modules';
import Demo12 from './vertical/tailwind';
export default [
{ id: 'slider/hero', upstream: "docs/src/app/(docs)/react/components/slider/demos/hero/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo1, files: ["docs/demos/slider/hero/css-modules/index.tsx","docs/demos/slider/hero/css-modules/index.module.css"] },{ id: 'tailwind', label: 'Tailwind', component: Demo2, files: ["docs/demos/slider/hero/tailwind/index.tsx"] }] },
{ id: 'slider/edge-alignment', upstream: "docs/src/app/(docs)/react/components/slider/demos/edge-alignment/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo3, files: ["docs/demos/slider/edge-alignment/css-modules/index.tsx","docs/demos/slider/edge-alignment/css-modules/index.module.css"] },{ id: 'tailwind', label: 'Tailwind', component: Demo4, files: ["docs/demos/slider/edge-alignment/tailwind/index.tsx"] }] },
{ id: 'slider/marks', upstream: "docs/src/app/(docs)/react/components/slider/demos/marks/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo5, files: ["docs/demos/slider/marks/css-modules/index.tsx","docs/demos/slider/marks/css-modules/index.module.css"] },{ id: 'tailwind', label: 'Tailwind', component: Demo6, files: ["docs/demos/slider/marks/tailwind/index.tsx"] }] },
{ id: 'slider/range-slider', upstream: "docs/src/app/(docs)/react/components/slider/demos/range-slider/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo7, files: ["docs/demos/slider/range-slider/css-modules/index.tsx","docs/demos/slider/range-slider/css-modules/index.module.css"] },{ id: 'tailwind', label: 'Tailwind', component: Demo8, files: ["docs/demos/slider/range-slider/tailwind/index.tsx"] }] },
{ id: 'slider/steps', upstream: "docs/src/app/(docs)/react/components/slider/demos/steps/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo9, files: ["docs/demos/slider/steps/css-modules/index.tsx","docs/demos/slider/steps/css-modules/index.module.css"] },{ id: 'tailwind', label: 'Tailwind', component: Demo10, files: ["docs/demos/slider/steps/tailwind/index.tsx"] }] },
{ id: 'slider/vertical', upstream: "docs/src/app/(docs)/react/components/slider/demos/vertical/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo11, files: ["docs/demos/slider/vertical/css-modules/index.tsx","docs/demos/slider/vertical/css-modules/index.module.css"] },{ id: 'tailwind', label: 'Tailwind', component: Demo12, files: ["docs/demos/slider/vertical/tailwind/index.tsx"] }] }
] satisfies DemoEntry[];
`;export{e as default};