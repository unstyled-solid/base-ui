export interface PublicSourceEdit {
  start: number;
  end: number;
  original: string;
  specifier: string;
  replacement: string;
}
export const publicSourceAdaptation: { kind: string; version: number; from: string; to: string };
export function publicModuleSpecifier(specifier: string): string;
export function applyPublicSource(source: string, edits: readonly PublicSourceEdit[]): string;
