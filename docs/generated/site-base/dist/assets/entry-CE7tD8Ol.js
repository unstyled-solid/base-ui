var e=`import type { DemoEntry } from '../shared/types';
import Demo0Variant0 from './hero/css-modules';
import Demo0Variant1 from './hero/tailwind';
import Demo1Variant0 from './multiple/css-modules';
import Demo1Variant1 from './multiple/tailwind';
import Demo2Variant0 from './grouped/css-modules';
import Demo2Variant1 from './grouped/tailwind';
import Demo3Variant0 from './input-inside-popup/css-modules';
import Demo3Variant1 from './input-inside-popup/tailwind';
import Demo4Variant0 from './create-items/css-modules';
import Demo4Variant1 from './create-items/tailwind';
import Demo5Variant0 from './creatable/css-modules';
import Demo5Variant1 from './creatable/tailwind';
import Demo6Variant0 from './async-single/css-modules';
import Demo6Variant1 from './async-single/tailwind';
import Demo7Variant0 from './async-multiple/css-modules';
import Demo7Variant1 from './async-multiple/tailwind';
import Demo8Variant0 from './virtualized/css-modules';
import Demo8Variant1 from './virtualized/tailwind';

export default [
{ id: 'combobox/hero', upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/combobox/demos/hero/index.ts', variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo0Variant0, files: ["docs/demos/combobox/hero/css-modules/index.tsx","docs/demos/combobox/hero/css-modules/index.module.css"] }, { id: 'tailwind', label: 'Tailwind', component: Demo0Variant1, files: ["docs/demos/combobox/hero/tailwind/index.tsx"] }] },
{ id: 'combobox/multiple', upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/combobox/demos/multiple/index.ts', variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo1Variant0, files: ["docs/demos/combobox/multiple/css-modules/index.tsx","docs/demos/combobox/multiple/css-modules/index.module.css"] }, { id: 'tailwind', label: 'Tailwind', component: Demo1Variant1, files: ["docs/demos/combobox/multiple/tailwind/index.tsx"] }] },
{ id: 'combobox/grouped', upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/combobox/demos/grouped/index.ts', variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo2Variant0, files: ["docs/demos/combobox/grouped/css-modules/index.tsx","docs/demos/combobox/grouped/css-modules/index.module.css"] }, { id: 'tailwind', label: 'Tailwind', component: Demo2Variant1, files: ["docs/demos/combobox/grouped/tailwind/index.tsx"] }] },
{ id: 'combobox/input-inside-popup', upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/combobox/demos/input-inside-popup/index.ts', variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo3Variant0, files: ["docs/demos/combobox/input-inside-popup/css-modules/index.tsx","docs/demos/combobox/input-inside-popup/css-modules/index.module.css"] }, { id: 'tailwind', label: 'Tailwind', component: Demo3Variant1, files: ["docs/demos/combobox/input-inside-popup/tailwind/index.tsx"] }] },
{ id: 'combobox/create-items', upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/combobox/demos/create-items/index.ts', variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo4Variant0, files: ["docs/demos/combobox/create-items/css-modules/index.tsx","docs/demos/combobox/create-items/css-modules/index.module.css"] }, { id: 'tailwind', label: 'Tailwind', component: Demo4Variant1, files: ["docs/demos/combobox/create-items/tailwind/index.tsx"] }] },
{ id: 'combobox/creatable', upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/combobox/demos/creatable/index.ts', variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo5Variant0, files: ["docs/demos/combobox/creatable/css-modules/index.tsx","docs/demos/combobox/creatable/css-modules/index.module.css"] }, { id: 'tailwind', label: 'Tailwind', component: Demo5Variant1, files: ["docs/demos/combobox/creatable/tailwind/index.tsx"] }] },
{ id: 'combobox/async-single', upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/combobox/demos/async-single/index.ts', variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo6Variant0, files: ["docs/demos/combobox/async-single/css-modules/index.tsx","docs/demos/combobox/async-single/css-modules/index.module.css"] }, { id: 'tailwind', label: 'Tailwind', component: Demo6Variant1, files: ["docs/demos/combobox/async-single/tailwind/index.tsx"] }] },
{ id: 'combobox/async-multiple', upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/combobox/demos/async-multiple/index.ts', variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo7Variant0, files: ["docs/demos/combobox/async-multiple/css-modules/index.tsx","docs/demos/combobox/async-multiple/css-modules/index.module.css"] }, { id: 'tailwind', label: 'Tailwind', component: Demo7Variant1, files: ["docs/demos/combobox/async-multiple/tailwind/index.tsx"] }] },
{ id: 'combobox/virtualized', upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/combobox/demos/virtualized/index.ts', variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo8Variant0, files: ["docs/demos/combobox/virtualized/css-modules/index.tsx","docs/demos/combobox/virtualized/css-modules/index.module.css","docs/demos/combobox/virtualizer.ts"] }, { id: 'tailwind', label: 'Tailwind', component: Demo8Variant1, files: ["docs/demos/combobox/virtualized/tailwind/index.tsx","docs/demos/combobox/virtualizer.ts"] }] }
] satisfies DemoEntry[];
`;export{e as default};