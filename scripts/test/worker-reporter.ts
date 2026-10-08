import { writeSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import type { TestCase, TestModule, Vitest } from 'vitest/node';
import type { Reporter } from 'vitest/reporters';

/** Scalar-only crash attribution; never retains rendered values or formats DOM. */
export default class WorkerReporter implements Reporter {
  private terminalAudit = '[HARNESS_FINAL] run did not reach completion\n';
  private pending = new Map<string, {
    file: string;
    phase: string;
    lastCompleted?: string;
    tests: Map<string, string>;
    remaining: Map<string, string>;
  }>();

  onInit(vitest: Vitest) {
    const target = vitest.config.browser.enabled ? 'browser' : vitest.config.pool;
    console.log(`[HARNESS_EXECUTION] pool=${target} maxWorkers=${vitest.config.maxWorkers} TZ=${process.env.TZ}`);
    // Default reporter stdout can precede its async stderr traces. Emit this
    // bounded scalar audit atomically at exit, after every reporter has finished.
    process.once('exit', () => { writeSync(1, this.terminalAudit); });
  }

  onTestModuleQueued(module: TestModule) {
    this.pending.set(module.id, { file: module.relativeModuleId, phase: 'queued/collection', tests: new Map(), remaining: new Map() });
  }
  onTestModuleCollected(module: TestModule) {
    const entry = this.pending.get(module.id);
    if (entry) entry.phase = 'collected/beforeAll';
    for (const test of module.children.allTests()) entry?.remaining.set(test.id, test.fullName);
  }
  onTestModuleStart(module: TestModule) {
    const entry = this.pending.get(module.id);
    if (entry) entry.phase = 'running tests/hooks';
  }
  onTestCaseReady(test: TestCase) {
    this.pending.get(test.module.id)?.tests.set(test.id, test.fullName);
  }
  onTestCaseResult(test: TestCase) {
    this.pending.get(test.module.id)?.tests.delete(test.id);
    this.pending.get(test.module.id)?.remaining.delete(test.id);
    const entry = this.pending.get(test.module.id);
    if (entry) entry.lastCompleted = test.fullName;
  }
  onTestModuleEnd(module: TestModule) {
    this.pending.delete(module.id);
  }
  onTestRunEnd: NonNullable<Reporter['onTestRunEnd']> = (modules, errors, reason) => {
    const counts = { passed: 0, failed: 0, skipped: 0, pending: 0 };
    const failures: string[] = [];
    let failedFiles = 0;
    for (const module of modules) {
      if (module.state() === 'failed') failedFiles++;
      for (const test of module.children.allTests()) {
        const result = test.result();
        counts[result.state]++;
        if (result.state === 'failed') {
          const original = test.fullName.replace(/\s+/g, ' ');
          const name = original.length > 360 ? `${original.slice(0, 320)}... sha256=${createHash('sha256').update(original).digest('hex').slice(0, 16)}` : original;
          failures.push(`[HARNESS_FAILURE] ${module.project.name} ${module.relativeModuleId}:${test.location?.line ?? '?'} ${name}`);
        }
      }
    }
    this.terminalAudit = `${failures.join('\n')}${failures.length ? '\n' : ''}[HARNESS_FINAL] ${reason}; files=${modules.length} failedFiles=${failedFiles}; passed=${counts.passed} failed=${counts.failed} skipped=${counts.skipped} pending=${counts.pending} unhandled=${errors.length} unfinishedModules=${this.pending.size}\n`;
    if (process.env.HARNESS_BATCH_RECEIPT) writeFileSync(process.env.HARNESS_BATCH_RECEIPT, JSON.stringify({
      reason, files: modules.map((module) => module.moduleId), failedFiles, ...counts,
      unhandled: errors.length, unfinishedModules: this.pending.size,
    }));
    for (const { file, phase, lastCompleted, tests, remaining } of this.pending.values()) {
      console.error(`[HARNESS_UNFINISHED_MODULE] ${file}`);
      for (const name of tests.values()) console.error(`[HARNESS_UNFINISHED_TEST] ${file} > ${name}`);
      // A process can die before its batched case-ready event reaches the parent.
      if (!tests.size && remaining.size === 1) {
        console.error(`[HARNESS_UNFINISHED_TEST] ${file} > ${remaining.values().next().value} (collected; execution state unavailable)`);
      }
      if (!tests.size) console.error(`[HARNESS_UNFINISHED_PHASE] ${file} phase=${phase}; remaining=${remaining.size}; lastCompleted=${lastCompleted ?? 'none'}`);
    }
    this.pending.clear();
  };
}
