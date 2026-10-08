var e=`import type { DemoEntry } from '../shared/types';
import Demo0 from './hero/css-modules/index';
import Demo1 from './hero/tailwind/index';
import Demo2 from './custom/css-modules/index';
import Demo3 from './deduplicate/css-modules/index';
import Demo4 from './promise/css-modules/index';
import Demo5 from './varying-heights/css-modules/index';
import Demo6 from './undo/css-modules/index';
import Demo7 from './position/css-modules/index';
import Demo8 from './position/tailwind/index';
import Demo9 from './anchored/css-modules/index';
import Demo10 from './anchored/tailwind/index';

export default [
  { id: 'toast/hero', upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/toast/demos/hero/index.ts', variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo0, files: ["docs/demos/toast/hero/css-modules/index.tsx","docs/demos/toast/hero/css-modules/index.module.css"] }, { id: 'tailwind', label: 'Tailwind', component: Demo1, files: ["docs/demos/toast/hero/tailwind/index.tsx"] }] },
  { id: 'toast/custom', upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/toast/demos/custom/index.ts', variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo2, files: ["docs/demos/toast/custom/css-modules/index.tsx","docs/demos/toast/custom/css-modules/index.module.css"] }] },
  { id: 'toast/deduplicate', upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/toast/demos/deduplicate/index.ts', variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo3, files: ["docs/demos/toast/deduplicate/css-modules/index.tsx","docs/demos/toast/deduplicate/css-modules/index.module.css"] }] },
  { id: 'toast/promise', upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/toast/demos/promise/index.ts', variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo4, files: ["docs/demos/toast/promise/css-modules/index.tsx","docs/demos/toast/promise/css-modules/index.module.css"] }] },
  { id: 'toast/varying-heights', upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/toast/demos/varying-heights/index.ts', variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo5, files: ["docs/demos/toast/varying-heights/css-modules/index.tsx","docs/demos/toast/varying-heights/css-modules/index.module.css"] }] },
  { id: 'toast/undo', upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/toast/demos/undo/index.ts', variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo6, files: ["docs/demos/toast/undo/css-modules/index.tsx","docs/demos/toast/undo/css-modules/index.module.css"] }] },
  { id: 'toast/position', upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/toast/demos/position/index.ts', variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo7, files: ["docs/demos/toast/position/css-modules/index.tsx","docs/demos/toast/position/css-modules/index.module.css"] }, { id: 'tailwind', label: 'Tailwind', component: Demo8, files: ["docs/demos/toast/position/tailwind/index.tsx"] }] },
  { id: 'toast/anchored', upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/toast/demos/anchored/index.ts', variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo9, files: ["docs/demos/toast/anchored/css-modules/index.tsx","docs/demos/toast/anchored/css-modules/index.module.css"] }, { id: 'tailwind', label: 'Tailwind', component: Demo10, files: ["docs/demos/toast/anchored/tailwind/index.tsx"] }] }
] satisfies DemoEntry[];
`;export{e as default};