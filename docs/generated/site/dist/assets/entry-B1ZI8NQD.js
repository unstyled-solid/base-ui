var e=`import type { DemoEntry } from '../shared/types';
import Demo1 from './hero/css-modules';
import Demo2 from './hero/tailwind';
import Demo3 from './alphanumeric/css-modules';
import Demo4 from './alphanumeric/tailwind';
import Demo5 from './custom-sanitize/css-modules';
import Demo6 from './focused-placeholder/css-modules';
import Demo7 from './focused-placeholder/tailwind';
import Demo8 from './grouped/css-modules';
import Demo9 from './grouped/tailwind';
import Demo10 from './password/css-modules';
import Demo11 from './password/tailwind';
export default [
{ id: 'otp-field/hero', upstream: "docs/src/app/(docs)/react/components/otp-field/demos/hero/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo1, files: ["docs/demos/otp-field/hero/css-modules/index.tsx","docs/demos/otp-field/hero/css-modules/index.module.css"] },{ id: 'tailwind', label: 'Tailwind', component: Demo2, files: ["docs/demos/otp-field/hero/tailwind/index.tsx"] }] },
{ id: 'otp-field/alphanumeric', upstream: "docs/src/app/(docs)/react/components/otp-field/demos/alphanumeric/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo3, files: ["docs/demos/otp-field/alphanumeric/css-modules/index.tsx","docs/demos/otp-field/alphanumeric/css-modules/index.module.css"] },{ id: 'tailwind', label: 'Tailwind', component: Demo4, files: ["docs/demos/otp-field/alphanumeric/tailwind/index.tsx"] }] },
{ id: 'otp-field/custom-sanitize', upstream: "docs/src/app/(docs)/react/components/otp-field/demos/custom-sanitize/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo5, files: ["docs/demos/otp-field/custom-sanitize/css-modules/index.tsx","docs/demos/otp-field/custom-sanitize/useInvalidFeedback.ts","docs/demos/otp-field/custom-sanitize/css-modules/index.module.css"] }] },
{ id: 'otp-field/focused-placeholder', upstream: "docs/src/app/(docs)/react/components/otp-field/demos/focused-placeholder/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo6, files: ["docs/demos/otp-field/focused-placeholder/css-modules/index.tsx","docs/demos/otp-field/focused-placeholder/css-modules/index.module.css"] },{ id: 'tailwind', label: 'Tailwind', component: Demo7, files: ["docs/demos/otp-field/focused-placeholder/tailwind/index.tsx"] }] },
{ id: 'otp-field/grouped', upstream: "docs/src/app/(docs)/react/components/otp-field/demos/grouped/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo8, files: ["docs/demos/otp-field/grouped/css-modules/index.tsx","docs/demos/otp-field/grouped/css-modules/index.module.css"] },{ id: 'tailwind', label: 'Tailwind', component: Demo9, files: ["docs/demos/otp-field/grouped/tailwind/index.tsx"] }] },
{ id: 'otp-field/password', upstream: "docs/src/app/(docs)/react/components/otp-field/demos/password/index.ts", variants: [{ id: 'css-modules', label: 'CSS Modules', component: Demo10, files: ["docs/demos/otp-field/password/css-modules/index.tsx","docs/demos/otp-field/password/css-modules/index.module.css"] },{ id: 'tailwind', label: 'Tailwind', component: Demo11, files: ["docs/demos/otp-field/password/tailwind/index.tsx"] }] }
] satisfies DemoEntry[];
`;export{e as default};