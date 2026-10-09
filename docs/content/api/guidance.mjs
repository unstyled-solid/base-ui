// Presentation-only explanations, keyed to the Solid declaration's source.
// Never use a prop/attribute name alone as evidence of a capability. These
// rules describe the inspected runtime below; they do not repair declarations.
const sourceFile = row => row.source?.file?.replace('packages/solid/build/types/', '').replace('packages/solid/src/', '').replace(/\.d\.ts$/, '.ts').replace(/\.tsx$/, '.ts');
const renderGuidance = {
  class: 'CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes.',
  style: 'Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles.',
  render: 'Customize the rendered element with a Solid callback: (props, state) => JSX. Spread the supplied live props onto the host, including its merged ref callback. This is not a pre-created JSX element to clone.',
};
// internals/contracts/render.ts, resolveClass.ts, resolveStyle.ts and
// createRenderElement.tsx: callbacks receive the live state, props and merged ref.
const bySource = {
  'internals/contracts/render.ts': renderGuidance,
  'internals/createRenderElement.ts': {
    ...renderGuidance,
    enabled: 'Whether to render the host. When false, no host is rendered.',
    ref: 'Host attachment refs, merged with the renderer’s own ref. Accepts a native input ref or an array of input refs, as declared.',
    state: 'Live component state supplied to the render, class and style callbacks and to state-attribute mapping.',
    props: 'Props merged in order onto the host. A function in the array receives the preceding merged props.',
    propGetter: 'Transforms the merged host props before rendering.',
    stateAttributesMapping: 'Custom mappings from state values to host attributes. A null mapping excludes that state property; a callback returning null emits no attributes for that value.',
  },
  'use-render/useRender.ts': {
    ...renderGuidance,
    defaultTagName: 'Host tag used when no render callback is supplied.',
  },
  'internals/contracts/core.ts': {
    nativeButton: 'Whether the rendered host is a native button. Set false when supplying a non-button host through render.',
  },
  // createAnchorPositioning.ts: geometry inputs, offset middleware and autoUpdate.
  'internals/createAnchorPositioning.ts': {
    anchor: 'Positioning reference: an element or virtual reference, or an accessor returning one. A nullish reference falls back to the root’s reference.',
    positionMethod: 'CSS positioning strategy used by the floating element: absolute or fixed.',
    side: 'Preferred side of the anchor. Logical inline sides follow the text direction; collision handling can change the resolved side.',
    align: 'Preferred alignment along the anchor’s side. Collision handling can change the resolved alignment.',
    sideOffset: 'Distance from the anchor along the side axis, in pixels. A callback receives anchor and positioner dimensions plus the side and alignment.',
    alignOffset: 'Offset along the alignment axis, in pixels. A callback receives anchor and positioner dimensions plus the side and alignment.',
    collisionBoundary: 'Boundary used to detect overflow. The clipping-ancestors value uses clipping ancestors as the overflow boundary.',
    collisionPadding: 'Space in pixels reserved inside the collision boundary, either for all edges or per edge.',
    collisionAvoidance: 'Controls flipping or shifting along the side and alignment axes, including fallback placement on the perpendicular axis.',
    sticky: 'Allows shifting along the side axis without the usual limitShift limiter.',
    arrowPadding: 'Minimum padding in pixels between the arrow and the floating element’s edges.',
    disableAnchorTracking: 'Disables ancestor-scroll, element-resize and layout-shift observation used for automatic positioning updates.',
  },
  // Root stores pass these exact inputs to the shared popup model. No defaults
  // are inferred from these explanations.
  'dialog/root/DialogRoot.ts': {
    defaultOpen: 'Initial open state for this root’s uncontrolled lifetime.',
    triggerId: 'Controlled ID of the active trigger.',
    defaultTriggerId: 'Initial active trigger ID for uncontrolled trigger selection.',
    onOpenChange: 'Called with the requested open state and native change details. Use details.cancel() to cancel the change.',
    onOpenChangeComplete: 'Called with the open state when the opening or closing transition completes.',
  },
  'popover/root/PopoverRoot.ts': {
    defaultOpen: 'Initial open state for this root’s uncontrolled lifetime.',
    open: 'Controlled open state of the popover.',
    triggerId: 'Controlled ID of the active trigger.',
    defaultTriggerId: 'Initial active trigger ID for uncontrolled trigger selection.',
    handle: 'Connects this root to a handle that can also be supplied to detached triggers. The root retains ownership of its model.',
    onOpenChange: 'Called with the requested open state and native change details. Use details.cancel() to cancel the change.',
    onOpenChangeComplete: 'Called with the open state when the opening or closing transition completes.',
    children: 'Content, or a callback receiving live payload state from the active trigger.',
  },
  'dialog/trigger/DialogTrigger.ts': {
    disabled: 'Whether the trigger ignores user interaction.',
    nativeButton: 'Whether the rendered host is a native button. Set false when the render callback supplies a non-button host.',
    handle: 'Connects a trigger to the handle’s root, including when the trigger is outside that root’s subtree.',
    payload: 'Payload registered with this trigger and exposed by the root when this trigger is active.',
  },
  'popover/trigger/PopoverTrigger.ts': {
    disabled: 'Whether the trigger ignores user interaction.',
    nativeButton: 'Whether the rendered host is a native button. Set false when the render callback supplies a non-button host.',
    handle: 'Connects a trigger to the handle’s root, including when the trigger is outside that root’s subtree.',
    payload: 'Payload registered with this trigger and exposed by the root when this trigger is active.',
    openOnHover: 'Whether mouse hover can open the popover.',
    delay: 'Mouse rest delay in milliseconds before hover opens the popover.',
    closeDelay: 'Delay in milliseconds before hover closes the popover.',
  },
  'dialog/popup/DialogPopup.ts': {
    open: 'Whether this dialog is open.',
    nested: 'Whether this dialog is nested inside another dialog.',
    nestedDialogOpen: 'Whether at least one nested dialog is open.',
    transitionStatus: 'Current transition phase: starting, ending, idle, or unavailable, as declared.',
  },
  'popover/positioner/PopoverPositioner.ts': {
    open: 'Whether this popover is open.',
    side: 'Resolved side after positioning and collision handling.',
    align: 'Resolved alignment after positioning and collision handling.',
    anchorHidden: 'Whether the positioning anchor is hidden by its clipping boundary.',
  },
  // CollapsibleRoot/createCollapsibleRoot and Panel/createCollapsiblePanel.
  'collapsible/root/CollapsibleRoot.ts': {
    open: 'Controlled open state of the collapsible panel.',
    defaultOpen: 'Initial open state when the collapsible is uncontrolled.',
    disabled: 'Whether the collapsible’s triggers are disabled.',
    onOpenChange: 'Called with the requested open state and native change details. Use details.cancel() to cancel the change.',
  },
  'collapsible/root/createCollapsibleRoot.ts': {
    open: 'Whether the collapsible panel is open.',
    disabled: 'Whether the collapsible’s triggers are disabled.',
    transitionStatus: 'Current transition phase: starting, ending, idle, or unavailable, as declared.',
  },
  'collapsible/trigger/CollapsibleTrigger.ts': {
    disabled: 'Overrides the root’s disabled setting for this trigger.',
    nativeButton: 'Whether the rendered host is a native button. Set false when the render callback supplies a non-button host.',
  },
  'collapsible/panel/CollapsiblePanel.ts': {
    keepMounted: 'Keeps the closed panel mounted. hiddenUntilFound also keeps it mounted even if keepMounted is false.',
    hiddenUntilFound: 'Uses hidden="until-found" for the closed panel, keeping it mounted so browser find-in-page can reveal it through beforematch.',
  },
  // Native change details: createBaseUIEventDetails.ts and contracts/events.ts.
  'internals/createBaseUIEventDetails.ts': {
    reason: 'Reason for the requested change; it discriminates the native event type.',
    event: 'Native DOM event associated with the change. Programmatic changes can use a Base UI-created Event.',
    cancel: 'Cancels the Base UI change transaction; separate from the DOM event’s preventDefault() and preventBaseUIHandler().',
    isCanceled: 'Whether cancel() has been called for this change transaction.',
    allowPropagation: 'Marks this change transaction as allowing propagation.',
    isPropagationAllowed: 'Whether allowPropagation() has been called for this change transaction.',
    trigger: 'Trigger element associated with this change, when available.',
  },
};

// Only these inspected families/parts are covered. Attributes must already
// exist in the entry: the presentation layer never manufactures metadata.
const attributeGuidance = {
  'button/Button.ts': { 'data-disabled': 'Present when the button is disabled.' },
  'dialog/trigger/DialogTrigger.ts': {
    'data-disabled': 'Present when this trigger is disabled.',
    'data-popup-open': 'Present when the dialog is open and this is its active trigger.',
  },
  'dialog/popup/DialogPopup.ts': {
    'data-open': 'Present when the dialog is open.',
    'data-closed': 'Present when the dialog is closed, including while its closing transition remains mounted.',
    'data-nested': 'Present when this dialog is nested inside another dialog.',
    'data-nested-dialog-open': 'Present when at least one nested dialog is open.',
  },
  'popover/trigger/PopoverTrigger.ts': {
    'data-disabled': 'Present when this trigger is disabled.',
    'data-popup-open': 'Present when the popover is open and this is its active trigger.',
    'data-pressed': 'Present when this trigger’s popover is open and the open-change reason is trigger-press. Hover opening alone does not set it.',
  },
  // PopoverPositioner -> createPositioner -> popupStateMapping and default
  // getStateAttributesProps for side/align. No transition attrs are invented.
  'popover/positioner/PopoverPositioner.ts': {
    'data-open': 'Present when the popover is open.',
    'data-closed': 'Present when the popover is closed.',
    'data-anchor-hidden': 'Present when the positioning anchor is hidden by its clipping boundary.',
    'data-side': 'Resolved side of the anchor after positioning and collision handling.',
    'data-align': 'Resolved alignment after positioning and collision handling.',
  },
  'collapsible/root/CollapsibleRoot.ts': {
    'data-open': 'Present when the collapsible panel is open.',
    'data-closed': 'Present when the collapsible panel is closed.',
    'data-disabled': 'Present when the collapsible root is disabled.',
  },
  'collapsible/panel/CollapsiblePanel.ts': {
    'data-open': 'Present when the panel is open.',
    'data-closed': 'Present when the panel is closed and still mounted.',
    'data-disabled': 'Present when the collapsible root is disabled.',
  },
  'collapsible/trigger/CollapsibleTrigger.ts': {
    'data-panel-open': 'Present when the collapsible panel is open.',
    'data-disabled': 'Reflects the root’s disabled state; the trigger’s disabled prop separately overrides its button behavior.',
  },
};

/** Return an enriched view; retain canonical types, defaults and requiredness.
 * Works with catalog exports and resolved references. Related references,
 * helper parameters and return properties are handled recursively. */
export function enrichReference(entry) {
  if (!entry || typeof entry !== 'object') return entry;
  const fill = (row, description) => row.description?.trim() || !description ? { ...row } : { ...row, description };
  const property = row => fill(row, bySource[sourceFile(row)]?.[row.name]);
  const result = { ...entry };
  for (const field of ['props', 'properties', 'parameters']) if (entry[field]) result[field] = entry[field].map(property);
  if (entry.dataAttributes) result.dataAttributes = entry.dataAttributes.map(row => fill(row, attributeGuidance[sourceFile(entry)]?.[row.name]));
  if (entry.related) result.related = entry.related.map(enrichReference);
  if (entry.returnValue) result.returnValue = { ...entry.returnValue, ...(entry.returnValue.properties ? { properties: entry.returnValue.properties.map(property) } : {}) };
  return result;
}
