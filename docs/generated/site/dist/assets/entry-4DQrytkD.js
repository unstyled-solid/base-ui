var e=`import type { DemoEntry } from '../shared/types';
import CssModules0 from './hero/css-modules';
import Tailwind0 from './hero/tailwind';
import CssModules1 from './nested/css-modules';
import Tailwind1 from './nested/tailwind';
import CssModules2 from './nested-inline/css-modules';
import Tailwind2 from './nested-inline/tailwind';

export default [
  {
    id: 'navigation-menu/hero',
    upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/navigation-menu/demos/hero/index.ts',
    variants: [
      { id: 'css-modules', label: 'CSS Modules', component: CssModules0, files: ['docs/demos/navigation-menu/hero/css-modules/index.tsx', 'docs/demos/navigation-menu/hero/css-modules/index.module.css'] },
      { id: 'tailwind', label: 'Tailwind', component: Tailwind0, files: ['docs/demos/navigation-menu/hero/tailwind/index.tsx'] },
    ],
  },
  {
    id: 'navigation-menu/nested',
    upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/navigation-menu/demos/nested/index.ts',
    variants: [
      { id: 'css-modules', label: 'CSS Modules', component: CssModules1, files: ['docs/demos/navigation-menu/nested/css-modules/index.tsx', 'docs/demos/navigation-menu/nested/css-modules/index.module.css'] },
      { id: 'tailwind', label: 'Tailwind', component: Tailwind1, files: ['docs/demos/navigation-menu/nested/tailwind/index.tsx'] },
    ],
  },
  {
    id: 'navigation-menu/nested-inline',
    upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/navigation-menu/demos/nested-inline/index.ts',
    variants: [
      { id: 'css-modules', label: 'CSS Modules', component: CssModules2, files: ['docs/demos/navigation-menu/nested-inline/css-modules/index.tsx', 'docs/demos/navigation-menu/nested-inline/css-modules/index.module.css', 'docs/demos/navigation-menu/nested-inline/data.ts'] },
      { id: 'tailwind', label: 'Tailwind', component: Tailwind2, files: ['docs/demos/navigation-menu/nested-inline/tailwind/index.tsx', 'docs/demos/navigation-menu/nested-inline/data.ts'] },
    ],
  },
] satisfies readonly DemoEntry[];
`;export{e as default};