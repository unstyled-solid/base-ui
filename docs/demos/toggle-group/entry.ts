import type { DemoEntry } from '../shared/types';
import Demo1 from './hero/css-modules';
import Demo2 from './hero/tailwind';
import Demo3 from './multiple/css-modules';
import Demo4 from './multiple/tailwind';
export default [
{ id: 'toggle-group/hero', upstream: "docs/src/app/(docs)/react/components/toggle-group/demos/hero/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo1, files: ["docs/demos/toggle-group/hero/css-modules/index.tsx","docs/demos/toggle-group/hero/css-modules/index.module.css"] },{ id: 'tailwind', label: 'Tailwind', component: Demo2, files: ["docs/demos/toggle-group/hero/tailwind/index.tsx"] }] },
{ id: 'toggle-group/multiple', upstream: "docs/src/app/(docs)/react/components/toggle-group/demos/multiple/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo3, files: ["docs/demos/toggle-group/multiple/css-modules/index.tsx","docs/demos/toggle-group/multiple/css-modules/index.module.css"] },{ id: 'tailwind', label: 'Tailwind', component: Demo4, files: ["docs/demos/toggle-group/multiple/tailwind/index.tsx"] }] }
] satisfies DemoEntry[];
