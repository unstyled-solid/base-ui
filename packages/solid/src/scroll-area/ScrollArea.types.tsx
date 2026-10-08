import { ScrollArea, ScrollAreaRootCssVariables, ScrollAreaViewportCssVariables, ScrollAreaScrollbarCssVariables, ScrollAreaThumbDataAttributes } from './index';

export const fixture = () => <ScrollArea.Root overflowEdgeThreshold={{ xStart: 4, yEnd: 8 }}
  class={(state) => ({ scrolling: state.scrolling, overflow: state.hasOverflowY })}
  render={(props, state) => <div {...props} data-corner-hidden={state.cornerHidden} />}>
  <ScrollArea.Viewport tabindex={0}><ScrollArea.Content /></ScrollArea.Viewport>
  <ScrollArea.Scrollbar orientation="horizontal" keepMounted aria-hidden={undefined}>
    <ScrollArea.Thumb onPointerDown={(event) => event.preventBaseUIHandler()} />
  </ScrollArea.Scrollbar><ScrollArea.Corner />
</ScrollArea.Root>;
export const cssAndAttributes: readonly string[] = [ScrollAreaRootCssVariables.scrollAreaCornerWidth,
  ScrollAreaViewportCssVariables.scrollAreaOverflowXStart, ScrollAreaScrollbarCssVariables.scrollAreaThumbWidth,
  ScrollAreaThumbDataAttributes.orientation];
// @ts-expect-error no React element-clone render API
const invalidRender = <ScrollArea.Root render={<div />} />;
// @ts-expect-error source has exactly two scrollbar orientations
const invalidOrientation = <ScrollArea.Scrollbar orientation="diagonal" />;
// @ts-expect-error native Solid 2 spelling
const invalidClass = <ScrollArea.Root className="legacy" />;
void [invalidRender, invalidOrientation, invalidClass];
