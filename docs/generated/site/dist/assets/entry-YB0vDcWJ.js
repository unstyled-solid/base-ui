var e=`import type { DemoEntry } from '../shared/types';
import heroCssModules from './hero/css-modules';
import heroTailwind from './hero/tailwind';
import closeConfirmationCssModules from './close-confirmation/css-modules';
import closeConfirmationTailwind from './close-confirmation/tailwind';
import indentProviderCssModules from './indent-provider/css-modules';
import indentProviderTailwind from './indent-provider/tailwind';
import mobileNavCssModules from './mobile-nav/css-modules';
import mobileNavTailwind from './mobile-nav/tailwind';
import nestedCssModules from './nested/css-modules';
import nestedTailwind from './nested/tailwind';
import nonModalCssModules from './non-modal/css-modules';
import nonModalTailwind from './non-modal/tailwind';
import positionCssModules from './position/css-modules';
import positionTailwind from './position/tailwind';
import snapPointsCssModules from './snap-points/css-modules';
import snapPointsTailwind from './snap-points/tailwind';
import swipeAreaCssModules from './swipe-area/css-modules';
import swipeAreaTailwind from './swipe-area/tailwind';
import uncontainedCssModules from './uncontained/css-modules';
import uncontainedTailwind from './uncontained/tailwind';
import virtualKeyboardAwareCssModules from './virtual-keyboard-aware/css-modules';
import virtualKeyboardAwareTailwind from './virtual-keyboard-aware/tailwind';

const entries: DemoEntry[] = [
  {
    id: 'drawer/hero',
    upstream: 'docs/src/app/(docs)/react/components/drawer/demos/hero/index.ts',
    variants: [
      { id: 'css-modules', label: 'CSS Modules', component: heroCssModules, files: ["docs/demos/drawer/hero/css-modules/index.tsx","docs/demos/drawer/hero/css-modules/index.module.css"] },
      { id: 'tailwind', label: 'Tailwind', component: heroTailwind, files: ["docs/demos/drawer/hero/tailwind/index.tsx"] }
    ],
  },
  {
    id: 'drawer/close-confirmation',
    upstream: 'docs/src/app/(docs)/react/components/drawer/demos/close-confirmation/index.ts',
    variants: [
      { id: 'css-modules', label: 'CSS Modules', component: closeConfirmationCssModules, files: ["docs/demos/drawer/close-confirmation/css-modules/index.tsx","docs/demos/drawer/close-confirmation/css-modules/index.module.css"] },
      { id: 'tailwind', label: 'Tailwind', component: closeConfirmationTailwind, files: ["docs/demos/drawer/close-confirmation/tailwind/index.tsx"] }
    ],
  },
  {
    id: 'drawer/indent-provider',
    upstream: 'docs/src/app/(docs)/react/components/drawer/demos/indent-provider/index.ts',
    variants: [
      { id: 'css-modules', label: 'CSS Modules', component: indentProviderCssModules, files: ["docs/demos/drawer/indent-provider/css-modules/index.tsx","docs/demos/drawer/indent-provider/css-modules/index.module.css"] },
      { id: 'tailwind', label: 'Tailwind', component: indentProviderTailwind, files: ["docs/demos/drawer/indent-provider/tailwind/index.tsx"] }
    ],
  },
  {
    id: 'drawer/mobile-nav',
    upstream: 'docs/src/app/(docs)/react/components/drawer/demos/mobile-nav/index.ts',
    variants: [
      { id: 'css-modules', label: 'CSS Modules', component: mobileNavCssModules, files: ["docs/demos/drawer/mobile-nav/css-modules/index.tsx","docs/demos/drawer/mobile-nav/css-modules/index.module.css"] },
      { id: 'tailwind', label: 'Tailwind', component: mobileNavTailwind, files: ["docs/demos/drawer/mobile-nav/tailwind/index.tsx"] }
    ],
  },
  {
    id: 'drawer/nested',
    upstream: 'docs/src/app/(docs)/react/components/drawer/demos/nested/index.ts',
    variants: [
      { id: 'css-modules', label: 'CSS Modules', component: nestedCssModules, files: ["docs/demos/drawer/nested/css-modules/index.tsx","docs/demos/drawer/nested/css-modules/index.module.css"] },
      { id: 'tailwind', label: 'Tailwind', component: nestedTailwind, files: ["docs/demos/drawer/nested/tailwind/index.tsx"] }
    ],
  },
  {
    id: 'drawer/non-modal',
    upstream: 'docs/src/app/(docs)/react/components/drawer/demos/non-modal/index.ts',
    variants: [
      { id: 'css-modules', label: 'CSS Modules', component: nonModalCssModules, files: ["docs/demos/drawer/non-modal/css-modules/index.tsx","docs/demos/drawer/non-modal/css-modules/index.module.css"] },
      { id: 'tailwind', label: 'Tailwind', component: nonModalTailwind, files: ["docs/demos/drawer/non-modal/tailwind/index.tsx"] }
    ],
  },
  {
    id: 'drawer/position',
    upstream: 'docs/src/app/(docs)/react/components/drawer/demos/position/index.ts',
    variants: [
      { id: 'css-modules', label: 'CSS Modules', component: positionCssModules, files: ["docs/demos/drawer/position/css-modules/index.tsx","docs/demos/drawer/position/css-modules/index.module.css"] },
      { id: 'tailwind', label: 'Tailwind', component: positionTailwind, files: ["docs/demos/drawer/position/tailwind/index.tsx"] }
    ],
  },
  {
    id: 'drawer/snap-points',
    upstream: 'docs/src/app/(docs)/react/components/drawer/demos/snap-points/index.ts',
    variants: [
      { id: 'css-modules', label: 'CSS Modules', component: snapPointsCssModules, files: ["docs/demos/drawer/snap-points/css-modules/index.tsx","docs/demos/drawer/snap-points/css-modules/index.module.css"] },
      { id: 'tailwind', label: 'Tailwind', component: snapPointsTailwind, files: ["docs/demos/drawer/snap-points/tailwind/index.tsx"] }
    ],
  },
  {
    id: 'drawer/swipe-area',
    upstream: 'docs/src/app/(docs)/react/components/drawer/demos/swipe-area/index.ts',
    variants: [
      { id: 'css-modules', label: 'CSS Modules', component: swipeAreaCssModules, files: ["docs/demos/drawer/swipe-area/css-modules/index.tsx","docs/demos/drawer/swipe-area/css-modules/index.module.css"] },
      { id: 'tailwind', label: 'Tailwind', component: swipeAreaTailwind, files: ["docs/demos/drawer/swipe-area/tailwind/index.tsx"] }
    ],
  },
  {
    id: 'drawer/uncontained',
    upstream: 'docs/src/app/(docs)/react/components/drawer/demos/uncontained/index.ts',
    variants: [
      { id: 'css-modules', label: 'CSS Modules', component: uncontainedCssModules, files: ["docs/demos/drawer/uncontained/css-modules/index.tsx","docs/demos/drawer/uncontained/css-modules/index.module.css"] },
      { id: 'tailwind', label: 'Tailwind', component: uncontainedTailwind, files: ["docs/demos/drawer/uncontained/tailwind/index.tsx"] }
    ],
  },
  {
    id: 'drawer/virtual-keyboard-aware',
    upstream: 'docs/src/app/(docs)/react/components/drawer/demos/virtual-keyboard-aware/index.ts',
    variants: [
      { id: 'css-modules', label: 'CSS Modules', component: virtualKeyboardAwareCssModules, files: ["docs/demos/drawer/virtual-keyboard-aware/css-modules/index.tsx","docs/demos/drawer/virtual-keyboard-aware/css-modules/index.module.css"] },
      { id: 'tailwind', label: 'Tailwind', component: virtualKeyboardAwareTailwind, files: ["docs/demos/drawer/virtual-keyboard-aware/tailwind/index.tsx"] }
    ],
  }
];

export default entries;
`;export{e as default};