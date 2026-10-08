import type { DemoEntry } from '../shared/types';
import Demo1 from './hero/css-modules';
import Demo2 from './hero/tailwind';
import Demo3 from './submenu/css-modules';
import Demo4 from './submenu/tailwind';
import Demo5 from './with-menu/css-modules';
import Demo6 from './with-menu/tailwind';
export default [
{ id: 'context-menu/hero', upstream: "docs/src/app/(docs)/react/components/context-menu/demos/hero/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo1, files: ["docs/demos/context-menu/hero/css-modules/index.tsx","docs/demos/context-menu/hero/css-modules/index.module.css"] },{ id: 'tailwind', label: 'Tailwind', component: Demo2, files: ["docs/demos/context-menu/hero/tailwind/index.tsx"] }] },
{ id: 'context-menu/submenu', upstream: "docs/src/app/(docs)/react/components/context-menu/demos/submenu/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo3, files: ["docs/demos/context-menu/submenu/css-modules/index.tsx","docs/demos/context-menu/submenu/css-modules/index.module.css"] },{ id: 'tailwind', label: 'Tailwind', component: Demo4, files: ["docs/demos/context-menu/submenu/tailwind/index.tsx"] }] },
{ id: 'context-menu/with-menu', upstream: "docs/src/app/(docs)/react/components/context-menu/demos/with-menu/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo5, files: ["docs/demos/context-menu/with-menu/css-modules/index.tsx","docs/demos/context-menu/with-menu/css-modules/index.module.css"] },{ id: 'tailwind', label: 'Tailwind', component: Demo6, files: ["docs/demos/context-menu/with-menu/tailwind/index.tsx"] }] }
] satisfies DemoEntry[];
