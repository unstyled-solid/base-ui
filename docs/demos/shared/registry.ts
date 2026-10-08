import type { DemoEntry, DemoFamily } from './types';

export type FamilyLoader = () => Promise<{ default: DemoFamily }>;
const families = import.meta.glob<{ default: DemoFamily }>('../*/entry.ts');
// Raw imports are build inputs, never transformed snippets or library internals.
const sources = import.meta.glob<string>(['../**/*.{tsx,ts,js,css,json,svg}', '!../shared/**', '!../**/*.test.*', '!../**/*.config.*', '!../**/.*/**', '!../**/validation/**', '../../tests/demos/fixtures/**'], {
  query: '?raw', import: 'default',
});
const assets = import.meta.glob<string>('../**/*.{png,jpg,jpeg,gif,webp,avif,ico,woff,woff2,ttf,otf,mp4,webm,pdf}', {
  query: '?url', import: 'default',
});

export async function loadAsset(path: string): Promise<string> {
  if (!path.startsWith('docs/demos/') || path.includes('..')) throw new Error(`Invalid demo asset: ${path}`);
  const load = assets[`../${path.slice('docs/demos/'.length)}`];
  if (!load) throw new Error(`Missing demo asset: ${path}`);
  return load();
}

export function createRegistry(loaders: Record<string, FamilyLoader>) {
  return async (id: string): Promise<DemoEntry> => {
    const family = id.split('/')[0];
    const load = loaders[`../${family}/entry.ts`];
    if (!load) throw new Error(`Demo ${id}: missing docs/demos/${family}/entry.ts`);
    const entries = (await load()).default;
    const matches = entries.filter(entry => entry.id === id);
    if (matches.length !== 1) throw new Error(`Demo ${id}: expected one entry, found ${matches.length}`);
    const entry = matches[0];
    if (!entry.variants.length) throw new Error(`Demo ${id}: no executable variants`);
    return entry;
  };
}

export const loadDemo = createRegistry(families);
export async function loadSource(path: string): Promise<string> {
  if (path.includes('..') || (!path.startsWith('docs/demos/') && !path.startsWith('docs/tests/demos/fixtures/'))) throw new Error(`Invalid demo source: ${path}`);
  const key = path.startsWith('docs/demos/') ? `../${path.slice('docs/demos/'.length)}` : `../../${path.slice('docs/'.length)}`;
  const load = sources[key];
  if (!load) throw new Error(`Missing raw demo source: ${path}`);
  return load();
}
