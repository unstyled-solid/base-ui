var e=`import type { DemoEntry } from '../shared/types';
import Demo1 from './hero/css-modules';
import Demo2 from './hero/tailwind';
import Demo3 from './detached-triggers-controlled/css-modules';
import Demo4 from './detached-triggers-controlled/tailwind';
import Demo5 from './detached-triggers-full/css-modules';
import Demo6 from './detached-triggers-full/tailwind';
import Demo7 from './detached-triggers-simple/css-modules';
import Demo8 from './detached-triggers-simple/tailwind';
export default [
{ id: 'tooltip/hero', upstream: "docs/src/app/(docs)/react/components/tooltip/demos/hero/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo1, files: ["docs/demos/tooltip/hero/css-modules/index.tsx","docs/demos/tooltip/hero/css-modules/index.module.css"] },{ id: 'tailwind', label: 'Tailwind', component: Demo2, files: ["docs/demos/tooltip/hero/tailwind/index.tsx"] }] },
{ id: 'tooltip/detached-triggers-controlled', upstream: "docs/src/app/(docs)/react/components/tooltip/demos/detached-triggers-controlled/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo3, files: ["docs/demos/tooltip/detached-triggers-controlled/css-modules/index.tsx","docs/demos/tooltip/index.module.css"] },{ id: 'tailwind', label: 'Tailwind', component: Demo4, files: ["docs/demos/tooltip/detached-triggers-controlled/tailwind/index.tsx","docs/demos/tooltip/icons-tw.tsx"] }] },
{ id: 'tooltip/detached-triggers-full', upstream: "docs/src/app/(docs)/react/components/tooltip/demos/detached-triggers-full/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo5, files: ["docs/demos/tooltip/detached-triggers-full/css-modules/index.tsx","docs/demos/tooltip/detached-triggers-full/css-modules/index.module.css"] },{ id: 'tailwind', label: 'Tailwind', component: Demo6, files: ["docs/demos/tooltip/detached-triggers-full/tailwind/index.tsx","docs/demos/tooltip/icons-tw.tsx"] }] },
{ id: 'tooltip/detached-triggers-simple', upstream: "docs/src/app/(docs)/react/components/tooltip/demos/detached-triggers-simple/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo7, files: ["docs/demos/tooltip/detached-triggers-simple/css-modules/index.tsx","docs/demos/tooltip/index.module.css"] },{ id: 'tailwind', label: 'Tailwind', component: Demo8, files: ["docs/demos/tooltip/detached-triggers-simple/tailwind/index.tsx","docs/demos/tooltip/icons-tw.tsx"] }] }
] satisfies DemoEntry[];
`;export{e as default};