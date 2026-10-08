import { expect, it } from 'vitest';
import { renderToString } from '@solidjs/web';
import { Slider } from '../../slider';

it('real range Slider labels and thumbs keep server render registration pure', () => {
  const html = renderToString(() => <Slider.Root value={[0, 100]}><Slider.Label>Price</Slider.Label><Slider.Control><Slider.Thumb index={0} /><Slider.Thumb index={1} /></Slider.Control></Slider.Root>);
  expect(html).toContain('aria-valuenow="100"'); expect(html).not.toContain('aria-labelledby=');
});
