import { afterEach, beforeEach } from 'vitest';
import { userEvent, cdp, server } from 'vitest/browser';
import './setup';
import { resetBrowserPointer } from '../../packages/solid/test/resetBrowserPointer';
import { isNativeDocumentLane, prepareNativeDocument } from '../../packages/solid/test/nativeDocument';

afterEach(async () => { await resetBrowserPointer(userEvent); });
beforeEach(async () => { if (isNativeDocumentLane()) await prepareNativeDocument(); });

// Exact existing Dialog driver contract: raw top-level CDP coordinates are
// computed by the owner fixture, and events originate from Chromium itself.
if (server.browser === 'chromium') {
  const globals = globalThis as typeof globalThis & { BASE_UI_DIALOG_TRUSTED_POINTER_DRIVER?: { send: ReturnType<typeof cdp>['send'] } };
  globals.BASE_UI_DIALOG_TRUSTED_POINTER_DRIVER = { send: (command, parameters) => cdp().send(command, parameters) };
}
