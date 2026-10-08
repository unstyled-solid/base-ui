import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const input = JSON.parse(await fs.readFile('input.json', 'utf8'));
const results = [];
for (const kind of ['date-fns', 'luxon']) {
  if (input.kind !== 'both' && input.kind !== kind) continue;
  const name = kind === 'luxon' ? 'TemporalAdapterLuxon' : 'TemporalAdapterDateFns';
  const module = await import(`${input.name}/internals/temporal-adapter-${kind}`);
  const adapter = new module[name]();
  assert.equal(adapter.lib, kind);
  assert.equal(adapter.date(null, 'UTC'), null);
  const date = adapter.date('2024-03-30', 'Europe/Paris');
  const next = adapter.addDays(date, 2);
  assert.equal(adapter.getTimezone(date), 'Europe/Paris');
  assert.equal(adapter.getTimezone(next), 'Europe/Paris');
  assert.equal(adapter.getDate(next), 1);
  assert.equal(adapter.getMonth(next), 3);
  assert.equal(adapter.getHours(next), 0, 'Calendar-day arithmetic lost midnight at DST');
  assert.equal(adapter.toJsDate(next).getTime() - adapter.toJsDate(date).getTime(), 47 * 60 * 60 * 1000);
  results.push({ kind, timezone: adapter.getTimezone(next), elapsedHoursAcrossDST: 47, nullPreserved: true });
}
await fs.writeFile('temporal-result.json', JSON.stringify({ kind: input.kind, results }, null, 2));
