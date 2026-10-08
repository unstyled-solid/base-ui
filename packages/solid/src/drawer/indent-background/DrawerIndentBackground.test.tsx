import { describe } from 'vitest';
import { describeConformance, type ConformantComponentProps } from '../../../test/describeConformance';
import { DrawerIndentBackground, type DrawerIndentBackgroundState, type DrawerIndentBackgroundProps } from './DrawerIndentBackground';
describe('Drawer.IndentBackground conformance', () => {
  describeConformance<DrawerIndentBackgroundState, ConformantComponentProps<DrawerIndentBackgroundState>>(
    props => <DrawerIndentBackground {...props} render={props.render as DrawerIndentBackgroundProps['render']} />,
    { initialProps: {}, refInstanceof: HTMLDivElement },
  );
});
