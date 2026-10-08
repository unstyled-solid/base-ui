import { describe } from 'vitest';
import { describeConformance } from '../../../test';
import { NavigationMenuItem } from './NavigationMenuItem';
describe('NavigationMenu.Item', () => {
  describeConformance((props) => <NavigationMenuItem {...props} />, { initialProps: {}, refInstanceof: HTMLLIElement, testRenderPropWith: 'li' });
});
