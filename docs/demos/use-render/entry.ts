import type { DemoEntry } from '../shared/types';
import Demo1 from './render-callback/css-modules';
import Demo2 from './render/css-modules';
export default [
{ id: 'use-render/render-callback', upstream: "docs/src/app/(docs)/react/utils/use-render/demos/render-callback/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo1, files: ["docs/demos/use-render/render-callback/css-modules/index.tsx","docs/demos/use-render/render-callback/css-modules/index.module.css"] }] },
{ id: 'use-render/render', upstream: "docs/src/app/(docs)/react/utils/use-render/demos/render/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo2, files: ["docs/demos/use-render/render/css-modules/index.tsx","docs/demos/use-render/render/css-modules/index.module.css"] }] }
] satisfies DemoEntry[];
