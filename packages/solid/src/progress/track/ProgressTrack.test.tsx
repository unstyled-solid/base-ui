// Source: pinned ProgressTrack.test.tsx.
import { describe } from 'vitest';
import { describeConformance } from '../../../test';
import { Progress } from '../index';
import type { ProgressTrackProps } from './ProgressTrack';

describe('Progress.Track', () => {
  describeConformance((props) => <Progress.Root value={40}><Progress.Track {...props as ProgressTrackProps} /></Progress.Root>, {
    initialProps: {}, refInstanceof: HTMLDivElement,
  });
});
