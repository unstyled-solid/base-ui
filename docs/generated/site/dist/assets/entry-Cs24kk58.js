var e=`import type { DemoEntry } from '../shared/types';
import Demo1 from './hero/css-modules';
import Demo2 from './hero/tailwind';
import Demo3 from './detached-triggers-controlled/css-modules';
import Demo4 from './detached-triggers-controlled/tailwind';
import Demo5 from './detached-triggers-simple/css-modules';
import Demo6 from './detached-triggers-simple/tailwind';
import Demo7 from './open-from-menu/css-modules';
import Demo8 from './open-from-menu/tailwind';
export default [
{ id: 'alert-dialog/hero', upstream: "docs/src/app/(docs)/react/components/alert-dialog/demos/hero/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo1, files: ["docs/demos/alert-dialog/hero/css-modules/index.tsx","docs/demos/alert-dialog/hero/css-modules/index.module.css"] },{ id: 'tailwind', label: 'Tailwind', component: Demo2, files: ["docs/demos/alert-dialog/hero/tailwind/index.tsx"] }] },
{ id: 'alert-dialog/detached-triggers-controlled', upstream: "docs/src/app/(docs)/react/components/alert-dialog/demos/detached-triggers-controlled/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo3, files: ["docs/demos/alert-dialog/detached-triggers-controlled/css-modules/index.tsx","docs/demos/alert-dialog/_index.module.css"] },{ id: 'tailwind', label: 'Tailwind', component: Demo4, files: ["docs/demos/alert-dialog/detached-triggers-controlled/tailwind/index.tsx"] }] },
{ id: 'alert-dialog/detached-triggers-simple', upstream: "docs/src/app/(docs)/react/components/alert-dialog/demos/detached-triggers-simple/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo5, files: ["docs/demos/alert-dialog/detached-triggers-simple/css-modules/index.tsx","docs/demos/alert-dialog/_index.module.css"] },{ id: 'tailwind', label: 'Tailwind', component: Demo6, files: ["docs/demos/alert-dialog/detached-triggers-simple/tailwind/index.tsx"] }] },
{ id: 'alert-dialog/open-from-menu', upstream: "docs/src/app/(docs)/react/components/alert-dialog/demos/open-from-menu/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo7, files: ["docs/demos/alert-dialog/open-from-menu/css-modules/index.tsx","docs/demos/alert-dialog/open-from-menu/css-modules/index.module.css"] },{ id: 'tailwind', label: 'Tailwind', component: Demo8, files: ["docs/demos/alert-dialog/open-from-menu/tailwind/index.tsx"] }] }
] satisfies DemoEntry[];
`;export{e as default};