var e=`import type { DemoEntry } from '../shared/types';
import Demo1 from './hero/css-modules';
import Demo2 from './hero/tailwind';
import Demo3 from './detached-triggers-controlled/css-modules';
import Demo4 from './detached-triggers-controlled/tailwind';
import Demo5 from './detached-triggers-full/css-modules';
import Demo6 from './detached-triggers-full/tailwind';
import Demo7 from './detached-triggers-simple/css-modules';
import Demo8 from './detached-triggers-simple/tailwind';
import Demo9 from './open-on-hover/css-modules';
import Demo10 from './open-on-hover/tailwind';
export default [
{ id: 'popover/hero', upstream: "docs/src/app/(docs)/react/components/popover/demos/hero/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo1, files: ["docs/demos/popover/hero/css-modules/index.tsx","docs/demos/popover/_index.module.css"] },{ id: 'tailwind', label: 'Tailwind', component: Demo2, files: ["docs/demos/popover/hero/tailwind/index.tsx"] }] },
{ id: 'popover/detached-triggers-controlled', upstream: "docs/src/app/(docs)/react/components/popover/demos/detached-triggers-controlled/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo3, files: ["docs/demos/popover/detached-triggers-controlled/css-modules/index.tsx","docs/demos/popover/_index.module.css"] },{ id: 'tailwind', label: 'Tailwind', component: Demo4, files: ["docs/demos/popover/detached-triggers-controlled/tailwind/index.tsx"] }] },
{ id: 'popover/detached-triggers-full', upstream: "docs/src/app/(docs)/react/components/popover/demos/detached-triggers-full/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo5, files: ["docs/demos/popover/detached-triggers-full/css-modules/index.tsx","docs/demos/popover/_index.module.css","docs/demos/popover/detached-triggers-full/css-modules/index.module.css"] },{ id: 'tailwind', label: 'Tailwind', component: Demo6, files: ["docs/demos/popover/detached-triggers-full/tailwind/index.tsx"] }] },
{ id: 'popover/detached-triggers-simple', upstream: "docs/src/app/(docs)/react/components/popover/demos/detached-triggers-simple/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo7, files: ["docs/demos/popover/detached-triggers-simple/css-modules/index.tsx","docs/demos/popover/_index.module.css"] },{ id: 'tailwind', label: 'Tailwind', component: Demo8, files: ["docs/demos/popover/detached-triggers-simple/tailwind/index.tsx"] }] },
{ id: 'popover/open-on-hover', upstream: "docs/src/app/(docs)/react/components/popover/demos/open-on-hover/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo9, files: ["docs/demos/popover/open-on-hover/css-modules/index.tsx","docs/demos/popover/_index.module.css"] },{ id: 'tailwind', label: 'Tailwind', component: Demo10, files: ["docs/demos/popover/open-on-hover/tailwind/index.tsx"] }] }
] satisfies DemoEntry[];
`;export{e as default};