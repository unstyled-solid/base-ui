<a id="collapsible"></a>

# Collapsible

A collapsible panel controlled by a button.

[Open mounted Solid demo: collapsible/hero](/solid/components/collapsible)

<a id="anatomy"></a>

## Anatomy

Import the component and assemble its parts:

```tsx
import { Collapsible } from '@unstyled-solid/base-ui/collapsible';
<Collapsible.Root>
  <Collapsible.Trigger />
  <Collapsible.Panel />
</Collapsible.Root>;
```

<a id="examples"></a>

## Examples

<a id="hidden-until-found"></a>

### Hidden until found

The `hiddenUntilFound` prop hides the closed panel with [`hidden="until-found"`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/hidden) so the browser can search its contents with find-in-page—<kbd>Ctrl</kbd>+<kbd>F</kbd> (<kbd>Cmd</kbd>+<kbd>F</kbd> on macOS)—and reveal the panel when a match is found. The closed panel always remains mounted in the DOM, which also makes its contents indexable by search engines.

Older browsers that don't support `hidden="until-found"` keep the panel hidden until its trigger opens it, and find-in-page skips over the contents.

```tsx
<Collapsible.Root>
  <Collapsible.Trigger>Shipping details</Collapsible.Trigger>

  <Collapsible.Panel hiddenUntilFound>
    Standard shipping takes 3–5 business days.
  </Collapsible.Panel>
</Collapsible.Root>;
```

See the [Accordion example](/solid/components/accordion#hidden-until-found) for an interactive demo.

<a id="api-reference"></a>

## API reference

<a id="root"></a>

### Root

<a id="api-436f6c6c61707369626c652e526f6f74"></a>

<a id="collapsibleroot"></a>

<a id="api-436f6c6c61707369626c652e526f6f742e2470726f70732e70726f703a616c69676e"></a>

### Collapsible.Root

Declaration: `packages/solid/build/types/collapsible/root/CollapsibleRoot.d.ts:4`

#### Declaration

```typescript
(props: CollapsibleRootProps) => JSX.Element
```

<a id="api-436f6c6c61707369626c652e526f6f742e2470726f70732e64656661756c744f70656e"></a>

<a id="CollapsibleRoot-defaultOpen"></a>

<a id="api-436f6c6c61707369626c652e526f6f742e2470726f70732e6f70656e"></a>

<a id="CollapsibleRoot-open"></a>

<a id="api-436f6c6c61707369626c652e526f6f742e2470726f70732e6f6e4f70656e4368616e6765"></a>

<a id="CollapsibleRoot-onOpenChange"></a>

<a id="api-436f6c6c61707369626c652e526f6f742e2470726f70732e64697361626c6564"></a>

<a id="CollapsibleRoot-disabled"></a>

<a id="api-436f6c6c61707369626c652e526f6f742e2470726f70732e636c617373"></a>

<a id="CollapsibleRoot-class"></a>

<a id="api-436f6c6c61707369626c652e526f6f742e2470726f70732e7374796c65"></a>

<a id="CollapsibleRoot-style"></a>

<a id="api-436f6c6c61707369626c652e526f6f742e2470726f70732e72656e646572"></a>

<a id="CollapsibleRoot-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultOpen | `boolean \| undefined` | No | false | Initial open state when the collapsible is uncontrolled. |
| open | `boolean \| undefined` | No | Unavailable | Controlled open state of the collapsible panel. |
| onOpenChange | `((open: boolean, details: CollapsibleRootChangeEventDetails) => void) \| undefined` | No | Unavailable | Called with the requested open state and native change details. Use details.cancel() to cancel the change. |
| disabled | `boolean \| undefined` | No | false | Whether the collapsible’s triggers are disabled. |
| class | `JSX.ClassValue \| ((state: Readonly<CollapsibleRootState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<CollapsibleRootState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, CollapsibleRootState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-436f6c6c61707369626c65526f6f7444617461417474726962757465732e6f70656e"></a>

<a id="api-436f6c6c61707369626c65526f6f7444617461417474726962757465732e636c6f736564"></a>

<a id="api-436f6c6c61707369626c652e526f6f742e64617461417474726962757465732e646174612d64697361626c6564"></a>

<a id="api-436f6c6c61707369626c65526f6f7444617461417474726962757465732e7374617274696e675374796c65"></a>

<a id="api-436f6c6c61707369626c65526f6f7444617461417474726962757465732e656e64696e675374796c65"></a>

| Name | Description |
| --- | --- |
| data-open | Present when open is true. |
| data-closed | Present when open is false. |
| data-disabled | Present when disabled is truthy. |
| data-starting-style | Present when transitionStatus is 'starting'. |
| data-ending-style | Present when transitionStatus is 'ending'. |

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6c6c61707369626c652e526f6f742e50726f7073"></a>

<a id="collapsiblerootprops"></a>

<a id="api-436f6c6c61707369626c652e526f6f742e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Collapsible.Root.Props

Declaration: `packages/solid/build/types/collapsible/root/CollapsibleRoot.d.ts:16`

#### Declaration

```typescript
CollapsibleRootProps
```

<a id="api-436f6c6c61707369626c652e526f6f742e50726f70732e64656661756c744f70656e"></a>

<a id="CollapsibleRootProps-defaultOpen"></a>

<a id="api-436f6c6c61707369626c652e526f6f742e50726f70732e6f70656e"></a>

<a id="CollapsibleRootProps-open"></a>

<a id="api-436f6c6c61707369626c652e526f6f742e50726f70732e6f6e4f70656e4368616e6765"></a>

<a id="CollapsibleRootProps-onOpenChange"></a>

<a id="api-436f6c6c61707369626c652e526f6f742e50726f70732e64697361626c6564"></a>

<a id="CollapsibleRootProps-disabled"></a>

<a id="api-436f6c6c61707369626c652e526f6f742e50726f70732e636c617373"></a>

<a id="CollapsibleRootProps-class"></a>

<a id="api-436f6c6c61707369626c652e526f6f742e50726f70732e7374796c65"></a>

<a id="CollapsibleRootProps-style"></a>

<a id="api-436f6c6c61707369626c652e526f6f742e50726f70732e72656e646572"></a>

<a id="CollapsibleRootProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultOpen | `boolean \| undefined` | No | Unavailable | Initial open state when the collapsible is uncontrolled. |
| open | `boolean \| undefined` | No | Unavailable | Controlled open state of the collapsible panel. |
| onOpenChange | `((open: boolean, details: CollapsibleRootChangeEventDetails) => void) \| undefined` | No | Unavailable | Called with the requested open state and native change details. Use details.cancel() to cancel the change. |
| disabled | `boolean \| undefined` | No | Unavailable | Whether the collapsible’s triggers are disabled. |
| class | `JSX.ClassValue \| ((state: Readonly<CollapsibleRootState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<CollapsibleRootState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, CollapsibleRootState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6c6c61707369626c652e526f6f742e5374617465"></a>

<a id="collapsiblerootstate"></a>

### Related exported type: Collapsible.Root.State

Declaration: `packages/solid/build/types/collapsible/root/CollapsibleRoot.d.ts:17`

#### Declaration

```typescript
CollapsibleRootState
```

<a id="api-436f6c6c61707369626c652e526f6f742e53746174652e6f70656e"></a>

<a id="CollapsibleRootState-open"></a>

<a id="api-436f6c6c61707369626c652e526f6f742e53746174652e7472616e736974696f6e537461747573"></a>

<a id="CollapsibleRootState-transitionStatus"></a>

<a id="api-436f6c6c61707369626c652e526f6f742e53746174652e64697361626c6564"></a>

<a id="CollapsibleRootState-disabled"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable | Whether the collapsible panel is open. |
| transitionStatus | `TransitionStatus` | Yes | Unavailable | Current transition phase: starting, ending, idle, or unavailable, as declared. |
| disabled | `boolean` | Yes | Unavailable | Whether the collapsible’s triggers are disabled. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6c6c61707369626c652e526f6f742e4368616e67654576656e74526561736f6e"></a>

<a id="collapsiblerootchangeeventreason"></a>

### Related exported type: Collapsible.Root.ChangeEventReason

Declaration: `packages/solid/build/types/collapsible/root/CollapsibleRoot.d.ts:18`

#### Declaration

```typescript
CollapsibleRootChangeEventReason
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6c6c61707369626c652e526f6f742e4368616e67654576656e7444657461696c73"></a>

<a id="collapsiblerootchangeeventdetails"></a>

### Related exported type: Collapsible.Root.ChangeEventDetails

Declaration: `packages/solid/build/types/collapsible/root/CollapsibleRoot.d.ts:19`

#### Declaration

```typescript
CollapsibleRootChangeEventDetails
```

<a id="api-436f6c6c61707369626c652e526f6f742e4368616e67654576656e7444657461696c732e616c6c6f7750726f7061676174696f6e"></a>

<a id="CollapsibleRootChangeEventDetails-allowPropagation"></a>

<a id="api-436f6c6c61707369626c652e526f6f742e4368616e67654576656e7444657461696c732e63616e63656c"></a>

<a id="CollapsibleRootChangeEventDetails-cancel"></a>

<a id="api-436f6c6c61707369626c652e526f6f742e4368616e67654576656e7444657461696c732e6576656e74"></a>

<a id="CollapsibleRootChangeEventDetails-event"></a>

<a id="api-436f6c6c61707369626c652e526f6f742e4368616e67654576656e7444657461696c732e697343616e63656c6564"></a>

<a id="CollapsibleRootChangeEventDetails-isCanceled"></a>

<a id="api-436f6c6c61707369626c652e526f6f742e4368616e67654576656e7444657461696c732e697350726f7061676174696f6e416c6c6f776564"></a>

<a id="CollapsibleRootChangeEventDetails-isPropagationAllowed"></a>

<a id="api-436f6c6c61707369626c652e526f6f742e4368616e67654576656e7444657461696c732e726561736f6e"></a>

<a id="CollapsibleRootChangeEventDetails-reason"></a>

<a id="api-436f6c6c61707369626c652e526f6f742e4368616e67654576656e7444657461696c732e74726967676572"></a>

<a id="CollapsibleRootChangeEventDetails-trigger"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| allowPropagation | `() => void` | Yes | Unavailable | Marks this change transaction as allowing propagation. |
| cancel | `() => void` | Yes | Unavailable | Cancels the Base UI change transaction; separate from the DOM event’s preventDefault() and preventBaseUIHandler(). |
| event | `PointerEvent \| MouseEvent \| Event \| KeyboardEvent \| TouchEvent` | Yes | Unavailable | Native DOM event associated with the change. Programmatic changes can use a Base UI-created Event. |
| isCanceled | `boolean` | Yes | Unavailable | Whether cancel() has been called for this change transaction. |
| isPropagationAllowed | `boolean` | Yes | Unavailable | Whether allowPropagation() has been called for this change transaction. |
| reason | `"none" \| "trigger-press"` | Yes | Unavailable | Reason for the requested change; it discriminates the native event type. |
| trigger | `Element \| undefined` | Yes | Unavailable | Trigger element associated with this change, when available. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="trigger"></a>

### Trigger

<a id="api-436f6c6c61707369626c652e54726967676572"></a>

<a id="collapsibletrigger"></a>

<a id="api-436f6c6c61707369626c652e547269676765722e2470726f70732e70726f703a64697361626c6564"></a>

<a id="api-436f6c6c61707369626c652e547269676765722e2470726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-436f6c6c61707369626c652e547269676765722e2470726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-436f6c6c61707369626c652e547269676765722e2470726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-436f6c6c61707369626c652e547269676765722e2470726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-436f6c6c61707369626c652e547269676765722e2470726f70732e70726f703a666f726d546172676574"></a>

<a id="api-436f6c6c61707369626c652e547269676765722e2470726f70732e70726f703a6e616d65"></a>

<a id="api-436f6c6c61707369626c652e547269676765722e2470726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-436f6c6c61707369626c652e547269676765722e2470726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-436f6c6c61707369626c652e547269676765722e2470726f70732e70726f703a74797065"></a>

<a id="api-436f6c6c61707369626c652e547269676765722e2470726f70732e70726f703a76616c7565"></a>

### Collapsible.Trigger

Declaration: `packages/solid/build/types/collapsible/trigger/CollapsibleTrigger.d.ts:3`

#### Declaration

```typescript
(props: CollapsibleTriggerProps) => JSX.Element
```

<a id="api-436f6c6c61707369626c652e547269676765722e2470726f70732e6e6174697665427574746f6e"></a>

<a id="CollapsibleTrigger-nativeButton"></a>

<a id="api-436f6c6c61707369626c652e547269676765722e2470726f70732e64697361626c6564"></a>

<a id="CollapsibleTrigger-disabled"></a>

<a id="api-436f6c6c61707369626c652e547269676765722e2470726f70732e636c617373"></a>

<a id="CollapsibleTrigger-class"></a>

<a id="api-436f6c6c61707369626c652e547269676765722e2470726f70732e7374796c65"></a>

<a id="CollapsibleTrigger-style"></a>

<a id="api-436f6c6c61707369626c652e547269676765722e2470726f70732e72656e646572"></a>

<a id="CollapsibleTrigger-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| nativeButton | `boolean \| undefined` | No | true | Whether the rendered host is a native button. Set false when the render callback supplies a non-button host. |
| disabled | `boolean \| undefined` | No | Unavailable | Overrides the root’s disabled setting for this trigger. |
| class | `JSX.ClassValue \| ((state: Readonly<CollapsibleTriggerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<CollapsibleTriggerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, CollapsibleTriggerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-436f6c6c61707369626c655472696767657244617461417474726962757465732e70616e656c4f70656e"></a>

<a id="api-436f6c6c61707369626c652e547269676765722e64617461417474726962757465732e646174612d7374617274696e672d7374796c65"></a>

<a id="api-436f6c6c61707369626c652e547269676765722e64617461417474726962757465732e646174612d656e64696e672d7374796c65"></a>

| Name | Description |
| --- | --- |
| data-panel-open | Present when open is true. |
| data-starting-style | Present when transitionStatus is 'starting'. |
| data-ending-style | Present when transitionStatus is 'ending'. |

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6c6c61707369626c652e547269676765722e50726f7073"></a>

<a id="collapsibletriggerprops"></a>

<a id="api-436f6c6c61707369626c652e547269676765722e50726f70732e70726f703a64697361626c6564"></a>

<a id="api-436f6c6c61707369626c652e547269676765722e50726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-436f6c6c61707369626c652e547269676765722e50726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-436f6c6c61707369626c652e547269676765722e50726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-436f6c6c61707369626c652e547269676765722e50726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-436f6c6c61707369626c652e547269676765722e50726f70732e70726f703a666f726d546172676574"></a>

<a id="api-436f6c6c61707369626c652e547269676765722e50726f70732e70726f703a6e616d65"></a>

<a id="api-436f6c6c61707369626c652e547269676765722e50726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-436f6c6c61707369626c652e547269676765722e50726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-436f6c6c61707369626c652e547269676765722e50726f70732e70726f703a74797065"></a>

<a id="api-436f6c6c61707369626c652e547269676765722e50726f70732e70726f703a76616c7565"></a>

### Related exported type: Collapsible.Trigger.Props

Declaration: `packages/solid/build/types/collapsible/trigger/CollapsibleTrigger.d.ts:11`

#### Declaration

```typescript
CollapsibleTriggerProps
```

<a id="api-436f6c6c61707369626c652e547269676765722e50726f70732e6e6174697665427574746f6e"></a>

<a id="CollapsibleTriggerProps-nativeButton"></a>

<a id="api-436f6c6c61707369626c652e547269676765722e50726f70732e64697361626c6564"></a>

<a id="CollapsibleTriggerProps-disabled"></a>

<a id="api-436f6c6c61707369626c652e547269676765722e50726f70732e636c617373"></a>

<a id="CollapsibleTriggerProps-class"></a>

<a id="api-436f6c6c61707369626c652e547269676765722e50726f70732e7374796c65"></a>

<a id="CollapsibleTriggerProps-style"></a>

<a id="api-436f6c6c61707369626c652e547269676765722e50726f70732e72656e646572"></a>

<a id="CollapsibleTriggerProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| nativeButton | `boolean \| undefined` | No | Unavailable | Whether the rendered host is a native button. Set false when the render callback supplies a non-button host. |
| disabled | `boolean \| undefined` | No | Unavailable | Overrides the root’s disabled setting for this trigger. |
| class | `JSX.ClassValue \| ((state: Readonly<CollapsibleTriggerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<CollapsibleTriggerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, CollapsibleTriggerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6c6c61707369626c652e547269676765722e5374617465"></a>

<a id="collapsibletriggerstate"></a>

### Related exported type: Collapsible.Trigger.State

Declaration: `packages/solid/build/types/collapsible/trigger/CollapsibleTrigger.d.ts:12`

#### Declaration

```typescript
CollapsibleTriggerState
```

<a id="api-436f6c6c61707369626c652e547269676765722e53746174652e6f70656e"></a>

<a id="CollapsibleTriggerState-open"></a>

<a id="api-436f6c6c61707369626c652e547269676765722e53746174652e7472616e736974696f6e537461747573"></a>

<a id="CollapsibleTriggerState-transitionStatus"></a>

<a id="api-436f6c6c61707369626c652e547269676765722e53746174652e64697361626c6564"></a>

<a id="CollapsibleTriggerState-disabled"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable | Whether the collapsible panel is open. |
| transitionStatus | `TransitionStatus` | Yes | Unavailable | Current transition phase: starting, ending, idle, or unavailable, as declared. |
| disabled | `boolean` | Yes | Unavailable | Whether the collapsible’s triggers are disabled. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="panel"></a>

### Panel

<a id="api-436f6c6c61707369626c652e50616e656c"></a>

<a id="collapsiblepanel"></a>

<a id="api-436f6c6c61707369626c652e50616e656c2e2470726f70732e70726f703a616c69676e"></a>

### Collapsible.Panel

Declaration: `packages/solid/build/types/collapsible/panel/CollapsiblePanel.d.ts:3`

#### Declaration

```typescript
(props: CollapsiblePanelProps) => JSX.Element
```

<a id="api-436f6c6c61707369626c652e50616e656c2e2470726f70732e68696464656e556e74696c466f756e64"></a>

<a id="CollapsiblePanel-hiddenUntilFound"></a>

<a id="api-436f6c6c61707369626c652e50616e656c2e2470726f70732e636c617373"></a>

<a id="CollapsiblePanel-class"></a>

<a id="api-436f6c6c61707369626c652e50616e656c2e2470726f70732e7374796c65"></a>

<a id="CollapsiblePanel-style"></a>

<a id="api-436f6c6c61707369626c652e50616e656c2e2470726f70732e6b6565704d6f756e746564"></a>

<a id="CollapsiblePanel-keepMounted"></a>

<a id="api-436f6c6c61707369626c652e50616e656c2e2470726f70732e72656e646572"></a>

<a id="CollapsiblePanel-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| hiddenUntilFound | `boolean \| undefined` | No | false | Uses hidden="until-found" for the closed panel, keeping it mounted so browser find-in-page can reveal it through beforematch. |
| class | `JSX.ClassValue \| ((state: Readonly<CollapsiblePanelState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<CollapsiblePanelState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | false | Keeps the closed panel mounted. hiddenUntilFound also keeps it mounted even if keepMounted is false. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, CollapsiblePanelState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-436f6c6c61707369626c6550616e656c44617461417474726962757465732e6f70656e"></a>

<a id="api-436f6c6c61707369626c6550616e656c44617461417474726962757465732e636c6f736564"></a>

<a id="api-436f6c6c61707369626c652e50616e656c2e64617461417474726962757465732e646174612d64697361626c6564"></a>

<a id="api-436f6c6c61707369626c6550616e656c44617461417474726962757465732e7374617274696e675374796c65"></a>

<a id="api-436f6c6c61707369626c6550616e656c44617461417474726962757465732e656e64696e675374796c65"></a>

| Name | Description |
| --- | --- |
| data-open | Present when open is true. |
| data-closed | Present when open is false. |
| data-disabled | Present when disabled is truthy. |
| data-starting-style | Present when transitionStatus is 'starting'. Also retained when hiddenUntilFound is true and open is false and mounted is false and animationType() is not 'css-animation'. |
| data-ending-style | Present when transitionStatus is 'ending'. |

#### CSS variables

<a id="api-436f6c6c61707369626c6550616e656c4373735661726961626c65732e636f6c6c61707369626c6550616e656c486569676874"></a>

<a id="api-436f6c6c61707369626c6550616e656c4373735661726961626c65732e636f6c6c61707369626c6550616e656c5769647468"></a>

| Name | Description |
| --- | --- |
| --collapsible-panel-height |  |
| --collapsible-panel-width |  |

<a id="api-436f6c6c61707369626c652e50616e656c2e50726f7073"></a>

<a id="collapsiblepanelprops"></a>

<a id="api-436f6c6c61707369626c652e50616e656c2e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Collapsible.Panel.Props

Declaration: `packages/solid/build/types/collapsible/panel/CollapsiblePanel.d.ts:11`

#### Declaration

```typescript
CollapsiblePanelProps
```

<a id="api-436f6c6c61707369626c652e50616e656c2e50726f70732e68696464656e556e74696c466f756e64"></a>

<a id="CollapsiblePanelProps-hiddenUntilFound"></a>

<a id="api-436f6c6c61707369626c652e50616e656c2e50726f70732e636c617373"></a>

<a id="CollapsiblePanelProps-class"></a>

<a id="api-436f6c6c61707369626c652e50616e656c2e50726f70732e7374796c65"></a>

<a id="CollapsiblePanelProps-style"></a>

<a id="api-436f6c6c61707369626c652e50616e656c2e50726f70732e6b6565704d6f756e746564"></a>

<a id="CollapsiblePanelProps-keepMounted"></a>

<a id="api-436f6c6c61707369626c652e50616e656c2e50726f70732e72656e646572"></a>

<a id="CollapsiblePanelProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| hiddenUntilFound | `boolean \| undefined` | No | Unavailable | Uses hidden="until-found" for the closed panel, keeping it mounted so browser find-in-page can reveal it through beforematch. |
| class | `JSX.ClassValue \| ((state: Readonly<CollapsiblePanelState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<CollapsiblePanelState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | Unavailable | Keeps the closed panel mounted. hiddenUntilFound also keeps it mounted even if keepMounted is false. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, CollapsiblePanelState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436f6c6c61707369626c652e50616e656c2e5374617465"></a>

<a id="collapsiblepanelstate"></a>

### Related exported type: Collapsible.Panel.State

Declaration: `packages/solid/build/types/collapsible/panel/CollapsiblePanel.d.ts:12`

#### Declaration

```typescript
CollapsiblePanelState
```

<a id="api-436f6c6c61707369626c652e50616e656c2e53746174652e6f70656e"></a>

<a id="CollapsiblePanelState-open"></a>

<a id="api-436f6c6c61707369626c652e50616e656c2e53746174652e7472616e736974696f6e537461747573"></a>

<a id="CollapsiblePanelState-transitionStatus"></a>

<a id="api-436f6c6c61707369626c652e50616e656c2e53746174652e64697361626c6564"></a>

<a id="CollapsiblePanelState-disabled"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable | Whether the collapsible panel is open. |
| transitionStatus | `TransitionStatus` | Yes | Unavailable | Current transition phase: starting, ending, idle, or unavailable, as declared. |
| disabled | `boolean` | Yes | Unavailable | Whether the collapsible’s triggers are disabled. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

