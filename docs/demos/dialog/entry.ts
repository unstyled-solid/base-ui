import type { DemoEntry } from '../shared/types';
import Demo0CssModules from './hero/css-modules/index';
import Demo0Tailwind from './hero/tailwind/index';
import Demo1CssModules from './close-confirmation/css-modules/index';
import Demo1Tailwind from './close-confirmation/tailwind/index';
import Demo2CssModules from './detached-triggers-controlled/css-modules/index';
import Demo2Tailwind from './detached-triggers-controlled/tailwind/index';
import Demo3CssModules from './detached-triggers-simple/css-modules/index';
import Demo3Tailwind from './detached-triggers-simple/tailwind/index';
import Demo4CssModules from './focus-management/css-modules/index';
import Demo4Tailwind from './focus-management/tailwind/index';
import Demo5CssModules from './inside-scroll/css-modules/index';
import Demo5Tailwind from './inside-scroll/tailwind/index';
import Demo6CssModules from './nested/css-modules/index';
import Demo6Tailwind from './nested/tailwind/index';
import Demo7CssModules from './open-from-menu/css-modules/index';
import Demo7Tailwind from './open-from-menu/tailwind/index';
import Demo8CssModules from './outside-scroll/css-modules/index';
import Demo8Tailwind from './outside-scroll/tailwind/index';
import Demo9CssModules from './uncontained/css-modules/index';
import Demo9Tailwind from './uncontained/tailwind/index';

export default [
  { id: 'dialog/hero', upstream: 'docs/src/app/(docs)/react/components/dialog/demos/hero/index.ts', variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo0CssModules, files: ["docs/demos/dialog/hero/css-modules/index.tsx","docs/demos/dialog/hero/css-modules/index.module.css"] }, { id: 'tailwind', label: 'Tailwind', component: Demo0Tailwind, files: ["docs/demos/dialog/hero/tailwind/index.tsx"] }] },
  { id: 'dialog/close-confirmation', upstream: 'docs/src/app/(docs)/react/components/dialog/demos/close-confirmation/index.ts', variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo1CssModules, files: ["docs/demos/dialog/close-confirmation/css-modules/index.tsx","docs/demos/dialog/close-confirmation/css-modules/index.module.css"] }, { id: 'tailwind', label: 'Tailwind', component: Demo1Tailwind, files: ["docs/demos/dialog/close-confirmation/tailwind/index.tsx"] }] },
  { id: 'dialog/detached-triggers-controlled', upstream: 'docs/src/app/(docs)/react/components/dialog/demos/detached-triggers-controlled/index.ts', variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo2CssModules, files: ["docs/demos/dialog/detached-triggers-controlled/css-modules/index.tsx","docs/demos/dialog/_index.module.css"] }, { id: 'tailwind', label: 'Tailwind', component: Demo2Tailwind, files: ["docs/demos/dialog/detached-triggers-controlled/tailwind/index.tsx"] }] },
  { id: 'dialog/detached-triggers-simple', upstream: 'docs/src/app/(docs)/react/components/dialog/demos/detached-triggers-simple/index.ts', variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo3CssModules, files: ["docs/demos/dialog/detached-triggers-simple/css-modules/index.tsx","docs/demos/dialog/_index.module.css"] }, { id: 'tailwind', label: 'Tailwind', component: Demo3Tailwind, files: ["docs/demos/dialog/detached-triggers-simple/tailwind/index.tsx"] }] },
  { id: 'dialog/focus-management', upstream: 'docs/src/app/(docs)/react/components/dialog/demos/focus-management/index.ts', variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo4CssModules, files: ["docs/demos/dialog/focus-management/css-modules/index.tsx","docs/demos/dialog/focus-management/css-modules/index.module.css"] }, { id: 'tailwind', label: 'Tailwind', component: Demo4Tailwind, files: ["docs/demos/dialog/focus-management/tailwind/index.tsx"] }] },
  { id: 'dialog/inside-scroll', upstream: 'docs/src/app/(docs)/react/components/dialog/demos/inside-scroll/index.ts', variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo5CssModules, files: ["docs/demos/dialog/inside-scroll/css-modules/index.tsx","docs/demos/dialog/inside-scroll/css-modules/index.module.css"] }, { id: 'tailwind', label: 'Tailwind', component: Demo5Tailwind, files: ["docs/demos/dialog/inside-scroll/tailwind/index.tsx"] }] },
  { id: 'dialog/nested', upstream: 'docs/src/app/(docs)/react/components/dialog/demos/nested/index.ts', variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo6CssModules, files: ["docs/demos/dialog/nested/css-modules/index.tsx","docs/demos/dialog/nested/css-modules/index.module.css"] }, { id: 'tailwind', label: 'Tailwind', component: Demo6Tailwind, files: ["docs/demos/dialog/nested/tailwind/index.tsx"] }] },
  { id: 'dialog/open-from-menu', upstream: 'docs/src/app/(docs)/react/components/dialog/demos/open-from-menu/index.ts', variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo7CssModules, files: ["docs/demos/dialog/open-from-menu/css-modules/index.tsx","docs/demos/dialog/open-from-menu/css-modules/index.module.css"] }, { id: 'tailwind', label: 'Tailwind', component: Demo7Tailwind, files: ["docs/demos/dialog/open-from-menu/tailwind/index.tsx"] }] },
  { id: 'dialog/outside-scroll', upstream: 'docs/src/app/(docs)/react/components/dialog/demos/outside-scroll/index.ts', variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo8CssModules, files: ["docs/demos/dialog/outside-scroll/css-modules/index.tsx","docs/demos/dialog/outside-scroll/css-modules/index.module.css"] }, { id: 'tailwind', label: 'Tailwind', component: Demo8Tailwind, files: ["docs/demos/dialog/outside-scroll/tailwind/index.tsx"] }] },
  { id: 'dialog/uncontained', upstream: 'docs/src/app/(docs)/react/components/dialog/demos/uncontained/index.ts', variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo9CssModules, files: ["docs/demos/dialog/uncontained/css-modules/index.tsx","docs/demos/dialog/uncontained/css-modules/index.module.css"] }, { id: 'tailwind', label: 'Tailwind', component: Demo9Tailwind, files: ["docs/demos/dialog/uncontained/tailwind/index.tsx"] }] }
] satisfies DemoEntry[];
