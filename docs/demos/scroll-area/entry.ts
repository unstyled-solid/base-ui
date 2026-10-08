import type { DemoEntry } from '../shared/types';
import Demo1 from './hero/css-modules';
import Demo2 from './hero/tailwind';
import Demo3 from './both/css-modules';
import Demo4 from './both/tailwind';
import Demo5 from './scroll-fade/css-modules';
import Demo6 from './scroll-fade/tailwind';
export default [
{ id: 'scroll-area/hero', upstream: "docs/src/app/(docs)/react/components/scroll-area/demos/hero/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo1, files: ["docs/demos/scroll-area/hero/css-modules/index.tsx","docs/demos/scroll-area/hero/css-modules/index.module.css"] },{ id: 'tailwind', label: 'Tailwind', component: Demo2, files: ["docs/demos/scroll-area/hero/tailwind/index.tsx"] }] },
{ id: 'scroll-area/both', upstream: "docs/src/app/(docs)/react/components/scroll-area/demos/both/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo3, files: ["docs/demos/scroll-area/both/css-modules/index.tsx","docs/demos/scroll-area/both/css-modules/index.module.css"] },{ id: 'tailwind', label: 'Tailwind', component: Demo4, files: ["docs/demos/scroll-area/both/tailwind/index.tsx"] }] },
{ id: 'scroll-area/scroll-fade', upstream: "docs/src/app/(docs)/react/components/scroll-area/demos/scroll-fade/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo5, files: ["docs/demos/scroll-area/scroll-fade/css-modules/index.tsx","docs/demos/scroll-area/scroll-fade/css-modules/index.module.css"] },{ id: 'tailwind', label: 'Tailwind', component: Demo6, files: ["docs/demos/scroll-area/scroll-fade/tailwind/index.tsx"] }] }
] satisfies DemoEntry[];
