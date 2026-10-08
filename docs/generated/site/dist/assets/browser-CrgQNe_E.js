var e=`import { mountDemo } from '../../../demos/shared/runtime';
import Stateful, { lifecycle } from './state';
import PortalFixture from './portal';

const host = document.getElementById('fixture')!;
Object.assign(window, { fixtureLifecycle: lifecycle });
const options = {
  loadDemo: async () => ({
    id: 'fixture/hero',
    upstream: 'docs/example/index.ts',
    variants: [
      {
        id: 'state',
        label: 'CSS Modules',
        component: Stateful,
        files: [
          'docs/tests/demos/fixtures/state.tsx',
          'docs/tests/demos/fixtures/style.module.css',
        ],
      },
      {
        id: 'portal',
        label: 'Portal',
        component: PortalFixture,
        files: ['docs/tests/demos/fixtures/portal.tsx'],
      },
    ],
  }),
};
let dispose = mountDemo(host, 'fixture/hero', options);
const remount = document.createElement('button');
remount.textContent = 'Remount island';
remount.addEventListener('click', () => {
  dispose = mountDemo(host, 'fixture/hero', options);
});
const unmount = document.createElement('button');
unmount.textContent = 'Unmount island';
unmount.addEventListener('click', () => dispose());
document.body.append(remount, unmount);
`;export{e as default};