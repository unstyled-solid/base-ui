var e=`import type { DemoEntry } from '../shared/types';
import Demo0CssModules from './hero/css-modules/index';
import Demo0Tailwind from './hero/tailwind/index';
import Demo1CssModules from './arrow/css-modules/index';
import Demo1Tailwind from './arrow/tailwind/index';
import Demo2CssModules from './checkbox-items/css-modules/index';
import Demo2Tailwind from './checkbox-items/tailwind/index';
import Demo3CssModules from './detached-triggers-controlled/css-modules/index';
import Demo3Tailwind from './detached-triggers-controlled/tailwind/index';
import Demo4CssModules from './detached-triggers-full/css-modules/index';
import Demo4Tailwind from './detached-triggers-full/tailwind/index';
import Demo5CssModules from './detached-triggers-simple/css-modules/index';
import Demo5Tailwind from './detached-triggers-simple/tailwind/index';
import Demo6CssModules from './filter/css-modules/index';
import Demo6Tailwind from './filter/tailwind/index';
import Demo7CssModules from './group-labels/css-modules/index';
import Demo7Tailwind from './group-labels/tailwind/index';
import Demo8CssModules from './open-on-hover/css-modules/index';
import Demo8Tailwind from './open-on-hover/tailwind/index';
import Demo9CssModules from './radio-items/css-modules/index';
import Demo9Tailwind from './radio-items/tailwind/index';
import Demo10CssModules from './submenu/css-modules/index';
import Demo10Tailwind from './submenu/tailwind/index';

export default [
  {
    id: 'menu/hero',
    upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/menu/demos/hero/index.ts',
    variants: [
      { id: 'css-modules', label: 'CSS Modules', component: Demo0CssModules, files: ["docs/demos/menu/hero/css-modules/index.tsx","docs/demos/menu/hero/css-modules/index.module.css"] },
      { id: 'tailwind', label: 'Tailwind', component: Demo0Tailwind, files: ["docs/demos/menu/hero/tailwind/index.tsx"] },
    ],
  },
  {
    id: 'menu/arrow',
    upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/menu/demos/arrow/index.ts',
    variants: [
      { id: 'css-modules', label: 'CSS Modules', component: Demo1CssModules, files: ["docs/demos/menu/arrow/css-modules/index.tsx","docs/demos/menu/arrow/css-modules/index.module.css"] },
      { id: 'tailwind', label: 'Tailwind', component: Demo1Tailwind, files: ["docs/demos/menu/arrow/tailwind/index.tsx"] },
    ],
  },
  {
    id: 'menu/checkbox-items',
    upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/menu/demos/checkbox-items/index.ts',
    variants: [
      { id: 'css-modules', label: 'CSS Modules', component: Demo2CssModules, files: ["docs/demos/menu/checkbox-items/css-modules/index.tsx","docs/demos/menu/checkbox-items/css-modules/index.module.css"] },
      { id: 'tailwind', label: 'Tailwind', component: Demo2Tailwind, files: ["docs/demos/menu/checkbox-items/tailwind/index.tsx"] },
    ],
  },
  {
    id: 'menu/detached-triggers-controlled',
    upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/menu/demos/detached-triggers-controlled/index.ts',
    variants: [
      { id: 'css-modules', label: 'CSS Modules', component: Demo3CssModules, files: ["docs/demos/menu/detached-triggers-controlled/css-modules/index.tsx","docs/demos/menu/_index.module.css"] },
      { id: 'tailwind', label: 'Tailwind', component: Demo3Tailwind, files: ["docs/demos/menu/detached-triggers-controlled/tailwind/index.tsx"] },
    ],
  },
  {
    id: 'menu/detached-triggers-full',
    upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/menu/demos/detached-triggers-full/index.ts',
    variants: [
      { id: 'css-modules', label: 'CSS Modules', component: Demo4CssModules, files: ["docs/demos/menu/detached-triggers-full/css-modules/index.tsx","docs/demos/menu/detached-triggers-full/css-modules/index.module.css","docs/demos/menu/_index.module.css"] },
      { id: 'tailwind', label: 'Tailwind', component: Demo4Tailwind, files: ["docs/demos/menu/detached-triggers-full/tailwind/index.tsx"] },
    ],
  },
  {
    id: 'menu/detached-triggers-simple',
    upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/menu/demos/detached-triggers-simple/index.ts',
    variants: [
      { id: 'css-modules', label: 'CSS Modules', component: Demo5CssModules, files: ["docs/demos/menu/detached-triggers-simple/css-modules/index.tsx","docs/demos/menu/_index.module.css"] },
      { id: 'tailwind', label: 'Tailwind', component: Demo5Tailwind, files: ["docs/demos/menu/detached-triggers-simple/tailwind/index.tsx"] },
    ],
  },
  {
    id: 'menu/filter',
    upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/menu/demos/filter/index.ts',
    variants: [
      { id: 'css-modules', label: 'CSS Modules', component: Demo6CssModules, files: ["docs/demos/menu/filter/css-modules/index.tsx","docs/demos/menu/filter/css-modules/index.module.css"] },
      { id: 'tailwind', label: 'Tailwind', component: Demo6Tailwind, files: ["docs/demos/menu/filter/tailwind/index.tsx"] },
    ],
  },
  {
    id: 'menu/group-labels',
    upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/menu/demos/group-labels/index.ts',
    variants: [
      { id: 'css-modules', label: 'CSS Modules', component: Demo7CssModules, files: ["docs/demos/menu/group-labels/css-modules/index.tsx","docs/demos/menu/group-labels/css-modules/index.module.css"] },
      { id: 'tailwind', label: 'Tailwind', component: Demo7Tailwind, files: ["docs/demos/menu/group-labels/tailwind/index.tsx"] },
    ],
  },
  {
    id: 'menu/open-on-hover',
    upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/menu/demos/open-on-hover/index.ts',
    variants: [
      { id: 'css-modules', label: 'CSS Modules', component: Demo8CssModules, files: ["docs/demos/menu/open-on-hover/css-modules/index.tsx","docs/demos/menu/open-on-hover/css-modules/index.module.css"] },
      { id: 'tailwind', label: 'Tailwind', component: Demo8Tailwind, files: ["docs/demos/menu/open-on-hover/tailwind/index.tsx"] },
    ],
  },
  {
    id: 'menu/radio-items',
    upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/menu/demos/radio-items/index.ts',
    variants: [
      { id: 'css-modules', label: 'CSS Modules', component: Demo9CssModules, files: ["docs/demos/menu/radio-items/css-modules/index.tsx","docs/demos/menu/radio-items/css-modules/index.module.css"] },
      { id: 'tailwind', label: 'Tailwind', component: Demo9Tailwind, files: ["docs/demos/menu/radio-items/tailwind/index.tsx"] },
    ],
  },
  {
    id: 'menu/submenu',
    upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/menu/demos/submenu/index.ts',
    variants: [
      { id: 'css-modules', label: 'CSS Modules', component: Demo10CssModules, files: ["docs/demos/menu/submenu/css-modules/index.tsx","docs/demos/menu/submenu/css-modules/index.module.css"] },
      { id: 'tailwind', label: 'Tailwind', component: Demo10Tailwind, files: ["docs/demos/menu/submenu/tailwind/index.tsx"] },
    ],
  },
] satisfies readonly DemoEntry[];
`;export{e as default};