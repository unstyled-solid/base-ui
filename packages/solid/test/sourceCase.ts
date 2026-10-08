import { it } from 'vitest';
export interface SourceCase {
  source: string;
  case: string;
  environment: 'jsdom' | 'ssr' | 'browser';
  adaptation?: string;
  issue?: string;
}
/** Stable, grep/report-visible source annotation; parameterized cases include parameters in case. */
export function sourceCase(source: SourceCase, run: () => unknown | Promise<unknown>) {
  return it(`[source:${source.source}#${source.case}]`, run);
}
/** Browser bodies stay executable/discoverable; only the jsdom environment skips them. */
export function browserCase(source: SourceCase & { issue: string }, run: () => unknown | Promise<unknown>) {
  if (!source.issue) throw new Error('Browser deferrals require a qualification issue');
  return it.skipIf(typeof window !== 'undefined' && /jsdom/.test(window.navigator.userAgent))(
    `[browser:${source.issue}] [source:${source.source}#${source.case}]`, run,
  );
}
