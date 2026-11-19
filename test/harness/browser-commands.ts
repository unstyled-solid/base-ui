import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { basename, dirname, join } from 'node:path';
import { promisify } from 'node:util';
import { defineBrowserCommand } from '@vitest/browser-playwright';
import type { ScreenshotOptions } from 'vitest/browser';

type SerializedScreenshotOptions = Omit<ScreenshotOptions, 'element' | 'mask'> & { element?: string; mask?: string[] };
// The pinned provider implements this real command; its internal RPC is not
// declared by the client-facing SDK. Keep its actual payload/result precise.
declare module 'vitest/browser' {
  interface BrowserCommands {
    __vitest_takeScreenshot(name: string, options: SerializedScreenshotOptions): Promise<{ buffer: Buffer; path: string }>;
    prepareNativeDocument(): Promise<{ focused: boolean; connected: boolean }>;
    compositionPointer(action: 'down' | 'move' | 'up', selector: string): Promise<void>;
  }
}

export const compositionPointer = defineBrowserCommand(async (context, action: 'down' | 'move' | 'up', selector: string) => {
  if (action === 'up') { await context.page.mouse.up(); return; }
  const frame = await context.frame();
  await context.page.bringToFront();
  await frame.evaluate(() => window.focus());
  const box = await frame.locator(selector).boundingBox();
  if (!box) throw new Error(`Composition pointer target has no box: ${selector}`);
  if (action === 'down') {
    await context.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await context.page.mouse.down();
  } else await context.page.mouse.move(box.x + box.width / 2 + 25, box.y + box.height / 2);
});

export const focusNativeDocument = defineBrowserCommand(async (context) => {
  if (process.platform === 'darwin') {
    // Page focus alone can report true while the macOS application is inactive;
    // real pointer lock then rejects with WrongDocumentError.
    const browser = context.page.context().browser();
    const executable = process.env.HARNESS_CHROMIUM_EXECUTABLE ?? browser?.browserType().executablePath();
    const app = executable?.match(/^.*?\.app(?=\/)/)?.[0];
    if (app) await promisify(execFile)('osascript', ['-e', `tell application ${JSON.stringify(app)} to activate`], { timeout: 10_000 });
  }
  await context.page.bringToFront();
  const frame = await context.frame();
  const state = await frame.evaluate(() => {
    window.focus();
    return { focused: document.hasFocus(), connected: document.body.isConnected };
  });
  if (!state.focused || !state.connected) throw new Error('Native tester document is not focused/connected');
  return state;
});

export function screenshotName(name: string, identity: string) {
  const prefix = basename(name, '.png').replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 60);
  const hash = createHash('sha256').update(identity + '\0' + name).digest('hex').slice(0, 24);
  return `${prefix}-${hash}.png`;
}

/** Supported custom-command routing preserves the original Playwright capture. */
export const safeScreenshot = defineBrowserCommand(async (context, name: string, input: SerializedScreenshotOptions = {}) => {
  const identity = `${context.project.name}:${context.testPath}`;
  const options = { ...input, save: input.save ?? true };
  if (!options.save) options.base64 = true;
  if (options.path && Buffer.byteLength(basename(options.path)) > 240) {
    options.path = join(dirname(options.path), screenshotName(basename(options.path), identity));
  }
  const { buffer, path } = await context.triggerCommand('__vitest_takeScreenshot', screenshotName(name, identity), options);
  if (!options.save) return buffer.toString('base64');
  return options.base64 ? { path, base64: buffer.toString('base64') } : path;
});
