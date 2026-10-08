import { DEV, OBSERVE, isDisposed } from 'solid-js';
import type { DiagnosticCode, DiagnosticEvent, Owner } from 'solid-js';
import { afterEach, beforeEach, expect, vi } from 'vitest';

type Message = { level: 'warn' | 'error'; text: string; approved: boolean };
let messages: Message[] = [];
let findings: { event: DiagnosticEvent; approved: boolean }[] = [];

/** A local, exact-count expectation; never a suite-wide warning allowlist. */
export async function expectDiagnostic(
  expected: { code?: DiagnosticCode; message: RegExp; count?: number },
  run: () => unknown | Promise<unknown>,
) {
  const start = messages.length;
  const diagnosticStart = findings.length;
  await run();
  const matches = messages.slice(start).filter((entry) => expected.message.test(entry.text));
  expect(matches, `expected diagnostic ${expected.message}`).toHaveLength(expected.count ?? 1);
  if (expected.code) {
    const codes = findings.slice(diagnosticStart).filter(({ event }) => event.code === expected.code);
    expect(codes, `structured diagnostic ${expected.code}`).toHaveLength(expected.count ?? 1);
    codes.forEach((entry) => { entry.approved = true; });
  }
  matches.forEach((entry) => { entry.approved = true; });
}

/** Installed before importing tests: module-scope owner/diagnostic mistakes also fail. */
export function installDiagnostics(options: { client: boolean; cleanup: () => void }) {
  const owners = new Set<Owner>();
  const previous = DEV?.hooks.onOwner;
  if (options.client && (!DEV || !OBSERVE)) throw new Error('HARNESS_CLIENT_CONDITIONS: browser/development required');
  if (DEV) DEV.hooks.onOwner = (owner) => { owners.add(owner); previous?.(owner); };
  OBSERVE?.diagnostics.subscribe((event) => {
    if (event.severity !== 'info') findings.push({ event, approved: false });
  });
  // Keep original output: failures must retain the runtime's explanatory evidence.
  for (const level of ['warn', 'error'] as const) {
    const original = console[level].bind(console);
    vi.spyOn(console, level).mockImplementation((...args: unknown[]) => {
      messages.push({ level, text: args.map(String).join(' '), approved: false });
      original(...args);
    });
  }
  beforeEach(() => {
    // Do not clear here: diagnostics emitted during test-module evaluation are failures too.
    expect(messages.filter((entry) => !entry.approved), 'module diagnostics').toEqual([]);
  });
  afterEach(async () => {
    const failures: unknown[] = [];
    try { options.cleanup(); } catch (error) { failures.push(error); }
    await Promise.resolve();
    if (options.client) {
      const living = [...owners].filter((owner) => !isDisposed(owner));
      if (living.length) failures.push(new Error(`HARNESS_OWNER_LEAK: ${living.length} undisposed reactive owners`));
    }
    const unexpected = messages.filter((entry) => !entry.approved);
    const unexpectedFindings = findings.filter((entry) => !entry.approved);
    if (unexpected.length || unexpectedFindings.length) {
      failures.push(new Error(`HARNESS_DIAGNOSTICS: ${JSON.stringify({ unexpected, unexpectedFindings })}`));
    }
    owners.clear();
    messages = [];
    findings = [];
    if (vi.isFakeTimers()) {
      const pending = vi.getTimerCount();
      vi.useRealTimers();
      if (pending) failures.push(new Error(`HARNESS_TIMER_LEAK: ${pending} pending timers`));
    }
    if (failures.length) throw new AggregateError(failures, failures.map(String).join('\n'));
  });
}
