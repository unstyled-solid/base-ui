import type { DemoEntry } from '../shared/types';
import Demo1 from './hero/css-modules';
import Demo2 from './hero/tailwind';
import Demo3 from './nested/css-modules';
import Demo4 from './parent/css-modules';
export default [
{ id: 'checkbox-group/hero', upstream: "docs/src/app/(docs)/react/components/checkbox-group/demos/hero/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo1, files: ["docs/demos/checkbox-group/hero/css-modules/index.tsx","docs/demos/checkbox-group/hero/css-modules/index.module.css"] },{ id: 'tailwind', label: 'Tailwind', component: Demo2, files: ["docs/demos/checkbox-group/hero/tailwind/index.tsx"] }] },
{ id: 'checkbox-group/nested', upstream: "docs/src/app/(docs)/react/components/checkbox-group/demos/nested/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo3, files: ["docs/demos/checkbox-group/nested/css-modules/index.tsx","docs/demos/checkbox-group/nested/css-modules/index.module.css"] }] },
{ id: 'checkbox-group/parent', upstream: "docs/src/app/(docs)/react/components/checkbox-group/demos/parent/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo4, files: ["docs/demos/checkbox-group/parent/css-modules/index.tsx","docs/demos/checkbox-group/parent/css-modules/index.module.css"] }] }
] satisfies DemoEntry[];
