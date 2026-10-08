var e=`import type { DemoEntry } from '../shared/types';
import Demo0Variant0 from './hero/css-modules';
import Demo0Variant1 from './hero/tailwind';
import Demo1Variant0 from './grouped/css-modules';
import Demo1Variant1 from './grouped/tailwind';
import Demo2Variant0 from './multiple/css-modules';
import Demo2Variant1 from './multiple/tailwind';
import Demo3Variant0 from './object-values/css-modules';
import Demo3Variant1 from './object-values/tailwind';

export default [
  {
    id: 'select/hero',
    upstream: 'docs/src/app/(docs)/react/components/select/demos/hero/index.ts',
    variants: [
      { id: 'css-modules', label: 'CSS Modules', component: Demo0Variant0, files: ["docs/demos/select/hero/css-modules/index.tsx","docs/demos/select/hero/css-modules/index.module.css"] },
      { id: 'tailwind', label: 'Tailwind', component: Demo0Variant1, files: ["docs/demos/select/hero/tailwind/index.tsx"] }
    ],
  },
  {
    id: 'select/grouped',
    upstream: 'docs/src/app/(docs)/react/components/select/demos/grouped/index.ts',
    variants: [
      { id: 'css-modules', label: 'CSS Modules', component: Demo1Variant0, files: ["docs/demos/select/grouped/css-modules/index.tsx","docs/demos/select/grouped/css-modules/index.module.css"] },
      { id: 'tailwind', label: 'Tailwind', component: Demo1Variant1, files: ["docs/demos/select/grouped/tailwind/index.tsx"] }
    ],
  },
  {
    id: 'select/multiple',
    upstream: 'docs/src/app/(docs)/react/components/select/demos/multiple/index.ts',
    variants: [
      { id: 'css-modules', label: 'CSS Modules', component: Demo2Variant0, files: ["docs/demos/select/multiple/css-modules/index.tsx","docs/demos/select/multiple/css-modules/index.module.css"] },
      { id: 'tailwind', label: 'Tailwind', component: Demo2Variant1, files: ["docs/demos/select/multiple/tailwind/index.tsx"] }
    ],
  },
  {
    id: 'select/object-values',
    upstream: 'docs/src/app/(docs)/react/components/select/demos/object-values/index.ts',
    variants: [
      { id: 'css-modules', label: 'CSS Modules', component: Demo3Variant0, files: ["docs/demos/select/object-values/css-modules/index.tsx","docs/demos/select/object-values/css-modules/index.module.css"] },
      { id: 'tailwind', label: 'Tailwind', component: Demo3Variant1, files: ["docs/demos/select/object-values/tailwind/index.tsx"] }
    ],
  }
] satisfies DemoEntry[];
`;export{e as default};