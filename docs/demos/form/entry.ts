import type { DemoEntry } from '../shared/types';
import HeroCssModules from './hero/css-modules';
import HeroTailwind from './hero/tailwind';
import FormActionCssModules from './form-action/css-modules';
import FormActionTailwind from './form-action/tailwind';
import ZodCssModules from './zod/css-modules';
import ZodTailwind from './zod/tailwind';

export default [
  {
    id: 'form/hero',
    upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/form/demos/hero/index.ts',
    variants: [
      { id: 'css-modules', label: 'CSS Modules', component: HeroCssModules, files: ['docs/demos/form/hero/css-modules/index.tsx', 'docs/demos/form/hero/css-modules/index.module.css'] },
      { id: 'tailwind', label: 'Tailwind', component: HeroTailwind, files: ['docs/demos/form/hero/tailwind/index.tsx'] },
    ],
  },
  {
    id: 'form/form-action',
    upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/form/demos/form-action/index.ts',
    variants: [
      { id: 'css-modules', label: 'CSS Modules', component: FormActionCssModules, files: ['docs/demos/form/form-action/css-modules/index.tsx', 'docs/demos/form/form-action/css-modules/index.module.css'] },
      { id: 'tailwind', label: 'Tailwind', component: FormActionTailwind, files: ['docs/demos/form/form-action/tailwind/index.tsx'] },
    ],
  },
  {
    id: 'form/zod',
    upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/form/demos/zod/index.ts',
    variants: [
      { id: 'css-modules', label: 'CSS Modules', component: ZodCssModules, files: ['docs/demos/form/zod/css-modules/index.tsx', 'docs/demos/form/zod/css-modules/index.module.css'] },
      { id: 'tailwind', label: 'Tailwind', component: ZodTailwind, files: ['docs/demos/form/zod/tailwind/index.tsx'] },
    ],
  },
] satisfies DemoEntry[];
