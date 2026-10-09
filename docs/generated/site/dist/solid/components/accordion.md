<a id="accordion"></a>

# Accordion

A set of collapsible panels with headings.

[Open mounted Solid demo: accordion/hero](/solid/components/accordion)

<a id="anatomy"></a>

## Anatomy

Import the component and assemble its parts:

```tsx
import { Accordion } from '@unstyled-solid/base-ui/accordion';
<Accordion.Root>
  <Accordion.Item>
    <Accordion.Header>
      <Accordion.Trigger />
    </Accordion.Header>
    <Accordion.Panel />
  </Accordion.Item>
</Accordion.Root>;
```

<a id="examples"></a>

## Examples

<a id="open-multiple-panels"></a>

### Open multiple panels

You can set up the accordion to allow multiple panels to be open at the same time using the `multiple` prop.

[Open mounted Solid demo: accordion/multiple](/solid/components/accordion)

<a id="hidden-until-found"></a>

### Hidden until found

The `hiddenUntilFound` prop hides closed panels with [`hidden="until-found"`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/hidden) so the browser can search their contents and reveal the matching panel automatically. It can be set on each `Accordion.Panel`, or once on `Accordion.Root` to apply to all panels.

To try it, press <kbd>Ctrl</kbd>+<kbd>F</kbd> (<kbd>Cmd</kbd>+<kbd>F</kbd> on macOS) and search for "restocking"—the browser opens the closed panel containing the match. When `hiddenUntilFound` is enabled, closed panels always remain mounted in the DOM, which also makes their contents indexable by search engines.

Older browsers that don't support `hidden="until-found"` keep panels hidden until their trigger opens them, and find-in-page skips over the contents.

[Open mounted Solid demo: accordion/hidden-until-found](/solid/components/accordion)

<a id="api-reference"></a>

## API reference

<a id="root"></a>

### Root

<a id="api-4163636f7264696f6e2e526f6f74"></a>

<a id="accordionroot"></a>

<a id="api-4163636f7264696f6e2e526f6f742e2470726f70732e70726f703a616c69676e"></a>

### Accordion.Root

Groups an accordion's disclosures. Keyboard focus follows normal document order.

Declaration: `packages/solid/build/types/accordion/root/AccordionRoot.d.ts:5`

#### Declaration

```typescript
<Value = any>(props: AccordionRootProps<Value>) => JSX.Element
```

<a id="api-4163636f7264696f6e2e526f6f742e2470726f70732e64656661756c7456616c7565"></a>

<a id="AccordionRoot-defaultValue"></a>

<a id="api-4163636f7264696f6e2e526f6f742e2470726f70732e76616c7565"></a>

<a id="AccordionRoot-value"></a>

<a id="api-4163636f7264696f6e2e526f6f742e2470726f70732e6f6e56616c75654368616e6765"></a>

<a id="AccordionRoot-onValueChange"></a>

<a id="api-4163636f7264696f6e2e526f6f742e2470726f70732e68696464656e556e74696c466f756e64"></a>

<a id="AccordionRoot-hiddenUntilFound"></a>

<a id="api-4163636f7264696f6e2e526f6f742e2470726f70732e6c6f6f70466f637573"></a>

<a id="AccordionRoot-loopFocus"></a>

<a id="api-4163636f7264696f6e2e526f6f742e2470726f70732e6d756c7469706c65"></a>

<a id="AccordionRoot-multiple"></a>

<a id="api-4163636f7264696f6e2e526f6f742e2470726f70732e64697361626c6564"></a>

<a id="AccordionRoot-disabled"></a>

<a id="api-4163636f7264696f6e2e526f6f742e2470726f70732e6f7269656e746174696f6e"></a>

<a id="AccordionRoot-orientation"></a>

<a id="api-4163636f7264696f6e2e526f6f742e2470726f70732e636c617373"></a>

<a id="AccordionRoot-class"></a>

<a id="api-4163636f7264696f6e2e526f6f742e2470726f70732e7374796c65"></a>

<a id="AccordionRoot-style"></a>

<a id="api-4163636f7264696f6e2e526f6f742e2470726f70732e6b6565704d6f756e746564"></a>

<a id="AccordionRoot-keepMounted"></a>

<a id="api-4163636f7264696f6e2e526f6f742e2470726f70732e72656e646572"></a>

<a id="AccordionRoot-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultValue | `AccordionValue<Value> \| undefined` | No | [] |  |
| value | `AccordionValue<Value> \| undefined` | No | Unavailable |  |
| onValueChange | `((value: AccordionValue<Value>, details: AccordionRootChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| hiddenUntilFound | `boolean \| undefined` | No | false |  |
| loopFocus | `boolean \| undefined` | No | Unavailable |  |
| multiple | `boolean \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | false |  |
| orientation | `Orientation \| undefined` | No | 'vertical' |  |
| class | `JSX.ClassValue \| ((state: Readonly<AccordionRootState<Value>>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AccordionRootState<Value>>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | false |  |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement> & JSX.Properties<HTMLDivElement>, AccordionRootState<Value>> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4163636f7264696f6e526f6f7444617461417474726962757465732e6f7269656e746174696f6e"></a>

<a id="api-4163636f7264696f6e526f6f7444617461417474726962757465732e64697361626c6564"></a>

| Name | Description |
| --- | --- |
| data-orientation |  |
| data-disabled |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-4163636f7264696f6e2e526f6f742e56616c7565"></a>

<a id="accordionrootvalue"></a>

### Related exported type: Accordion.Root.Value

Declaration: `packages/solid/build/types/accordion/root/AccordionRoot.d.ts:29`

#### Declaration

```typescript
Value<TValue>
```

Inherited DOM attributes: `__@iterator@106`, `__@unscopables@108`, `at`, `concat`, `copyWithin`, `entries`, `every`, `fill`, `filter`, `find`, `findIndex`, `findLast`, `findLastIndex`, `flat`, `flatMap`, `forEach`, `includes`, `indexOf`, `join`, `keys`, `lastIndexOf`, `length`, `map`, `pop`, `push`, `reduce`, `reduceRight`, `reverse`, `shift`, `slice`, `some`, `sort`, `splice`, `toLocaleString`, `toReversed`, `toSorted`, `toSpliced`, `toString`, `unshift`, `values`, `with`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4163636f7264696f6e2e526f6f742e4368616e67654576656e7444657461696c73"></a>

<a id="accordionrootchangeeventdetails"></a>

### Related exported type: Accordion.Root.ChangeEventDetails

Declaration: `packages/solid/build/types/accordion/root/AccordionRoot.d.ts:33`

#### Declaration

```typescript
AccordionRootChangeEventDetails
```

<a id="api-4163636f7264696f6e2e526f6f742e4368616e67654576656e7444657461696c732e616c6c6f7750726f7061676174696f6e"></a>

<a id="AccordionRootChangeEventDetails-allowPropagation"></a>

<a id="api-4163636f7264696f6e2e526f6f742e4368616e67654576656e7444657461696c732e63616e63656c"></a>

<a id="AccordionRootChangeEventDetails-cancel"></a>

<a id="api-4163636f7264696f6e2e526f6f742e4368616e67654576656e7444657461696c732e6576656e74"></a>

<a id="AccordionRootChangeEventDetails-event"></a>

<a id="api-4163636f7264696f6e2e526f6f742e4368616e67654576656e7444657461696c732e697343616e63656c6564"></a>

<a id="AccordionRootChangeEventDetails-isCanceled"></a>

<a id="api-4163636f7264696f6e2e526f6f742e4368616e67654576656e7444657461696c732e697350726f7061676174696f6e416c6c6f776564"></a>

<a id="AccordionRootChangeEventDetails-isPropagationAllowed"></a>

<a id="api-4163636f7264696f6e2e526f6f742e4368616e67654576656e7444657461696c732e726561736f6e"></a>

<a id="AccordionRootChangeEventDetails-reason"></a>

<a id="api-4163636f7264696f6e2e526f6f742e4368616e67654576656e7444657461696c732e74726967676572"></a>

<a id="AccordionRootChangeEventDetails-trigger"></a>

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

<a id="api-4163636f7264696f6e2e526f6f742e4368616e67654576656e74526561736f6e"></a>

<a id="accordionrootchangeeventreason"></a>

### Related exported type: Accordion.Root.ChangeEventReason

Declaration: `packages/solid/build/types/accordion/root/AccordionRoot.d.ts:32`

#### Declaration

```typescript
AccordionRootChangeEventReason
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4163636f7264696f6e2e526f6f742e50726f7073"></a>

<a id="accordionrootprops"></a>

<a id="api-4163636f7264696f6e2e526f6f742e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Accordion.Root.Props

Declaration: `packages/solid/build/types/accordion/root/AccordionRoot.d.ts:31`

#### Declaration

```typescript
Props<TValue>
```

<a id="api-4163636f7264696f6e2e526f6f742e50726f70732e64656661756c7456616c7565"></a>

<a id="AccordionRootProps-defaultValue"></a>

<a id="api-4163636f7264696f6e2e526f6f742e50726f70732e76616c7565"></a>

<a id="AccordionRootProps-value"></a>

<a id="api-4163636f7264696f6e2e526f6f742e50726f70732e6f6e56616c75654368616e6765"></a>

<a id="AccordionRootProps-onValueChange"></a>

<a id="api-4163636f7264696f6e2e526f6f742e50726f70732e68696464656e556e74696c466f756e64"></a>

<a id="AccordionRootProps-hiddenUntilFound"></a>

<a id="api-4163636f7264696f6e2e526f6f742e50726f70732e6c6f6f70466f637573"></a>

<a id="AccordionRootProps-loopFocus"></a>

<a id="api-4163636f7264696f6e2e526f6f742e50726f70732e6d756c7469706c65"></a>

<a id="AccordionRootProps-multiple"></a>

<a id="api-4163636f7264696f6e2e526f6f742e50726f70732e64697361626c6564"></a>

<a id="AccordionRootProps-disabled"></a>

<a id="api-4163636f7264696f6e2e526f6f742e50726f70732e6f7269656e746174696f6e"></a>

<a id="AccordionRootProps-orientation"></a>

<a id="api-4163636f7264696f6e2e526f6f742e50726f70732e636c617373"></a>

<a id="AccordionRootProps-class"></a>

<a id="api-4163636f7264696f6e2e526f6f742e50726f70732e7374796c65"></a>

<a id="AccordionRootProps-style"></a>

<a id="api-4163636f7264696f6e2e526f6f742e50726f70732e6b6565704d6f756e746564"></a>

<a id="AccordionRootProps-keepMounted"></a>

<a id="api-4163636f7264696f6e2e526f6f742e50726f70732e72656e646572"></a>

<a id="AccordionRootProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultValue | `AccordionValue<TValue> \| undefined` | No | Unavailable |  |
| value | `AccordionValue<TValue> \| undefined` | No | Unavailable |  |
| onValueChange | `((value: AccordionValue<TValue>, details: AccordionRootChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| hiddenUntilFound | `boolean \| undefined` | No | Unavailable |  |
| loopFocus | `boolean \| undefined` | No | Unavailable |  |
| multiple | `boolean \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| orientation | `Orientation \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<AccordionRootState<TValue>>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AccordionRootState<TValue>>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | Unavailable |  |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement> & JSX.Properties<HTMLDivElement>, AccordionRootState<TValue>> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4163636f7264696f6e2e526f6f742e5374617465"></a>

<a id="accordionrootstate"></a>

### Related exported type: Accordion.Root.State

Declaration: `packages/solid/build/types/accordion/root/AccordionRoot.d.ts:30`

#### Declaration

```typescript
State<TValue>
```

<a id="api-4163636f7264696f6e2e526f6f742e53746174652e76616c7565"></a>

<a id="AccordionRootState-value"></a>

<a id="api-4163636f7264696f6e2e526f6f742e53746174652e64697361626c6564"></a>

<a id="AccordionRootState-disabled"></a>

<a id="api-4163636f7264696f6e2e526f6f742e53746174652e6f7269656e746174696f6e"></a>

<a id="AccordionRootState-orientation"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `AccordionValue<TValue>` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |
| orientation | `Orientation` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="item"></a>

### Item

<a id="api-4163636f7264696f6e2e4974656d"></a>

<a id="accordionitem"></a>

<a id="api-4163636f7264696f6e2e4974656d2e2470726f70732e70726f703a616c69676e"></a>

### Accordion.Item

Groups the heading, trigger, and panel of one disclosure.

Declaration: `packages/solid/build/types/accordion/item/AccordionItem.d.ts:5`

#### Declaration

```typescript
(props: AccordionItemProps) => JSX.Element
```

<a id="api-4163636f7264696f6e2e4974656d2e2470726f70732e76616c7565"></a>

<a id="AccordionItem-value"></a>

<a id="api-4163636f7264696f6e2e4974656d2e2470726f70732e6f6e4f70656e4368616e6765"></a>

<a id="AccordionItem-onOpenChange"></a>

<a id="api-4163636f7264696f6e2e4974656d2e2470726f70732e64697361626c6564"></a>

<a id="AccordionItem-disabled"></a>

<a id="api-4163636f7264696f6e2e4974656d2e2470726f70732e636c617373"></a>

<a id="AccordionItem-class"></a>

<a id="api-4163636f7264696f6e2e4974656d2e2470726f70732e7374796c65"></a>

<a id="AccordionItem-style"></a>

<a id="api-4163636f7264696f6e2e4974656d2e2470726f70732e72656e646572"></a>

<a id="AccordionItem-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `any` | No | Unavailable |  |
| onOpenChange | `((open: boolean, details: AccordionItemChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<AccordionItemState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AccordionItemState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement> & JSX.Properties<HTMLDivElement>, AccordionItemState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4163636f7264696f6e4974656d44617461417474726962757465732e6f70656e"></a>

<a id="api-4163636f7264696f6e2e4974656d2e64617461417474726962757465732e646174612d636c6f736564"></a>

<a id="api-4163636f7264696f6e4974656d44617461417474726962757465732e64697361626c6564"></a>

<a id="api-4163636f7264696f6e4974656d44617461417474726962757465732e696e646578"></a>

<a id="api-4163636f7264696f6e2e4974656d2e64617461417474726962757465732e646174612d7374617274696e672d7374796c65"></a>

<a id="api-4163636f7264696f6e2e4974656d2e64617461417474726962757465732e646174612d656e64696e672d7374796c65"></a>

| Name | Description |
| --- | --- |
| data-open | Present when open is true. |
| data-closed | Present when open is false. |
| data-disabled |  |
| data-index |  |
| data-starting-style | Present when transitionStatus is 'starting'. |
| data-ending-style | Present when transitionStatus is 'ending'. |

#### CSS variables

Metadata status: unavailable.

<a id="api-4163636f7264696f6e2e4974656d2e50726f7073"></a>

<a id="accordionitemprops"></a>

<a id="api-4163636f7264696f6e2e4974656d2e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Accordion.Item.Props

Declaration: `packages/solid/build/types/accordion/item/AccordionItem.d.ts:20`

#### Declaration

```typescript
AccordionItemProps
```

<a id="api-4163636f7264696f6e2e4974656d2e50726f70732e76616c7565"></a>

<a id="AccordionItemProps-value"></a>

<a id="api-4163636f7264696f6e2e4974656d2e50726f70732e6f6e4f70656e4368616e6765"></a>

<a id="AccordionItemProps-onOpenChange"></a>

<a id="api-4163636f7264696f6e2e4974656d2e50726f70732e64697361626c6564"></a>

<a id="AccordionItemProps-disabled"></a>

<a id="api-4163636f7264696f6e2e4974656d2e50726f70732e636c617373"></a>

<a id="AccordionItemProps-class"></a>

<a id="api-4163636f7264696f6e2e4974656d2e50726f70732e7374796c65"></a>

<a id="AccordionItemProps-style"></a>

<a id="api-4163636f7264696f6e2e4974656d2e50726f70732e72656e646572"></a>

<a id="AccordionItemProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `any` | No | Unavailable |  |
| onOpenChange | `((open: boolean, details: AccordionItemChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<AccordionItemState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AccordionItemState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement> & JSX.Properties<HTMLDivElement>, AccordionItemState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4163636f7264696f6e2e4974656d2e5374617465"></a>

<a id="accordionitemstate"></a>

### Related exported type: Accordion.Item.State

Declaration: `packages/solid/build/types/accordion/item/AccordionItem.d.ts:19`

#### Declaration

```typescript
AccordionItemState
```

<a id="api-4163636f7264696f6e2e4974656d2e53746174652e76616c7565"></a>

<a id="AccordionItemState-value"></a>

<a id="api-4163636f7264696f6e2e4974656d2e53746174652e6f70656e"></a>

<a id="AccordionItemState-open"></a>

<a id="api-4163636f7264696f6e2e4974656d2e53746174652e68696464656e"></a>

<a id="AccordionItemState-hidden"></a>

<a id="api-4163636f7264696f6e2e4974656d2e53746174652e696e646578"></a>

<a id="AccordionItemState-index"></a>

<a id="api-4163636f7264696f6e2e4974656d2e53746174652e64697361626c6564"></a>

<a id="AccordionItemState-disabled"></a>

<a id="api-4163636f7264696f6e2e4974656d2e53746174652e6f7269656e746174696f6e"></a>

<a id="AccordionItemState-orientation"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `AccordionValue<any>` | Yes | Unavailable |  |
| open | `boolean` | Yes | Unavailable |  |
| hidden | `boolean` | Yes | Unavailable |  |
| index | `number` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |
| orientation | `Orientation` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4163636f7264696f6e2e4974656d2e4368616e67654576656e74526561736f6e"></a>

<a id="accordionitemchangeeventreason"></a>

### Related exported type: Accordion.Item.ChangeEventReason

Declaration: `packages/solid/build/types/accordion/item/AccordionItem.d.ts:21`

#### Declaration

```typescript
AccordionRootChangeEventReason
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4163636f7264696f6e2e4974656d2e4368616e67654576656e7444657461696c73"></a>

<a id="accordionitemchangeeventdetails"></a>

### Related exported type: Accordion.Item.ChangeEventDetails

Declaration: `packages/solid/build/types/accordion/item/AccordionItem.d.ts:22`

#### Declaration

```typescript
AccordionRootChangeEventDetails
```

<a id="api-4163636f7264696f6e2e4974656d2e4368616e67654576656e7444657461696c732e616c6c6f7750726f7061676174696f6e"></a>

<a id="AccordionItemChangeEventDetails-allowPropagation"></a>

<a id="api-4163636f7264696f6e2e4974656d2e4368616e67654576656e7444657461696c732e63616e63656c"></a>

<a id="AccordionItemChangeEventDetails-cancel"></a>

<a id="api-4163636f7264696f6e2e4974656d2e4368616e67654576656e7444657461696c732e6576656e74"></a>

<a id="AccordionItemChangeEventDetails-event"></a>

<a id="api-4163636f7264696f6e2e4974656d2e4368616e67654576656e7444657461696c732e697343616e63656c6564"></a>

<a id="AccordionItemChangeEventDetails-isCanceled"></a>

<a id="api-4163636f7264696f6e2e4974656d2e4368616e67654576656e7444657461696c732e697350726f7061676174696f6e416c6c6f776564"></a>

<a id="AccordionItemChangeEventDetails-isPropagationAllowed"></a>

<a id="api-4163636f7264696f6e2e4974656d2e4368616e67654576656e7444657461696c732e726561736f6e"></a>

<a id="AccordionItemChangeEventDetails-reason"></a>

<a id="api-4163636f7264696f6e2e4974656d2e4368616e67654576656e7444657461696c732e74726967676572"></a>

<a id="AccordionItemChangeEventDetails-trigger"></a>

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

<a id="header"></a>

### Header

<a id="api-4163636f7264696f6e2e486561646572"></a>

<a id="accordionheader"></a>

<a id="api-4163636f7264696f6e2e4865616465722e2470726f70732e70726f703a616c69676e"></a>

### Accordion.Header

A heading for the corresponding disclosure. Renders an h3 by default.

Declaration: `packages/solid/build/types/accordion/header/AccordionHeader.d.ts:5`

#### Declaration

```typescript
(props: AccordionHeaderProps) => JSX.Element
```

<a id="api-4163636f7264696f6e2e4865616465722e2470726f70732e636c617373"></a>

<a id="AccordionHeader-class"></a>

<a id="api-4163636f7264696f6e2e4865616465722e2470726f70732e7374796c65"></a>

<a id="AccordionHeader-style"></a>

<a id="api-4163636f7264696f6e2e4865616465722e2470726f70732e72656e646572"></a>

<a id="AccordionHeader-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<AccordionHeaderState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AccordionHeaderState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLHeadingElement> & JSX.Properties<HTMLHeadingElement>, AccordionHeaderState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4163636f7264696f6e48656164657244617461417474726962757465732e6f70656e"></a>

<a id="api-4163636f7264696f6e2e4865616465722e64617461417474726962757465732e646174612d636c6f736564"></a>

<a id="api-4163636f7264696f6e48656164657244617461417474726962757465732e64697361626c6564"></a>

<a id="api-4163636f7264696f6e48656164657244617461417474726962757465732e696e646578"></a>

<a id="api-4163636f7264696f6e2e4865616465722e64617461417474726962757465732e646174612d7374617274696e672d7374796c65"></a>

<a id="api-4163636f7264696f6e2e4865616465722e64617461417474726962757465732e646174612d656e64696e672d7374796c65"></a>

| Name | Description |
| --- | --- |
| data-open | Present when open is true. |
| data-closed | Present when open is false. |
| data-disabled |  |
| data-index |  |
| data-starting-style | Present when transitionStatus is 'starting'. |
| data-ending-style | Present when transitionStatus is 'ending'. |

#### CSS variables

Metadata status: unavailable.

<a id="api-4163636f7264696f6e2e4865616465722e50726f7073"></a>

<a id="accordionheaderprops"></a>

<a id="api-4163636f7264696f6e2e4865616465722e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Accordion.Header.Props

Declaration: `packages/solid/build/types/accordion/header/AccordionHeader.d.ts:12`

#### Declaration

```typescript
AccordionHeaderProps
```

<a id="api-4163636f7264696f6e2e4865616465722e50726f70732e636c617373"></a>

<a id="AccordionHeaderProps-class"></a>

<a id="api-4163636f7264696f6e2e4865616465722e50726f70732e7374796c65"></a>

<a id="AccordionHeaderProps-style"></a>

<a id="api-4163636f7264696f6e2e4865616465722e50726f70732e72656e646572"></a>

<a id="AccordionHeaderProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<AccordionHeaderState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AccordionHeaderState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLHeadingElement> & JSX.Properties<HTMLHeadingElement>, AccordionHeaderState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4163636f7264696f6e2e4865616465722e5374617465"></a>

<a id="accordionheaderstate"></a>

### Related exported type: Accordion.Header.State

Declaration: `packages/solid/build/types/accordion/header/AccordionHeader.d.ts:11`

#### Declaration

```typescript
AccordionHeaderState
```

<a id="api-4163636f7264696f6e2e4865616465722e53746174652e76616c7565"></a>

<a id="AccordionHeaderState-value"></a>

<a id="api-4163636f7264696f6e2e4865616465722e53746174652e6f70656e"></a>

<a id="AccordionHeaderState-open"></a>

<a id="api-4163636f7264696f6e2e4865616465722e53746174652e68696464656e"></a>

<a id="AccordionHeaderState-hidden"></a>

<a id="api-4163636f7264696f6e2e4865616465722e53746174652e696e646578"></a>

<a id="AccordionHeaderState-index"></a>

<a id="api-4163636f7264696f6e2e4865616465722e53746174652e64697361626c6564"></a>

<a id="AccordionHeaderState-disabled"></a>

<a id="api-4163636f7264696f6e2e4865616465722e53746174652e6f7269656e746174696f6e"></a>

<a id="AccordionHeaderState-orientation"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `AccordionValue<any>` | Yes | Unavailable |  |
| open | `boolean` | Yes | Unavailable |  |
| hidden | `boolean` | Yes | Unavailable |  |
| index | `number` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |
| orientation | `Orientation` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="trigger"></a>

### Trigger

<a id="api-4163636f7264696f6e2e54726967676572"></a>

<a id="accordiontrigger"></a>

<a id="api-4163636f7264696f6e2e547269676765722e2470726f70732e70726f703a64697361626c6564"></a>

<a id="api-4163636f7264696f6e2e547269676765722e2470726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-4163636f7264696f6e2e547269676765722e2470726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-4163636f7264696f6e2e547269676765722e2470726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-4163636f7264696f6e2e547269676765722e2470726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-4163636f7264696f6e2e547269676765722e2470726f70732e70726f703a666f726d546172676574"></a>

<a id="api-4163636f7264696f6e2e547269676765722e2470726f70732e70726f703a6e616d65"></a>

<a id="api-4163636f7264696f6e2e547269676765722e2470726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-4163636f7264696f6e2e547269676765722e2470726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-4163636f7264696f6e2e547269676765722e2470726f70732e70726f703a74797065"></a>

<a id="api-4163636f7264696f6e2e547269676765722e2470726f70732e70726f703a76616c7565"></a>

### Accordion.Trigger

A normally tabbable button that toggles its disclosure.

Declaration: `packages/solid/build/types/accordion/trigger/AccordionTrigger.d.ts:5`

#### Declaration

```typescript
(props: AccordionTriggerProps) => JSX.Element
```

<a id="api-4163636f7264696f6e2e547269676765722e2470726f70732e6e6174697665427574746f6e"></a>

<a id="AccordionTrigger-nativeButton"></a>

<a id="api-4163636f7264696f6e2e547269676765722e2470726f70732e636c617373"></a>

<a id="AccordionTrigger-class"></a>

<a id="api-4163636f7264696f6e2e547269676765722e2470726f70732e7374796c65"></a>

<a id="AccordionTrigger-style"></a>

<a id="api-4163636f7264696f6e2e547269676765722e2470726f70732e72656e646572"></a>

<a id="AccordionTrigger-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| nativeButton | `boolean \| undefined` | No | true |  |
| class | `JSX.ClassValue \| ((state: Readonly<AccordionTriggerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AccordionTriggerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLElement>, AccordionTriggerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `disabled`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4163636f7264696f6e5472696767657244617461417474726962757465732e70616e656c4f70656e"></a>

<a id="api-4163636f7264696f6e5472696767657244617461417474726962757465732e64697361626c6564"></a>

<a id="api-4163636f7264696f6e5472696767657244617461417474726962757465732e696e646578"></a>

| Name | Description |
| --- | --- |
| data-panel-open |  |
| data-disabled |  |
| data-index |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-4163636f7264696f6e2e547269676765722e50726f7073"></a>

<a id="accordiontriggerprops"></a>

<a id="api-4163636f7264696f6e2e547269676765722e50726f70732e70726f703a64697361626c6564"></a>

<a id="api-4163636f7264696f6e2e547269676765722e50726f70732e70726f703a666f726d416374696f6e"></a>

<a id="api-4163636f7264696f6e2e547269676765722e50726f70732e70726f703a666f726d456e6374797065"></a>

<a id="api-4163636f7264696f6e2e547269676765722e50726f70732e70726f703a666f726d4d6574686f64"></a>

<a id="api-4163636f7264696f6e2e547269676765722e50726f70732e70726f703a666f726d4e6f56616c6964617465"></a>

<a id="api-4163636f7264696f6e2e547269676765722e50726f70732e70726f703a666f726d546172676574"></a>

<a id="api-4163636f7264696f6e2e547269676765722e50726f70732e70726f703a6e616d65"></a>

<a id="api-4163636f7264696f6e2e547269676765722e50726f70732e70726f703a706f706f766572546172676574416374696f6e"></a>

<a id="api-4163636f7264696f6e2e547269676765722e50726f70732e70726f703a706f706f766572546172676574456c656d656e74"></a>

<a id="api-4163636f7264696f6e2e547269676765722e50726f70732e70726f703a74797065"></a>

<a id="api-4163636f7264696f6e2e547269676765722e50726f70732e70726f703a76616c7565"></a>

### Related exported type: Accordion.Trigger.Props

Declaration: `packages/solid/build/types/accordion/trigger/AccordionTrigger.d.ts:13`

#### Declaration

```typescript
AccordionTriggerProps
```

<a id="api-4163636f7264696f6e2e547269676765722e50726f70732e6e6174697665427574746f6e"></a>

<a id="AccordionTriggerProps-nativeButton"></a>

<a id="api-4163636f7264696f6e2e547269676765722e50726f70732e636c617373"></a>

<a id="AccordionTriggerProps-class"></a>

<a id="api-4163636f7264696f6e2e547269676765722e50726f70732e7374796c65"></a>

<a id="AccordionTriggerProps-style"></a>

<a id="api-4163636f7264696f6e2e547269676765722e50726f70732e72656e646572"></a>

<a id="AccordionTriggerProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| nativeButton | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<AccordionTriggerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AccordionTriggerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLElement>, AccordionTriggerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `command`, `commandfor`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `disabled`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `form`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `popovertarget`, `popovertargetaction`, `prefix`, `prop:disabled`, `prop:formAction`, `prop:formEnctype`, `prop:formMethod`, `prop:formNoValidate`, `prop:formTarget`, `prop:name`, `prop:popoverTargetAction`, `prop:popoverTargetElement`, `prop:type`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `type`, `typeof`, `value`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4163636f7264696f6e2e547269676765722e5374617465"></a>

<a id="accordiontriggerstate"></a>

### Related exported type: Accordion.Trigger.State

Declaration: `packages/solid/build/types/accordion/trigger/AccordionTrigger.d.ts:12`

#### Declaration

```typescript
AccordionTriggerState
```

<a id="api-4163636f7264696f6e2e547269676765722e53746174652e76616c7565"></a>

<a id="AccordionTriggerState-value"></a>

<a id="api-4163636f7264696f6e2e547269676765722e53746174652e6f70656e"></a>

<a id="AccordionTriggerState-open"></a>

<a id="api-4163636f7264696f6e2e547269676765722e53746174652e68696464656e"></a>

<a id="AccordionTriggerState-hidden"></a>

<a id="api-4163636f7264696f6e2e547269676765722e53746174652e696e646578"></a>

<a id="AccordionTriggerState-index"></a>

<a id="api-4163636f7264696f6e2e547269676765722e53746174652e64697361626c6564"></a>

<a id="AccordionTriggerState-disabled"></a>

<a id="api-4163636f7264696f6e2e547269676765722e53746174652e6f7269656e746174696f6e"></a>

<a id="AccordionTriggerState-orientation"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `AccordionValue<any>` | Yes | Unavailable |  |
| open | `boolean` | Yes | Unavailable |  |
| hidden | `boolean` | Yes | Unavailable |  |
| index | `number` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |
| orientation | `Orientation` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="panel"></a>

### Panel

<a id="api-4163636f7264696f6e2e50616e656c"></a>

<a id="accordionpanel"></a>

<a id="api-4163636f7264696f6e2e50616e656c2e2470726f70732e70726f703a616c69676e"></a>

### Accordion.Panel

The disclosure's measured, animated region. Lifecycle is owned by Collapsible.

Declaration: `packages/solid/build/types/accordion/panel/AccordionPanel.d.ts:5`

#### Declaration

```typescript
(props: AccordionPanelProps) => JSX.Element
```

<a id="api-4163636f7264696f6e2e50616e656c2e2470726f70732e68696464656e556e74696c466f756e64"></a>

<a id="AccordionPanel-hiddenUntilFound"></a>

<a id="api-4163636f7264696f6e2e50616e656c2e2470726f70732e636c617373"></a>

<a id="AccordionPanel-class"></a>

<a id="api-4163636f7264696f6e2e50616e656c2e2470726f70732e7374796c65"></a>

<a id="AccordionPanel-style"></a>

<a id="api-4163636f7264696f6e2e50616e656c2e2470726f70732e6b6565704d6f756e746564"></a>

<a id="AccordionPanel-keepMounted"></a>

<a id="api-4163636f7264696f6e2e50616e656c2e2470726f70732e72656e646572"></a>

<a id="AccordionPanel-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| hiddenUntilFound | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<AccordionPanelState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AccordionPanelState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | Unavailable |  |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement> & JSX.Properties<HTMLDivElement>, AccordionPanelState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-4163636f7264696f6e50616e656c44617461417474726962757465732e6f70656e"></a>

<a id="api-4163636f7264696f6e2e50616e656c2e64617461417474726962757465732e646174612d636c6f736564"></a>

<a id="api-4163636f7264696f6e50616e656c44617461417474726962757465732e6f7269656e746174696f6e"></a>

<a id="api-4163636f7264696f6e50616e656c44617461417474726962757465732e64697361626c6564"></a>

<a id="api-4163636f7264696f6e50616e656c44617461417474726962757465732e696e646578"></a>

<a id="api-4163636f7264696f6e50616e656c44617461417474726962757465732e7374617274696e675374796c65"></a>

<a id="api-4163636f7264696f6e50616e656c44617461417474726962757465732e656e64696e675374796c65"></a>

| Name | Description |
| --- | --- |
| data-open | Present when open is true. |
| data-closed | Present when open is false. |
| data-orientation |  |
| data-disabled |  |
| data-index |  |
| data-starting-style | Present when transitionStatus is 'starting'. |
| data-ending-style | Present when transitionStatus is 'ending'. |

#### CSS variables

<a id="api-4163636f7264696f6e50616e656c4373735661726961626c65732e6163636f7264696f6e50616e656c486569676874"></a>

<a id="api-4163636f7264696f6e50616e656c4373735661726961626c65732e6163636f7264696f6e50616e656c5769647468"></a>

| Name | Description |
| --- | --- |
| --accordion-panel-height |  |
| --accordion-panel-width |  |

<a id="api-4163636f7264696f6e2e50616e656c2e50726f7073"></a>

<a id="accordionpanelprops"></a>

<a id="api-4163636f7264696f6e2e50616e656c2e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Accordion.Panel.Props

Declaration: `packages/solid/build/types/accordion/panel/AccordionPanel.d.ts:15`

#### Declaration

```typescript
AccordionPanelProps
```

<a id="api-4163636f7264696f6e2e50616e656c2e50726f70732e68696464656e556e74696c466f756e64"></a>

<a id="AccordionPanelProps-hiddenUntilFound"></a>

<a id="api-4163636f7264696f6e2e50616e656c2e50726f70732e636c617373"></a>

<a id="AccordionPanelProps-class"></a>

<a id="api-4163636f7264696f6e2e50616e656c2e50726f70732e7374796c65"></a>

<a id="AccordionPanelProps-style"></a>

<a id="api-4163636f7264696f6e2e50616e656c2e50726f70732e6b6565704d6f756e746564"></a>

<a id="AccordionPanelProps-keepMounted"></a>

<a id="api-4163636f7264696f6e2e50616e656c2e50726f70732e72656e646572"></a>

<a id="AccordionPanelProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| hiddenUntilFound | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<AccordionPanelState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AccordionPanelState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | Unavailable |  |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLDivElement> & JSX.Properties<HTMLDivElement>, AccordionPanelState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-4163636f7264696f6e2e50616e656c2e5374617465"></a>

<a id="accordionpanelstate"></a>

### Related exported type: Accordion.Panel.State

Declaration: `packages/solid/build/types/accordion/panel/AccordionPanel.d.ts:14`

#### Declaration

```typescript
AccordionPanelState
```

<a id="api-4163636f7264696f6e2e50616e656c2e53746174652e76616c7565"></a>

<a id="AccordionPanelState-value"></a>

<a id="api-4163636f7264696f6e2e50616e656c2e53746174652e6f70656e"></a>

<a id="AccordionPanelState-open"></a>

<a id="api-4163636f7264696f6e2e50616e656c2e53746174652e68696464656e"></a>

<a id="AccordionPanelState-hidden"></a>

<a id="api-4163636f7264696f6e2e50616e656c2e53746174652e696e646578"></a>

<a id="AccordionPanelState-index"></a>

<a id="api-4163636f7264696f6e2e50616e656c2e53746174652e7472616e736974696f6e537461747573"></a>

<a id="AccordionPanelState-transitionStatus"></a>

<a id="api-4163636f7264696f6e2e50616e656c2e53746174652e64697361626c6564"></a>

<a id="AccordionPanelState-disabled"></a>

<a id="api-4163636f7264696f6e2e50616e656c2e53746174652e6f7269656e746174696f6e"></a>

<a id="AccordionPanelState-orientation"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `AccordionValue<any>` | Yes | Unavailable |  |
| open | `boolean` | Yes | Unavailable |  |
| hidden | `boolean` | Yes | Unavailable |  |
| index | `number` | Yes | Unavailable |  |
| transitionStatus | `TransitionStatus` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |
| orientation | `Orientation` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

