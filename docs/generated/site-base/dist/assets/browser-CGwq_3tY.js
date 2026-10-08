var e=`import { mountDemo } from '../../../demos/shared/runtime';
import Stateful from './state';
import PortalFixture from './portal';

const host = document.getElementById('fixture')!;
const dispose = mountDemo(host, 'fixture/hero', { loadDemo: async () => ({
  id: 'fixture/hero', upstream: 'docs/example/index.ts', variants: [
    { id: 'state', label: 'CSS Modules', component: Stateful, files: ['docs/tests/demos/fixtures/state.tsx', 'docs/tests/demos/fixtures/style.module.css'] },
    { id: 'portal', label: 'Portal', component: PortalFixture, files: ['docs/tests/demos/fixtures/portal.tsx'] },
  ],
}) });
const unmount = document.createElement('button');
unmount.textContent = 'Unmount island';
unmount.addEventListener('click', dispose);
document.body.append(unmount);
`;export{e as default};