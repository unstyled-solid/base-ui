import { describe } from 'vitest';
import { describeConformance, type ConformantComponentProps } from '../../../test/describeConformance';
import { DrawerIndent, type DrawerIndentState, type DrawerIndentProps } from './DrawerIndent';
describe('Drawer.Indent conformance', () => {
  describeConformance<DrawerIndentState, ConformantComponentProps<DrawerIndentState>>(
    props => <DrawerIndent {...props} render={props.render as DrawerIndentProps['render']} />,
    { initialProps: {}, refInstanceof: HTMLDivElement },
  );
});
