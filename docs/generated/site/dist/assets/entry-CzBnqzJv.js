var e=`import type { DemoEntry } from '../shared/types';
import Demo1 from './hero/css-modules';
import Demo2 from './hero/tailwind';
export default [
{ id: 'fieldset/hero', upstream: "docs/src/app/(docs)/react/components/fieldset/demos/hero/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo1, files: ["docs/demos/fieldset/hero/css-modules/index.tsx","docs/demos/fieldset/hero/css-modules/index.module.css"] },{ id: 'tailwind', label: 'Tailwind', component: Demo2, files: ["docs/demos/fieldset/hero/tailwind/index.tsx"] }] }
] satisfies DemoEntry[];
`;export{e as default};