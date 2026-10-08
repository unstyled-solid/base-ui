import type { DemoEntry } from '../shared/types';
import CssModules from './hero/css-modules';
import Tailwind from './hero/tailwind';

export default [
  {
    id: 'field/hero',
    upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/field/demos/hero/index.ts',
    variants: [
      {
        id: 'css-modules',
        label: 'CSS Modules',
        component: CssModules,
        files: [
          'docs/demos/field/hero/css-modules/index.tsx',
          'docs/demos/field/hero/css-modules/index.module.css',
        ],
      },
      {
        id: 'tailwind',
        label: 'Tailwind',
        component: Tailwind,
        files: ['docs/demos/field/hero/tailwind/index.tsx'],
      },
    ],
  },
] satisfies DemoEntry[];
