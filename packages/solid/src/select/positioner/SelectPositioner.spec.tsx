import { Select } from '../index';
// @ts-expect-error keepMounted is not a pinned Positioner prop
<Select.Positioner keepMounted />;
<Select.Positioner sideOffset={({ anchor, positioner, side, align }) => anchor.width + positioner.height + side.length + align.length} />;
