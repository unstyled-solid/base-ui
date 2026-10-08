import { renderFixture } from './ssr';

for (const keepMounted of [false, true]) {
  const renderId = keepMounted ? 'avatar-kept' : 'avatar-preloaded';
  process.stdout.write(JSON.stringify(renderFixture({ renderId, keepMounted })) + '\n');
}
