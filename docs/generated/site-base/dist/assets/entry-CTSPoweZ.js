var e=`import type { DemoEntry } from '../shared/types';
import HeroCssModules from './hero/css-modules';
import HeroTailwind from './hero/tailwind';
import MultipleCssModules from './multiple/css-modules';
import MultipleTailwind from './multiple/tailwind';
import HiddenUntilFoundCssModules from './hidden-until-found/css-modules';
import HiddenUntilFoundTailwind from './hidden-until-found/tailwind';

export default [
  {
    id: 'accordion/hero',
    upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/accordion/demos/hero/index.ts',
    variants: [
      { id: 'css-modules', label: 'CSS Modules', component: HeroCssModules, files: ['docs/demos/accordion/hero/css-modules/index.tsx', 'docs/demos/accordion/_index.module.css'] },
      { id: 'tailwind', label: 'Tailwind', component: HeroTailwind, files: ['docs/demos/accordion/hero/tailwind/index.tsx'] },
    ],
  },
  {
    id: 'accordion/multiple',
    upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/accordion/demos/multiple/index.ts',
    variants: [
      { id: 'css-modules', label: 'CSS Modules', component: MultipleCssModules, files: ['docs/demos/accordion/multiple/css-modules/index.tsx', 'docs/demos/accordion/_index.module.css'] },
      { id: 'tailwind', label: 'Tailwind', component: MultipleTailwind, files: ['docs/demos/accordion/multiple/tailwind/index.tsx'] },
    ],
  },
  {
    id: 'accordion/hidden-until-found',
    upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/accordion/demos/hidden-until-found/index.ts',
    variants: [
      { id: 'css-modules', label: 'CSS Modules', component: HiddenUntilFoundCssModules, files: ['docs/demos/accordion/hidden-until-found/css-modules/index.tsx', 'docs/demos/accordion/_index.module.css'] },
      { id: 'tailwind', label: 'Tailwind', component: HiddenUntilFoundTailwind, files: ['docs/demos/accordion/hidden-until-found/tailwind/index.tsx'] },
    ],
  },
] satisfies readonly DemoEntry[];
`;export{e as default};