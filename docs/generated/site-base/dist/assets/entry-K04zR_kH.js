var e=`import type { DemoEntry } from '../shared/types';
import Demo1 from './hero/css-modules';
import Demo2 from './hero/tailwind';
import Demo3 from './loading/css-modules';
import Demo4 from './loading/tailwind';
export default [
{ id: 'button/hero', upstream: "docs/src/app/(docs)/react/components/button/demos/hero/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo1, files: ["docs/demos/button/hero/css-modules/index.tsx","docs/demos/button/hero/css-modules/index.module.css"] },{ id: 'tailwind', label: 'Tailwind', component: Demo2, files: ["docs/demos/button/hero/tailwind/index.tsx"] }] },
{ id: 'button/loading', upstream: "docs/src/app/(docs)/react/components/button/demos/loading/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo3, files: ["docs/demos/button/loading/css-modules/index.tsx","docs/demos/button/loading/css-modules/index.module.css"] },{ id: 'tailwind', label: 'Tailwind', component: Demo4, files: ["docs/demos/button/loading/tailwind/index.tsx"] }] }
] satisfies DemoEntry[];
`;export{e as default};