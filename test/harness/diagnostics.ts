import { DEV, OBSERVE, isDisposed } from 'solid-js';
import type { DiagnosticCode, DiagnosticEvent, Owner } from 'solid-js';
import { afterEach, beforeEach, expect, vi } from 'vitest';
import { attribution } from 'solid-js/attribution';

type Message = { level: 'warn' | 'error'; text: string; approved: boolean };
let messages: Message[] = [];
let findings: { event: DiagnosticEvent; approved: boolean }[] = [];

/** Explicit structural-performance lane for a fixed workload on shared CI.
 * Only HOT_SCOPE_TIME becomes report-only, and only after all count budgets pass.
 * Runtime thresholds/output and every other diagnostic remain unchanged.
 */
export async function withAttributionBudget(
  budget: { reason: string; maxCreates: number; maxReruns: number; maxRerunsPerScope: number },
  run: () => Promise<void> | void,
) {
  if (!OBSERVE) throw new Error('Attribution budgets require the development runtime');
  if (!budget.reason.trim() || [budget.maxCreates, budget.maxReruns, budget.maxRerunsPerScope]
    .some(value => !Number.isInteger(value) || value < 0)) throw new Error('Invalid attribution budget');
  const start = messages.length, diagnosticStart = findings.length;
  const counts = new Map<number, number>();
  let creates = 0, reruns = 0;
  const release = attribution.enable({ log: false });
  const stopCreate = OBSERVE.records.subscribe('create', () => { creates++; });
  const stopRun = OBSERVE.records.subscribe('rerun', event => {
    reruns++;
    counts.set(event.nodeId, (counts.get(event.nodeId) ?? 0) + 1);
  });
  try {
    await run();
    const maxRerunsPerScope = Math.max(0, ...counts.values());
    const measured = { creates, reruns, maxRerunsPerScope };
    // Check graph work, not elapsed time. Excessive construction or reruns still
    // fail; expensive individual computations remain visible in timing reports.
    expect(creates, 'ATTRIBUTION_CREATE_BUDGET').toBeLessThanOrEqual(budget.maxCreates);
    expect(reruns, 'ATTRIBUTION_RERUN_BUDGET').toBeLessThanOrEqual(budget.maxReruns);
    expect(maxRerunsPerScope, 'ATTRIBUTION_SCOPE_BUDGET').toBeLessThanOrEqual(budget.maxRerunsPerScope);
    const timings = findings.slice(diagnosticStart).filter(({ event }) => event.code === 'HOT_SCOPE_TIME');
    for (const entry of timings) {
      entry.approved = true;
      // Approve only output paired with a captured structured event, never a
      // regex-wide warning exemption or a diagnostic from outside this scope.
      messages.slice(start).filter(message => message.text === entry.event.message ||
        message.text.startsWith(`${entry.event.message}\n`)).forEach(message => { message.approved = true; });
    }
    if (timings.length) console.info('[HARNESS_ATTRIBUTION_TIMING]', JSON.stringify({
      reason: budget.reason, measured, timings: timings.map(({ event }) => event),
    }));
    return { ...measured, timings: timings.map(({ event }) => event) };
  } finally { stopRun(); stopCreate(); release(); }
}

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
