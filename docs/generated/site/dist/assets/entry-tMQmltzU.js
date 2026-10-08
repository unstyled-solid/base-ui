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
{ id: 'preview-card/hero', upstream: "docs/src/app/(docs)/react/components/preview-card/demos/hero/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo1, files: ["docs/demos/preview-card/hero/css-modules/index.tsx","docs/demos/preview-card/index.module.css"] },{ id: 'tailwind', label: 'Tailwind', component: Demo2, files: ["docs/demos/preview-card/hero/tailwind/index.tsx"] }] },
{ id: 'preview-card/detached-triggers-controlled', upstream: "docs/src/app/(docs)/react/components/preview-card/demos/detached-triggers-controlled/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo3, files: ["docs/demos/preview-card/detached-triggers-controlled/css-modules/index.tsx","docs/demos/preview-card/index.module.css"] },{ id: 'tailwind', label: 'Tailwind', component: Demo4, files: ["docs/demos/preview-card/detached-triggers-controlled/tailwind/index.tsx"] }] },
{ id: 'preview-card/detached-triggers-full', upstream: "docs/src/app/(docs)/react/components/preview-card/demos/detached-triggers-full/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo5, files: ["docs/demos/preview-card/detached-triggers-full/css-modules/index.tsx","docs/demos/preview-card/detached-triggers-full/css-modules/index.module.css"] },{ id: 'tailwind', label: 'Tailwind', component: Demo6, files: ["docs/demos/preview-card/detached-triggers-full/tailwind/index.tsx"] }] },
{ id: 'preview-card/detached-triggers-simple', upstream: "docs/src/app/(docs)/react/components/preview-card/demos/detached-triggers-simple/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo7, files: ["docs/demos/preview-card/detached-triggers-simple/css-modules/index.tsx","docs/demos/preview-card/index.module.css"] },{ id: 'tailwind', label: 'Tailwind', component: Demo8, files: ["docs/demos/preview-card/detached-triggers-simple/tailwind/index.tsx"] }] }
] satisfies DemoEntry[];
`;export{e as default};