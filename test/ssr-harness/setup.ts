import { installDiagnostics } from '../harness/diagnostics';
import { installTimezoneRestoration } from '../harness/timezone';
installDiagnostics({ client: false, cleanup() {} });
installTimezoneRestoration();
