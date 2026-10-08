import { describe, expect, it } from 'vitest';
import { createRenderer, describeConformance } from '../../../test';
import { AvatarRoot } from './AvatarRoot';
import type { AvatarRootProps, AvatarRootState } from './AvatarRoot';
import type { ConformantComponentProps } from '../../../test/describeConformance';
const Avatar = { Root: AvatarRoot };

describe('Avatar.Root', () => {
  describeConformance<AvatarRootState, AvatarRootProps & ConformantComponentProps<AvatarRootState>>((props) => <Avatar.Root {...props} />, {
    initialProps: {}, refInstanceof: HTMLSpanElement,
  });
  it('uses span and exposes idle render state without inventing loading data attributes', async () => {
    const view = await createRenderer().render(() => <Avatar.Root data-testid="root" class={(state) => state.imageLoadingStatus} />);
    expect(view.getByTestId('root').tagName).toBe('SPAN');
    expect(view.getByTestId('root')).toHaveClass('idle');
    expect(view.getByTestId('root')).not.toHaveAttribute('data-image-loading-status');
  });
});
