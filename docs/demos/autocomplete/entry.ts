import type { DemoEntry } from '../shared/types';
import Demo0CssModules from './hero/css-modules';
import Demo0Tailwind from './hero/tailwind';
import Demo1CssModules from './async/css-modules';
import Demo1Tailwind from './async/tailwind';
import Demo2CssModules from './auto-highlight/css-modules';
import Demo2Tailwind from './auto-highlight/tailwind';
import Demo3CssModules from './command-palette/css-modules';
import Demo3Tailwind from './command-palette/tailwind';
import Demo4CssModules from './fuzzy-matching/css-modules';
import Demo4Tailwind from './fuzzy-matching/tailwind';
import Demo5CssModules from './grid/css-modules';
import Demo5Tailwind from './grid/tailwind';
import Demo6CssModules from './grouped/css-modules';
import Demo6Tailwind from './grouped/tailwind';
import Demo7CssModules from './inline/css-modules';
import Demo7Tailwind from './inline/tailwind';
import Demo8CssModules from './keyboard-shortcuts/css-modules';
import Demo8Tailwind from './keyboard-shortcuts/tailwind';
import Demo9CssModules from './limit/css-modules';
import Demo9Tailwind from './limit/tailwind';
import Demo10CssModules from './virtualized/css-modules';
import Demo10Tailwind from './virtualized/tailwind';

export default [
  { id: 'autocomplete/hero', upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/autocomplete/demos/hero/index.ts', variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo0CssModules, files: ["docs/demos/autocomplete/hero/css-modules/index.tsx","docs/demos/autocomplete/hero/css-modules/index.module.css"] }, { id: 'tailwind', label: 'Tailwind', component: Demo0Tailwind, files: ["docs/demos/autocomplete/hero/tailwind/index.tsx"] }] },
  { id: 'autocomplete/async', upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/autocomplete/demos/async/index.ts', variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo1CssModules, files: ["docs/demos/autocomplete/async/css-modules/index.tsx","docs/demos/autocomplete/async/css-modules/index.module.css"] }, { id: 'tailwind', label: 'Tailwind', component: Demo1Tailwind, files: ["docs/demos/autocomplete/async/tailwind/index.tsx"] }] },
  { id: 'autocomplete/auto-highlight', upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/autocomplete/demos/auto-highlight/index.ts', variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo2CssModules, files: ["docs/demos/autocomplete/auto-highlight/css-modules/index.tsx","docs/demos/autocomplete/auto-highlight/css-modules/index.module.css"] }, { id: 'tailwind', label: 'Tailwind', component: Demo2Tailwind, files: ["docs/demos/autocomplete/auto-highlight/tailwind/index.tsx"] }] },
  { id: 'autocomplete/command-palette', upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/autocomplete/demos/command-palette/index.ts', variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo3CssModules, files: ["docs/demos/autocomplete/command-palette/css-modules/index.tsx","docs/demos/autocomplete/command-palette/css-modules/index.module.css"] }, { id: 'tailwind', label: 'Tailwind', component: Demo3Tailwind, files: ["docs/demos/autocomplete/command-palette/tailwind/index.tsx"] }] },
  { id: 'autocomplete/fuzzy-matching', upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/autocomplete/demos/fuzzy-matching/index.ts', variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo4CssModules, files: ["docs/demos/autocomplete/fuzzy-matching/css-modules/index.tsx","docs/demos/autocomplete/fuzzy-matching/css-modules/index.module.css","docs/demos/autocomplete/vendor/match-sorter.js","docs/demos/autocomplete/vendor/remove-accents.js"] }, { id: 'tailwind', label: 'Tailwind', component: Demo4Tailwind, files: ["docs/demos/autocomplete/fuzzy-matching/tailwind/index.tsx","docs/demos/autocomplete/vendor/match-sorter.js","docs/demos/autocomplete/vendor/remove-accents.js"] }] },
  { id: 'autocomplete/grid', upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/autocomplete/demos/grid/index.ts', variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo5CssModules, files: ["docs/demos/autocomplete/grid/css-modules/index.tsx","docs/demos/autocomplete/grid/css-modules/index.module.css"] }, { id: 'tailwind', label: 'Tailwind', component: Demo5Tailwind, files: ["docs/demos/autocomplete/grid/tailwind/index.tsx"] }] },
  { id: 'autocomplete/grouped', upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/autocomplete/demos/grouped/index.ts', variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo6CssModules, files: ["docs/demos/autocomplete/grouped/css-modules/index.tsx","docs/demos/autocomplete/grouped/css-modules/index.module.css"] }, { id: 'tailwind', label: 'Tailwind', component: Demo6Tailwind, files: ["docs/demos/autocomplete/grouped/tailwind/index.tsx"] }] },
  { id: 'autocomplete/inline', upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/autocomplete/demos/inline/index.ts', variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo7CssModules, files: ["docs/demos/autocomplete/inline/css-modules/index.tsx","docs/demos/autocomplete/inline/css-modules/index.module.css"] }, { id: 'tailwind', label: 'Tailwind', component: Demo7Tailwind, files: ["docs/demos/autocomplete/inline/tailwind/index.tsx"] }] },
  { id: 'autocomplete/keyboard-shortcuts', upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/autocomplete/demos/keyboard-shortcuts/index.ts', variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo8CssModules, files: ["docs/demos/autocomplete/keyboard-shortcuts/css-modules/index.tsx","docs/demos/autocomplete/keyboard-shortcuts/css-modules/index.module.css"] }, { id: 'tailwind', label: 'Tailwind', component: Demo8Tailwind, files: ["docs/demos/autocomplete/keyboard-shortcuts/tailwind/index.tsx"] }] },
  { id: 'autocomplete/limit', upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/autocomplete/demos/limit/index.ts', variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo9CssModules, files: ["docs/demos/autocomplete/limit/css-modules/index.tsx","docs/demos/autocomplete/limit/css-modules/index.module.css"] }, { id: 'tailwind', label: 'Tailwind', component: Demo9Tailwind, files: ["docs/demos/autocomplete/limit/tailwind/index.tsx"] }] },
  { id: 'autocomplete/virtualized', upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/autocomplete/demos/virtualized/index.ts', variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo10CssModules, files: ["docs/demos/autocomplete/virtualized/css-modules/index.tsx","docs/demos/autocomplete/virtualized/css-modules/index.module.css","docs/demos/autocomplete/virtualizer.ts","docs/demos/autocomplete/vendor/virtual-index.js","docs/demos/autocomplete/vendor/virtual-utils.js","docs/demos/autocomplete/vendor/lazy-measurements.js"] }, { id: 'tailwind', label: 'Tailwind', component: Demo10Tailwind, files: ["docs/demos/autocomplete/virtualized/tailwind/index.tsx","docs/demos/autocomplete/virtualizer.ts","docs/demos/autocomplete/vendor/virtual-index.js","docs/demos/autocomplete/vendor/virtual-utils.js","docs/demos/autocomplete/vendor/lazy-measurements.js"] }] }
] satisfies DemoEntry[];
