import './matchers';
import { cleanup } from '../../packages/solid/test/createRenderer';
import { installDiagnostics } from './diagnostics';
import { beforeEach } from 'vitest';
import { installTimezoneRestoration } from './timezone';

installDiagnostics({ client: true, cleanup });
installTimezoneRestoration();
beforeEach(() => { globalThis.BASE_UI_ANIMATIONS_DISABLED = true; });
