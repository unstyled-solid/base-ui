import { expect, it, vi } from 'vitest';
import { renderToString } from '@solidjs/web';
import { Slider } from './index';
import { CSPContext } from '../internals/csp-context/CSPContext';
import { FieldRoot } from '../field/root/FieldRoot';

it('Slider SSR preserves sorted/clamped range shape and explicit thumb indexes', () => {
  const frozen = Object.freeze([120, -20]);
  const html = renderToString(() => <Slider.Root value={frozen}>
    <Slider.Label>Price</Slider.Label><Slider.Value />
    <Slider.Control><Slider.Thumb index={0} /><Slider.Thumb index={1} /></Slider.Control>
  </Slider.Root>, { renderId: 'slider-' });
  expect(frozen).toEqual([120, -20]);
  expect(html).toContain('aria-valuenow="0"');
  expect(html).toContain('aria-valuenow="100"');
  expect(html).toContain('data-index="0"');
  expect(html).toContain('data-index="1"');
  expect(html).not.toContain('aria-labelledby=');
  expect(html).not.toContain('<script');
  expect(html).toMatch(/role="group"[^>]*id="[^"]+"/);
  expect(html).toMatch(/id="[^"]+-label"/);
});
it('Slider SSR edge script is emitted once under the last thumb with the CSP nonce', () => {
  const html = renderToString(() => <CSPContext value={{ nonce: 'slider-nonce' }}>
    <Slider.Root value={[30, 70]} thumbAlignment="edge">
      <Slider.Control><Slider.Indicator /><Slider.Thumb index={0} /><Slider.Thumb index={1} /></Slider.Control>
    </Slider.Root>
  </CSPContext>);
  expect(html.match(/<script\b/g)).toHaveLength(1);
  expect(html).toContain('nonce="slider-nonce"');
  expect(html.indexOf('<script')).toBeGreaterThan(html.indexOf('data-index="1"'));
  expect(html.indexOf('<script')).toBeLessThan(html.indexOf('</div>', html.indexOf('data-index="1"')));
  expect(html).toContain('data-base-ui-slider-control');
  expect(html).toContain('data-base-ui-slider-indicator');
  expect(html).toContain('document.currentScript');
  expect(html.match(/\bvalue="30"/g)).toHaveLength(1);
  expect(html.match(/\bvalue="70"/g)).toHaveLength(1);
});
it('Slider SSR edge-client-only omits the script and remains hidden pending measurement', () => {
  const html = renderToString(() => <Slider.Root value={30} thumbAlignment="edge-client-only">
    <Slider.Control><Slider.Indicator /><Slider.Thumb /></Slider.Control>
  </Slider.Root>);
  expect(html).not.toContain('<script');
  expect(html).toContain('visibility:hidden');
});

// Pinned Root.test.tsx:125-145: server labels have IDs but registration/linkage
// is a client effect. Thumb/Control refs and DOM-effect cleanup likewise do not
// run during React SSR. RC13 actually disposes owners when rendering completes.
it.each([false, true])('Slider SSR disposal stays pure with all parts and disabled=%s', (disabled) => {
  const ref = vi.fn();
  const inputRef = vi.fn();
  for (const value of [30, [20, 80]] as const) {
    const html = renderToString(() => <FieldRoot name="volume" disabled={disabled}>
      <Slider.Root id="volume" value={value}>
        <Slider.Label>Volume</Slider.Label><Slider.Value />
        <Slider.Control ref={ref}><Slider.Track><Slider.Indicator />
          <Slider.Thumb index={0} inputRef={inputRef} />
          {Array.isArray(value) && <Slider.Thumb index={1} inputRef={inputRef} />}
        </Slider.Track></Slider.Control>
      </Slider.Root>
    </FieldRoot>);
    expect(html).toContain('id="volume-label"');
    expect(html).toContain('role="group"');
    expect(html).toContain('name="volume"');
    expect(html).toContain('aria-valuenow="' + (Array.isArray(value) ? 20 : 30) + '"');
    expect(html).not.toContain('aria-labelledby=');
    expect(html).not.toContain('<script');
  }
  expect(ref).not.toHaveBeenCalled();
  expect(inputRef).not.toHaveBeenCalled();
});
