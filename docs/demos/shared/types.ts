import type { Component } from 'solid-js';

/** Source files are loaded by the build from these repository-relative paths. */
export interface DemoVariant {
  id: string;
  label: string;
  component: Component;
  files: readonly string[];
}

/** One entry for each real upstream createDemo export; no generated source strings. */
export interface DemoEntry {
  id: string;
  upstream: string;
  variants: readonly DemoVariant[];
}

/** Family-local entry.ts exports a default readonly DemoEntry[]. */
export type DemoFamily = readonly DemoEntry[];
