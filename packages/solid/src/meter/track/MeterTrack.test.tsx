import { describe } from 'vitest';
import { describeConformance } from '../../../test';
import { Meter } from '../index';

describe('Meter.Track', () => {
  describeConformance((props) => <Meter.Root value={30}><Meter.Track {...props} /></Meter.Root>, {
    initialProps: {}, refInstanceof: HTMLDivElement,
  });
});
