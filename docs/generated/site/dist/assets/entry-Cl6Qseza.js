var e=`import type { DemoEntry } from '../shared/types';
import HeroCssModules from './hero/css-modules';
import HeroTailwind from './hero/tailwind';
import AnimatedPanelsCssModules from './animated-panels/css-modules';
import AnimatedPanelsTailwind from './animated-panels/tailwind';

export default [
  {
    id: 'tabs/hero',
    upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/tabs/demos/hero/index.ts',
    variants: [
      {
        id: 'css-modules',
        label: 'CSS Modules',
        component: HeroCssModules,
        files: [
          'docs/demos/tabs/hero/css-modules/index.tsx',
          'docs/demos/tabs/hero/css-modules/index.module.css',
        ],
      },
      {
        id: 'tailwind',
        label: 'Tailwind',
        component: HeroTailwind,
        files: ['docs/demos/tabs/hero/tailwind/index.tsx'],
      },
    ],
  },
  {
    id: 'tabs/animated-panels',
    upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/tabs/demos/animated-panels/index.ts',
    variants: [
      {
        id: 'css-modules',
        label: 'CSS Modules',
        component: AnimatedPanelsCssModules,
        files: [
          'docs/demos/tabs/animated-panels/css-modules/index.tsx',
          'docs/demos/tabs/animated-panels/css-modules/index.module.css',
        ],
      },
      {
        id: 'tailwind',
        label: 'Tailwind',
        component: AnimatedPanelsTailwind,
        files: ['docs/demos/tabs/animated-panels/tailwind/index.tsx'],
      },
    ],
  },
] satisfies DemoEntry[];
`;export{e as default};