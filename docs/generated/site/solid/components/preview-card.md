<a id="preview-card"></a>

# Preview Card

A link that shows a destination preview without interrupting keyboard or screen reader navigation.



[Open mounted Solid demo: preview-card/hero](/solid/components/preview-card)

<link href="https://images.unsplash.com/photo-1619615391095-dfa29e1672ef?q=80&amp;w=448&amp;h=300">

</link>

<a id="usage-guidelines"></a>

## Usage guidelines

- **Protect screen reader users' current context**: Exposing each preview to screen readers would force users through its contents before they could continue through the page, repeatedly disrupting their current context. Keep the link as the only accessible interface and include all previewed information at its destination.
- **Keep popup content supplementary**: Avoid placing unique or essential information in the popup unless it is also available on the linked page. For the reason above, preview card content is not touch, keyboard or screen reader navigable. It acts as a visual [progressive enhancement](https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement) for sighted mouse and keyboard users only.

<a id="anatomy"></a>

## Anatomy

Import the component and assemble its parts:

```tsx
import { PreviewCard } from '@unstyled-solid/base-ui/preview-card';
<PreviewCard.Root>
  <PreviewCard.Trigger />
  <PreviewCard.Portal>
    <PreviewCard.Backdrop />
    <PreviewCard.Positioner>
      <PreviewCard.Popup>
        <PreviewCard.Arrow />
        <PreviewCard.Viewport />
      </PreviewCard.Popup>
    </PreviewCard.Positioner>
  </PreviewCard.Portal>
</PreviewCard.Root>;
```

<a id="examples"></a>

## Examples

<a id="detached-triggers"></a>

### Detached triggers

A preview card can be controlled by a trigger located either inside or outside the `<PreviewCard.Root>` component.
For simple, one-off interactions, place the `<PreviewCard.Trigger>` inside `<PreviewCard.Root>`, as shown in the example at the top of this page.

However, if defining the preview card's content next to its trigger is not practical, you can use a detached trigger.
This involves placing the `<PreviewCard.Trigger>` outside of `<PreviewCard.Root>` and linking them with a `handle` created by the `PreviewCard.createHandle()` function.

The imperative methods on the handle, such as `open()` and `close()`, require a `<PreviewCard.Root>` using the same handle to be mounted.
Calls made while no root is attached to the handle — before one mounts, or after it unmounts — are ignored. Each time a root mounts, it starts from fresh state: a call made while no root was attached is not replayed, and no open state carries over from a previous mount.

```tsx
const demoPreviewCard = PreviewCard.createHandle();



<PreviewCard.Trigger handle={demoPreviewCard} href="#">
  Link
</PreviewCard.Trigger>



<PreviewCard.Root handle={demoPreviewCard}>
  ...
</PreviewCard.Root>;
```

[Open mounted Solid demo: preview-card/detached-triggers-simple](/solid/components/preview-card)

<a id="multiple-triggers"></a>

### Multiple triggers

A single preview card can be opened by multiple trigger elements.
You can achieve this by using the same `handle` for several detached triggers, or by placing multiple `<PreviewCard.Trigger>` components inside a single `<PreviewCard.Root>`.

```tsx
<PreviewCard.Root>
  <PreviewCard.Trigger href="#">Trigger 1</PreviewCard.Trigger>
  <PreviewCard.Trigger href="#">Trigger 2</PreviewCard.Trigger>
  ...
</PreviewCard.Root>;
```

```tsx
const demoPreviewCard = PreviewCard.createHandle();

<PreviewCard.Trigger handle={demoPreviewCard} href="#">
  Trigger 1
</PreviewCard.Trigger>

<PreviewCard.Trigger handle={demoPreviewCard} href="#">
  Trigger 2
</PreviewCard.Trigger>

<PreviewCard.Root handle={demoPreviewCard}>
  ...
</PreviewCard.Root>
```

The preview card can render different content depending on which trigger opened it.
This is achieved by passing a `payload` to the `<PreviewCard.Trigger>` and using the function-as-a-child pattern in `<PreviewCard.Root>`.

The payload can be strongly typed by providing a type argument to the `createHandle()` function:

```tsx

const demoPreviewCard = PreviewCard.createHandle<{ title: string }>();



<PreviewCard.Trigger handle={demoPreviewCard} payload={{ title: 'Trigger 1' }} href="#">
  Trigger 1
</PreviewCard.Trigger>



<PreviewCard.Trigger handle={demoPreviewCard} payload={{ title: 'Trigger 2' }} href="#">
  Trigger 2
</PreviewCard.Trigger>

<PreviewCard.Root handle={demoPreviewCard}>
  {({ payload }) => ( 
    <PreviewCard.Portal>
      <PreviewCard.Positioner sideOffset={8}>
        <PreviewCard.Popup>
          {payload !== undefined && ( 
            <span>
              Preview card opened by {payload.title} 
            </span>
          )}
        </PreviewCard.Popup>
      </PreviewCard.Positioner>
    </PreviewCard.Portal>
  )}
</PreviewCard.Root>
```

<a id="controlled-mode-with-multiple-triggers"></a>

### Controlled mode with multiple triggers

You can control the preview card's open state externally using the `open` and `onOpenChange` props on `<PreviewCard.Root>`.
This allows you to manage the preview card's visibility based on your application's state.
When using multiple triggers, you have to manage which trigger is active with the `triggerId` prop on `<PreviewCard.Root>` and the `id` prop on each `<PreviewCard.Trigger>`.

Note that there is no separate `onTriggerIdChange` prop.
Instead, the `onOpenChange` callback receives an additional argument, `eventDetails`, which contains the trigger element that initiated the state change.

[Open mounted Solid demo: preview-card/detached-triggers-controlled](/solid/components/preview-card)

<a id="animating-the-preview-card"></a>

### Animating the Preview Card

You can animate a preview card as it moves between different trigger elements.
This includes animating its position, size, and content.

<a id="position-and-size"></a>

#### Position and Size

To animate the preview card's position, apply CSS transitions to the `left`, `right`, `top`, and `bottom` properties of the **Positioner** part.
To animate its size, transition the `width` and `height` of the **Popup** part.

<a id="content"></a>

#### Content

The preview card also supports content transitions.
This is useful when different triggers display different content within the same preview card.

To enable content animations, wrap the content in the `<PreviewCard.Viewport>` part.
This part provides features to create direction-aware animations.
It renders a `div` with a `data-activation-direction` attribute that indicates the new trigger's position relative to the previous one. The value is a space-separated set of up to two tokens (one per axis) — `left` or `right` for the horizontal axis and `up` or `down` for the vertical axis (for example, `right down`). Match a single token with the `~=` attribute selector, such as `[data-activation-direction~='right']`.

Inside the `<PreviewCard.Viewport>`, the content is further wrapped in `div`s with data attributes to help with styling:

- `data-current`: The currently visible content when no transitions are present or the incoming content.
- `data-previous`: The outgoing content during a transition.

You can use these attributes to style the enter and exit animations.

[Open mounted Solid demo: preview-card/detached-triggers-full](/solid/components/preview-card)

<a id="api-reference"></a>

## API reference

<a id="root"></a>

### Root

<a id="api-50726576696577436172642e526f6f74"></a>

<a id="previewcardroot"></a>

### PreviewCard.Root

Groups the preview card parts without adding an element.

Declaration: `packages/solid/build/types/preview-card/root/PreviewCardRoot.d.ts:5`

#### Declaration

```typescript
<Payload = unknown>(props: PreviewCardRoot.Props<Payload>) => JSX.Element
```

<a id="api-50726576696577436172642e526f6f742e2470726f70732e64656661756c744f70656e"></a>

<a id="PreviewCardRoot-defaultOpen"></a>

<a id="api-50726576696577436172642e526f6f742e2470726f70732e6f70656e"></a>

<a id="PreviewCardRoot-open"></a>

<a id="api-50726576696577436172642e526f6f742e2470726f70732e6f6e4f70656e4368616e6765"></a>

<a id="PreviewCardRoot-onOpenChange"></a>

<a id="api-50726576696577436172642e526f6f742e2470726f70732e616374696f6e73526566"></a>

<a id="PreviewCardRoot-actionsRef"></a>

<a id="api-50726576696577436172642e526f6f742e2470726f70732e64656661756c74547269676765724964"></a>

<a id="PreviewCardRoot-defaultTriggerId"></a>

<a id="api-50726576696577436172642e526f6f742e2470726f70732e68616e646c65"></a>

<a id="PreviewCardRoot-handle"></a>

<a id="api-50726576696577436172642e526f6f742e2470726f70732e6f6e4f70656e4368616e6765436f6d706c657465"></a>

<a id="PreviewCardRoot-onOpenChangeComplete"></a>

<a id="api-50726576696577436172642e526f6f742e2470726f70732e747269676765724964"></a>

<a id="PreviewCardRoot-triggerId"></a>

<a id="api-50726576696577436172642e526f6f742e2470726f70732e6368696c6472656e"></a>

<a id="PreviewCardRoot-children"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultOpen | `boolean \| undefined` | No | Unavailable |  |
| open | `boolean \| undefined` | No | Unavailable |  |
| onOpenChange | `((open: boolean, details: PreviewCardRootChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| actionsRef | `((actions: PreviewCardRootActions \| null) => void) \| undefined` | No | Unavailable | Native callback ref; receives null on disposal or replacement. |
| defaultTriggerId | `string \| null \| undefined` | No | Unavailable |  |
| handle | `PreviewCardHandle<Payload> \| undefined` | No | Unavailable |  |
| onOpenChangeComplete | `((open: boolean) => void) \| undefined` | No | Unavailable |  |
| triggerId | `string \| null \| undefined` | No | Unavailable |  |
| children | `JSX.Element \| ((context: { readonly payload: Payload \| undefined; }) => JSX.Element)` | No | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-50726576696577436172642e526f6f742e50726f7073"></a>

<a id="previewcardrootprops"></a>

### Related exported type: PreviewCard.Root.Props

Declaration: `packages/solid/build/types/preview-card/root/PreviewCardRoot.d.ts:32`

#### Declaration

```typescript
Props<Payload>
```

<a id="api-50726576696577436172642e526f6f742e50726f70732e64656661756c744f70656e"></a>

<a id="PreviewCardRootProps-defaultOpen"></a>

<a id="api-50726576696577436172642e526f6f742e50726f70732e6f70656e"></a>

<a id="PreviewCardRootProps-open"></a>

<a id="api-50726576696577436172642e526f6f742e50726f70732e6f6e4f70656e4368616e6765"></a>

<a id="PreviewCardRootProps-onOpenChange"></a>

<a id="api-50726576696577436172642e526f6f742e50726f70732e616374696f6e73526566"></a>

<a id="PreviewCardRootProps-actionsRef"></a>

<a id="api-50726576696577436172642e526f6f742e50726f70732e64656661756c74547269676765724964"></a>

<a id="PreviewCardRootProps-defaultTriggerId"></a>

<a id="api-50726576696577436172642e526f6f742e50726f70732e68616e646c65"></a>

<a id="PreviewCardRootProps-handle"></a>

<a id="api-50726576696577436172642e526f6f742e50726f70732e6f6e4f70656e4368616e6765436f6d706c657465"></a>

<a id="PreviewCardRootProps-onOpenChangeComplete"></a>

<a id="api-50726576696577436172642e526f6f742e50726f70732e747269676765724964"></a>

<a id="PreviewCardRootProps-triggerId"></a>

<a id="api-50726576696577436172642e526f6f742e50726f70732e6368696c6472656e"></a>

<a id="PreviewCardRootProps-children"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultOpen | `boolean \| undefined` | No | Unavailable |  |
| open | `boolean \| undefined` | No | Unavailable |  |
| onOpenChange | `((open: boolean, details: PreviewCardRootChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| actionsRef | `((actions: PreviewCardRootActions \| null) => void) \| undefined` | No | Unavailable | Native callback ref; receives null on disposal or replacement. |
| defaultTriggerId | `string \| null \| undefined` | No | Unavailable |  |
| handle | `PreviewCardHandle<Payload> \| undefined` | No | Unavailable |  |
| onOpenChangeComplete | `((open: boolean) => void) \| undefined` | No | Unavailable |  |
| triggerId | `string \| null \| undefined` | No | Unavailable |  |
| children | `JSX.Element \| ((context: { readonly payload: Payload \| undefined; }) => JSX.Element)` | No | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-50726576696577436172642e526f6f742e5374617465"></a>

<a id="previewcardrootstate"></a>

### Related exported type: PreviewCard.Root.State

Declaration: `packages/solid/build/types/preview-card/root/PreviewCardRoot.d.ts:31`

#### Declaration

```typescript
PreviewCardRootState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-50726576696577436172642e526f6f742e416374696f6e73"></a>

<a id="previewcardrootactions"></a>

### Related exported type: PreviewCard.Root.Actions

Declaration: `packages/solid/build/types/preview-card/root/PreviewCardRoot.d.ts:33`

#### Declaration

```typescript
PreviewCardRootActions
```

<a id="api-50726576696577436172642e526f6f742e416374696f6e732e636c6f7365"></a>

<a id="PreviewCardRootActions-close"></a>

<a id="api-50726576696577436172642e526f6f742e416374696f6e732e756e6d6f756e74"></a>

<a id="PreviewCardRootActions-unmount"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| close | `() => void` | Yes | Unavailable |  |
| unmount | `() => void` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-50726576696577436172642e526f6f742e4368616e67654576656e74526561736f6e"></a>

<a id="previewcardrootchangeeventreason"></a>

### Related exported type: PreviewCard.Root.ChangeEventReason

Declaration: `packages/solid/build/types/preview-card/root/PreviewCardRoot.d.ts:34`

#### Declaration

```typescript
PreviewCardRootChangeEventReason
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-50726576696577436172642e526f6f742e4368616e67654576656e7444657461696c73"></a>

<a id="previewcardrootchangeeventdetails"></a>

### Related exported type: PreviewCard.Root.ChangeEventDetails

Declaration: `packages/solid/build/types/preview-card/root/PreviewCardRoot.d.ts:35`

#### Declaration

```typescript
PreviewCardRootChangeEventDetails
```

<a id="api-50726576696577436172642e526f6f742e4368616e67654576656e7444657461696c732e616c6c6f7750726f7061676174696f6e"></a>

<a id="PreviewCardRootChangeEventDetails-allowPropagation"></a>

<a id="api-50726576696577436172642e526f6f742e4368616e67654576656e7444657461696c732e63616e63656c"></a>

<a id="PreviewCardRootChangeEventDetails-cancel"></a>

<a id="api-50726576696577436172642e526f6f742e4368616e67654576656e7444657461696c732e6576656e74"></a>

<a id="PreviewCardRootChangeEventDetails-event"></a>

<a id="api-50726576696577436172642e526f6f742e4368616e67654576656e7444657461696c732e697343616e63656c6564"></a>

<a id="PreviewCardRootChangeEventDetails-isCanceled"></a>

<a id="api-50726576696577436172642e526f6f742e4368616e67654576656e7444657461696c732e697350726f7061676174696f6e416c6c6f776564"></a>

<a id="PreviewCardRootChangeEventDetails-isPropagationAllowed"></a>

<a id="api-50726576696577436172642e526f6f742e4368616e67654576656e7444657461696c732e70726576656e74556e6d6f756e744f6e436c6f7365"></a>

<a id="PreviewCardRootChangeEventDetails-preventUnmountOnClose"></a>

<a id="api-50726576696577436172642e526f6f742e4368616e67654576656e7444657461696c732e726561736f6e"></a>

<a id="PreviewCardRootChangeEventDetails-reason"></a>

<a id="api-50726576696577436172642e526f6f742e4368616e67654576656e7444657461696c732e74726967676572"></a>

<a id="PreviewCardRootChangeEventDetails-trigger"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| allowPropagation | `() => void` | Yes | Unavailable | Marks this change transaction as allowing propagation. |
| cancel | `() => void` | Yes | Unavailable | Cancels the Base UI change transaction; separate from the DOM event’s preventDefault() and preventBaseUIHandler(). |
| event | `PointerEvent \| MouseEvent \| Event \| FocusEvent \| KeyboardEvent \| TouchEvent` | Yes | Unavailable | Native DOM event associated with the change. Programmatic changes can use a Base UI-created Event. |
| isCanceled | `boolean` | Yes | Unavailable | Whether cancel() has been called for this change transaction. |
| isPropagationAllowed | `boolean` | Yes | Unavailable | Whether allowPropagation() has been called for this change transaction. |
| preventUnmountOnClose | `() => void` | Yes | Unavailable |  |
| reason | `"none" \| "trigger-press" \| "trigger-hover" \| "trigger-focus" \| "outside-press" \| "escape-key" \| "imperative-action"` | Yes | Unavailable | Reason for the requested change; it discriminates the native event type. |
| trigger | `Element \| undefined` | Yes | Unavailable | Trigger element associated with this change, when available. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="trigger"></a>

### Trigger

<a id="api-50726576696577436172642e54726967676572"></a>

<a id="previewcardtrigger"></a>

<a id="api-50726576696577436172642e547269676765722e2470726f70732e70726f703a63686172736574"></a>

<a id="api-50726576696577436172642e547269676765722e2470726f70732e70726f703a636f6f726473"></a>

<a id="api-50726576696577436172642e547269676765722e2470726f70732e70726f703a646f776e6c6f6164"></a>

<a id="api-50726576696577436172642e547269676765722e2470726f70732e70726f703a68617368"></a>

<a id="api-50726576696577436172642e547269676765722e2470726f70732e70726f703a686f7374"></a>

<a id="api-50726576696577436172642e547269676765722e2470726f70732e70726f703a686f73746e616d65"></a>

<a id="api-50726576696577436172642e547269676765722e2470726f70732e70726f703a68726566"></a>

<a id="api-50726576696577436172642e547269676765722e2470726f70732e70726f703a687265666c616e67"></a>

<a id="api-50726576696577436172642e547269676765722e2470726f70732e70726f703a6e616d65"></a>

<a id="api-50726576696577436172642e547269676765722e2470726f70732e70726f703a70617373776f7264"></a>

<a id="api-50726576696577436172642e547269676765722e2470726f70732e70726f703a706174686e616d65"></a>

<a id="api-50726576696577436172642e547269676765722e2470726f70732e70726f703a70696e67"></a>

<a id="api-50726576696577436172642e547269676765722e2470726f70732e70726f703a706f7274"></a>

<a id="api-50726576696577436172642e547269676765722e2470726f70732e70726f703a70726f746f636f6c"></a>

<a id="api-50726576696577436172642e547269676765722e2470726f70732e70726f703a7265666572726572506f6c696379"></a>

<a id="api-50726576696577436172642e547269676765722e2470726f70732e70726f703a72656c"></a>

<a id="api-50726576696577436172642e547269676765722e2470726f70732e70726f703a726576"></a>

<a id="api-50726576696577436172642e547269676765722e2470726f70732e70726f703a736561726368"></a>

<a id="api-50726576696577436172642e547269676765722e2470726f70732e70726f703a7368617065"></a>

<a id="api-50726576696577436172642e547269676765722e2470726f70732e70726f703a746172676574"></a>

<a id="api-50726576696577436172642e547269676765722e2470726f70732e70726f703a74657874"></a>

<a id="api-50726576696577436172642e547269676765722e2470726f70732e70726f703a74797065"></a>

<a id="api-50726576696577436172642e547269676765722e2470726f70732e70726f703a757365726e616d65"></a>

### PreviewCard.Trigger

A link which opens a preview on pointer rest or keyboard focus.

Declaration: `packages/solid/build/types/preview-card/trigger/PreviewCardTrigger.d.ts:5`

#### Declaration

```typescript
<Payload = unknown>(props: PreviewCardTrigger.Props<Payload>) => JSX.Element
```

<a id="api-50726576696577436172642e547269676765722e2470726f70732e68616e646c65"></a>

<a id="PreviewCardTrigger-handle"></a>

<a id="api-50726576696577436172642e547269676765722e2470726f70732e7061796c6f6164"></a>

<a id="PreviewCardTrigger-payload"></a>

<a id="api-50726576696577436172642e547269676765722e2470726f70732e64656c6179"></a>

<a id="PreviewCardTrigger-delay"></a>

<a id="api-50726576696577436172642e547269676765722e2470726f70732e636c6f736544656c6179"></a>

<a id="PreviewCardTrigger-closeDelay"></a>

<a id="api-50726576696577436172642e547269676765722e2470726f70732e636c617373"></a>

<a id="PreviewCardTrigger-class"></a>

<a id="api-50726576696577436172642e547269676765722e2470726f70732e7374796c65"></a>

<a id="PreviewCardTrigger-style"></a>

<a id="api-50726576696577436172642e547269676765722e2470726f70732e72656e646572"></a>

<a id="PreviewCardTrigger-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| handle | `PreviewCardHandle<Payload> \| undefined` | No | Unavailable |  |
| payload | `Payload \| undefined` | No | Unavailable |  |
| delay | `number \| undefined` | No | 600 | Pointer rest / focus delay, in milliseconds. |
| closeDelay | `number \| undefined` | No | 300 | Close delay, in milliseconds. |
| class | `JSX.ClassValue \| ((state: Readonly<PreviewCardTriggerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PreviewCardTriggerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.AnchorHTMLAttributes<HTMLAnchorElement> & JSX.Properties<HTMLAnchorElement>, PreviewCardTriggerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `attributionsrc`, `autocapitalize`, `autocorrect`, `autofocus`, `charset`, `children`, `contenteditable`, `contextmenu`, `coords`, `datatype`, `dir`, `download`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `href`, `hreflang`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `link`, `name`, `nonce`, `noscroll`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `ping`, `popover`, `prefix`, `preload`, `prop:charset`, `prop:coords`, `prop:download`, `prop:hash`, `prop:host`, `prop:hostname`, `prop:href`, `prop:hreflang`, `prop:name`, `prop:password`, `prop:pathname`, `prop:ping`, `prop:port`, `prop:protocol`, `prop:referrerPolicy`, `prop:rel`, `prop:rev`, `prop:search`, `prop:shape`, `prop:target`, `prop:text`, `prop:type`, `prop:username`, `property`, `ref`, `referrerpolicy`, `rel`, `replace`, `resource`, `rev`, `role`, `shape`, `slot`, `spellcheck`, `state`, `tabindex`, `target`, `textContent`, `title`, `translate`, `type`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`, `xmlns`

#### Data attributes

<a id="api-50726576696577436172645472696767657244617461417474726962757465732e706f7075704f70656e"></a>

| Name | Description |
| --- | --- |
| data-popup-open | Present when this trigger's preview card is open. |

#### CSS variables

Metadata status: unavailable.

<a id="api-50726576696577436172642e547269676765722e50726f7073"></a>

<a id="previewcardtriggerprops"></a>

<a id="api-50726576696577436172642e547269676765722e50726f70732e70726f703a63686172736574"></a>

<a id="api-50726576696577436172642e547269676765722e50726f70732e70726f703a636f6f726473"></a>

<a id="api-50726576696577436172642e547269676765722e50726f70732e70726f703a646f776e6c6f6164"></a>

<a id="api-50726576696577436172642e547269676765722e50726f70732e70726f703a68617368"></a>

<a id="api-50726576696577436172642e547269676765722e50726f70732e70726f703a686f7374"></a>

<a id="api-50726576696577436172642e547269676765722e50726f70732e70726f703a686f73746e616d65"></a>

<a id="api-50726576696577436172642e547269676765722e50726f70732e70726f703a68726566"></a>

<a id="api-50726576696577436172642e547269676765722e50726f70732e70726f703a687265666c616e67"></a>

<a id="api-50726576696577436172642e547269676765722e50726f70732e70726f703a6e616d65"></a>

<a id="api-50726576696577436172642e547269676765722e50726f70732e70726f703a70617373776f7264"></a>

<a id="api-50726576696577436172642e547269676765722e50726f70732e70726f703a706174686e616d65"></a>

<a id="api-50726576696577436172642e547269676765722e50726f70732e70726f703a70696e67"></a>

<a id="api-50726576696577436172642e547269676765722e50726f70732e70726f703a706f7274"></a>

<a id="api-50726576696577436172642e547269676765722e50726f70732e70726f703a70726f746f636f6c"></a>

<a id="api-50726576696577436172642e547269676765722e50726f70732e70726f703a7265666572726572506f6c696379"></a>

<a id="api-50726576696577436172642e547269676765722e50726f70732e70726f703a72656c"></a>

<a id="api-50726576696577436172642e547269676765722e50726f70732e70726f703a726576"></a>

<a id="api-50726576696577436172642e547269676765722e50726f70732e70726f703a736561726368"></a>

<a id="api-50726576696577436172642e547269676765722e50726f70732e70726f703a7368617065"></a>

<a id="api-50726576696577436172642e547269676765722e50726f70732e70726f703a746172676574"></a>

<a id="api-50726576696577436172642e547269676765722e50726f70732e70726f703a74657874"></a>

<a id="api-50726576696577436172642e547269676765722e50726f70732e70726f703a74797065"></a>

<a id="api-50726576696577436172642e547269676765722e50726f70732e70726f703a757365726e616d65"></a>

### Related exported type: PreviewCard.Trigger.Props

Declaration: `packages/solid/build/types/preview-card/trigger/PreviewCardTrigger.d.ts:19`

#### Declaration

```typescript
Props<Payload>
```

<a id="api-50726576696577436172642e547269676765722e50726f70732e68616e646c65"></a>

<a id="PreviewCardTriggerProps-handle"></a>

<a id="api-50726576696577436172642e547269676765722e50726f70732e7061796c6f6164"></a>

<a id="PreviewCardTriggerProps-payload"></a>

<a id="api-50726576696577436172642e547269676765722e50726f70732e64656c6179"></a>

<a id="PreviewCardTriggerProps-delay"></a>

<a id="api-50726576696577436172642e547269676765722e50726f70732e636c6f736544656c6179"></a>

<a id="PreviewCardTriggerProps-closeDelay"></a>

<a id="api-50726576696577436172642e547269676765722e50726f70732e636c617373"></a>

<a id="PreviewCardTriggerProps-class"></a>

<a id="api-50726576696577436172642e547269676765722e50726f70732e7374796c65"></a>

<a id="PreviewCardTriggerProps-style"></a>

<a id="api-50726576696577436172642e547269676765722e50726f70732e72656e646572"></a>

<a id="PreviewCardTriggerProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| handle | `PreviewCardHandle<Payload> \| undefined` | No | Unavailable |  |
| payload | `Payload \| undefined` | No | Unavailable |  |
| delay | `number \| undefined` | No | 600 | Pointer rest / focus delay, in milliseconds. |
| closeDelay | `number \| undefined` | No | 300 | Close delay, in milliseconds. |
| class | `JSX.ClassValue \| ((state: Readonly<PreviewCardTriggerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PreviewCardTriggerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.AnchorHTMLAttributes<HTMLAnchorElement> & JSX.Properties<HTMLAnchorElement>, PreviewCardTriggerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `attributionsrc`, `autocapitalize`, `autocorrect`, `autofocus`, `charset`, `children`, `contenteditable`, `contextmenu`, `coords`, `datatype`, `dir`, `download`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `href`, `hreflang`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `link`, `name`, `nonce`, `noscroll`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `ping`, `popover`, `prefix`, `preload`, `prop:charset`, `prop:coords`, `prop:download`, `prop:hash`, `prop:host`, `prop:hostname`, `prop:href`, `prop:hreflang`, `prop:name`, `prop:password`, `prop:pathname`, `prop:ping`, `prop:port`, `prop:protocol`, `prop:referrerPolicy`, `prop:rel`, `prop:rev`, `prop:search`, `prop:shape`, `prop:target`, `prop:text`, `prop:type`, `prop:username`, `property`, `ref`, `referrerpolicy`, `rel`, `replace`, `resource`, `rev`, `role`, `shape`, `slot`, `spellcheck`, `state`, `tabindex`, `target`, `textContent`, `title`, `translate`, `type`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`, `xmlns`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-50726576696577436172642e547269676765722e5374617465"></a>

<a id="previewcardtriggerstate"></a>

### Related exported type: PreviewCard.Trigger.State

Declaration: `packages/solid/build/types/preview-card/trigger/PreviewCardTrigger.d.ts:18`

#### Declaration

```typescript
PreviewCardTriggerState
```

<a id="api-50726576696577436172642e547269676765722e53746174652e6f70656e"></a>

<a id="PreviewCardTriggerState-open"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="portal"></a>

### Portal

<a id="api-50726576696577436172642e506f7274616c"></a>

<a id="previewcardportal"></a>

<a id="api-50726576696577436172642e506f7274616c2e2470726f70732e70726f703a616c69676e"></a>

### PreviewCard.Portal

Declaration: `packages/solid/build/types/preview-card/portal/PreviewCardPortal.d.ts:3`

#### Declaration

```typescript
(props: PreviewCardPortal.Props) => JSX.Element
```

<a id="api-50726576696577436172642e506f7274616c2e2470726f70732e636f6e7461696e6572"></a>

<a id="PreviewCardPortal-container"></a>

<a id="api-50726576696577436172642e506f7274616c2e2470726f70732e636c617373"></a>

<a id="PreviewCardPortal-class"></a>

<a id="api-50726576696577436172642e506f7274616c2e2470726f70732e7374796c65"></a>

<a id="PreviewCardPortal-style"></a>

<a id="api-50726576696577436172642e506f7274616c2e2470726f70732e6b6565704d6f756e746564"></a>

<a id="PreviewCardPortal-keepMounted"></a>

<a id="api-50726576696577436172642e506f7274616c2e2470726f70732e72656e646572"></a>

<a id="PreviewCardPortal-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| container | `PortalContainer` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<PreviewCardPortalState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PreviewCardPortalState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | false |  |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PreviewCardPortalState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-50726576696577436172642e506f7274616c2e50726f7073"></a>

<a id="previewcardportalprops"></a>

<a id="api-50726576696577436172642e506f7274616c2e50726f70732e70726f703a616c69676e"></a>

### Related exported type: PreviewCard.Portal.Props

Declaration: `packages/solid/build/types/preview-card/portal/PreviewCardPortal.d.ts:12`

#### Declaration

```typescript
PreviewCardPortalProps
```

<a id="api-50726576696577436172642e506f7274616c2e50726f70732e636f6e7461696e6572"></a>

<a id="PreviewCardPortalProps-container"></a>

<a id="api-50726576696577436172642e506f7274616c2e50726f70732e636c617373"></a>

<a id="PreviewCardPortalProps-class"></a>

<a id="api-50726576696577436172642e506f7274616c2e50726f70732e7374796c65"></a>

<a id="PreviewCardPortalProps-style"></a>

<a id="api-50726576696577436172642e506f7274616c2e50726f70732e6b6565704d6f756e746564"></a>

<a id="PreviewCardPortalProps-keepMounted"></a>

<a id="api-50726576696577436172642e506f7274616c2e50726f70732e72656e646572"></a>

<a id="PreviewCardPortalProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| container | `PortalContainer` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<PreviewCardPortalState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PreviewCardPortalState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| keepMounted | `boolean \| undefined` | No | Unavailable |  |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PreviewCardPortalState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-50726576696577436172642e506f7274616c2e5374617465"></a>

<a id="previewcardportalstate"></a>

### Related exported type: PreviewCard.Portal.State

Declaration: `packages/solid/build/types/preview-card/portal/PreviewCardPortal.d.ts:11`

#### Declaration

```typescript
PreviewCardPortalState
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="backdrop"></a>

### Backdrop

<a id="api-50726576696577436172642e4261636b64726f70"></a>

<a id="previewcardbackdrop"></a>

<a id="api-50726576696577436172642e4261636b64726f702e2470726f70732e70726f703a616c69676e"></a>

### PreviewCard.Backdrop

Declaration: `packages/solid/build/types/preview-card/backdrop/PreviewCardBackdrop.d.ts:3`

#### Declaration

```typescript
(props: PreviewCardBackdrop.Props) => JSX.Element
```

<a id="api-50726576696577436172642e4261636b64726f702e2470726f70732e636c617373"></a>

<a id="PreviewCardBackdrop-class"></a>

<a id="api-50726576696577436172642e4261636b64726f702e2470726f70732e7374796c65"></a>

<a id="PreviewCardBackdrop-style"></a>

<a id="api-50726576696577436172642e4261636b64726f702e2470726f70732e72656e646572"></a>

<a id="PreviewCardBackdrop-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<PreviewCardBackdropState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PreviewCardBackdropState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PreviewCardBackdropState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-50726576696577436172644261636b64726f7044617461417474726962757465732e6f70656e"></a>

<a id="api-50726576696577436172644261636b64726f7044617461417474726962757465732e636c6f736564"></a>

<a id="api-50726576696577436172642e4261636b64726f702e64617461417474726962757465732e646174612d616e63686f722d68696464656e"></a>

<a id="api-50726576696577436172644261636b64726f7044617461417474726962757465732e7374617274696e675374796c65"></a>

<a id="api-50726576696577436172644261636b64726f7044617461417474726962757465732e656e64696e675374796c65"></a>

| Name | Description |
| --- | --- |
| data-open | Present when open is true. |
| data-closed | Present when open is false. |
| data-anchor-hidden | Present when anchorHidden is true. |
| data-starting-style | Present when transitionStatus is 'starting'. |
| data-ending-style | Present when transitionStatus is 'ending'. |

#### CSS variables

Metadata status: unavailable.

<a id="api-50726576696577436172642e4261636b64726f702e50726f7073"></a>

<a id="previewcardbackdropprops"></a>

<a id="api-50726576696577436172642e4261636b64726f702e50726f70732e70726f703a616c69676e"></a>

### Related exported type: PreviewCard.Backdrop.Props

Declaration: `packages/solid/build/types/preview-card/backdrop/PreviewCardBackdrop.d.ts:12`

#### Declaration

```typescript
PreviewCardBackdropProps
```

<a id="api-50726576696577436172642e4261636b64726f702e50726f70732e636c617373"></a>

<a id="PreviewCardBackdropProps-class"></a>

<a id="api-50726576696577436172642e4261636b64726f702e50726f70732e7374796c65"></a>

<a id="PreviewCardBackdropProps-style"></a>

<a id="api-50726576696577436172642e4261636b64726f702e50726f70732e72656e646572"></a>

<a id="PreviewCardBackdropProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<PreviewCardBackdropState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PreviewCardBackdropState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PreviewCardBackdropState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-50726576696577436172642e4261636b64726f702e5374617465"></a>

<a id="previewcardbackdropstate"></a>

### Related exported type: PreviewCard.Backdrop.State

Declaration: `packages/solid/build/types/preview-card/backdrop/PreviewCardBackdrop.d.ts:11`

#### Declaration

```typescript
PreviewCardBackdropState
```

<a id="api-50726576696577436172642e4261636b64726f702e53746174652e6f70656e"></a>

<a id="PreviewCardBackdropState-open"></a>

<a id="api-50726576696577436172642e4261636b64726f702e53746174652e7472616e736974696f6e537461747573"></a>

<a id="PreviewCardBackdropState-transitionStatus"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |
| transitionStatus | `TransitionStatus` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="positioner"></a>

### Positioner

<a id="api-50726576696577436172642e506f736974696f6e6572"></a>

<a id="previewcardpositioner"></a>

<a id="api-50726576696577436172642e506f736974696f6e65722e2470726f70732e70726f703a616c69676e"></a>

### PreviewCard.Positioner

Declaration: `packages/solid/build/types/preview-card/positioner/PreviewCardPositioner.d.ts:3`

#### Declaration

```typescript
(props: PreviewCardPositioner.Props) => JSX.Element
```

<a id="api-50726576696577436172642e506f736974696f6e65722e2470726f70732e64697361626c65416e63686f72547261636b696e67"></a>

<a id="PreviewCardPositioner-disableAnchorTracking"></a>

<a id="api-50726576696577436172642e506f736974696f6e65722e2470726f70732e616c69676e"></a>

<a id="PreviewCardPositioner-align"></a>

<a id="api-50726576696577436172642e506f736974696f6e65722e2470726f70732e616c69676e4f6666736574"></a>

<a id="PreviewCardPositioner-alignOffset"></a>

<a id="api-50726576696577436172642e506f736974696f6e65722e2470726f70732e73696465"></a>

<a id="PreviewCardPositioner-side"></a>

<a id="api-50726576696577436172642e506f736974696f6e65722e2470726f70732e736964654f6666736574"></a>

<a id="PreviewCardPositioner-sideOffset"></a>

<a id="api-50726576696577436172642e506f736974696f6e65722e2470726f70732e6172726f7750616464696e67"></a>

<a id="PreviewCardPositioner-arrowPadding"></a>

<a id="api-50726576696577436172642e506f736974696f6e65722e2470726f70732e616e63686f72"></a>

<a id="PreviewCardPositioner-anchor"></a>

<a id="api-50726576696577436172642e506f736974696f6e65722e2470726f70732e636f6c6c6973696f6e41766f6964616e6365"></a>

<a id="PreviewCardPositioner-collisionAvoidance"></a>

<a id="api-50726576696577436172642e506f736974696f6e65722e2470726f70732e636f6c6c6973696f6e426f756e64617279"></a>

<a id="PreviewCardPositioner-collisionBoundary"></a>

<a id="api-50726576696577436172642e506f736974696f6e65722e2470726f70732e636f6c6c6973696f6e50616464696e67"></a>

<a id="PreviewCardPositioner-collisionPadding"></a>

<a id="api-50726576696577436172642e506f736974696f6e65722e2470726f70732e737469636b79"></a>

<a id="PreviewCardPositioner-sticky"></a>

<a id="api-50726576696577436172642e506f736974696f6e65722e2470726f70732e706f736974696f6e4d6574686f64"></a>

<a id="PreviewCardPositioner-positionMethod"></a>

<a id="api-50726576696577436172642e506f736974696f6e65722e2470726f70732e636c617373"></a>

<a id="PreviewCardPositioner-class"></a>

<a id="api-50726576696577436172642e506f736974696f6e65722e2470726f70732e7374796c65"></a>

<a id="PreviewCardPositioner-style"></a>

<a id="api-50726576696577436172642e506f736974696f6e65722e2470726f70732e72656e646572"></a>

<a id="PreviewCardPositioner-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| disableAnchorTracking | `boolean \| undefined` | No | false | Disables ancestor-scroll, element-resize and layout-shift observation used for automatic positioning updates. |
| align | `Align \| undefined` | No | 'center' | Preferred alignment along the anchor’s side. Collision handling can change the resolved alignment. |
| alignOffset | `number \| OffsetFunction \| undefined` | No | 0 | Offset along the alignment axis, in pixels. A callback receives anchor and positioner dimensions plus the side and alignment. |
| side | `Side \| undefined` | No | 'bottom' | Preferred side of the anchor. Logical inline sides follow the text direction; collision handling can change the resolved side. |
| sideOffset | `number \| OffsetFunction \| undefined` | No | 0 | Distance from the anchor along the side axis, in pixels. A callback receives anchor and positioner dimensions plus the side and alignment. |
| arrowPadding | `number \| undefined` | No | 5 | Minimum padding in pixels between the arrow and the floating element’s edges. |
| anchor | `ReferenceType \| (() => ReferenceType \| null) \| null \| undefined` | No | Unavailable | Positioning reference: an element or virtual reference, or an accessor returning one. A nullish reference falls back to the root’s reference. |
| collisionAvoidance | `{ side?: "flip" \| "shift" \| "none"; align?: "flip" \| "shift" \| "none"; fallbackAxisSide?: "start" \| "end" \| "none"; } \| undefined` | No | { fallbackAxisSide: 'end' } | Controls flipping or shifting along the side and alignment axes, including fallback placement on the perpendicular axis. |
| collisionBoundary | `Boundary \| "clipping-ancestors" \| undefined` | No | 'clipping-ancestors' | Boundary used to detect overflow. The clipping-ancestors value uses clipping ancestors as the overflow boundary. |
| collisionPadding | `Padding \| undefined` | No | 5 | Space in pixels reserved inside the collision boundary, either for all edges or per edge. |
| sticky | `boolean \| undefined` | No | false | Allows shifting along the side axis without the usual limitShift limiter. |
| positionMethod | `"fixed" \| "absolute" \| undefined` | No | 'absolute' | CSS positioning strategy used by the floating element: absolute or fixed. |
| class | `JSX.ClassValue \| ((state: Readonly<PreviewCardPositionerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PreviewCardPositionerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PreviewCardPositionerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-5072657669657743617264506f736974696f6e657244617461417474726962757465732e6f70656e"></a>

<a id="api-5072657669657743617264506f736974696f6e657244617461417474726962757465732e636c6f736564"></a>

<a id="api-5072657669657743617264506f736974696f6e657244617461417474726962757465732e616e63686f7248696464656e"></a>

<a id="api-5072657669657743617264506f736974696f6e657244617461417474726962757465732e616c69676e"></a>

<a id="api-5072657669657743617264506f736974696f6e657244617461417474726962757465732e73696465"></a>

| Name | Description |
| --- | --- |
| data-open | Present when open is true. |
| data-closed | Present when open is false. |
| data-anchor-hidden | Present when anchorHidden is true. |
| data-align |  |
| data-side |  |

#### CSS variables

<a id="api-5072657669657743617264506f736974696f6e65724373735661726961626c65732e616e63686f72486569676874"></a>

<a id="api-5072657669657743617264506f736974696f6e65724373735661726961626c65732e616e63686f725769647468"></a>

<a id="api-5072657669657743617264506f736974696f6e65724373735661726961626c65732e617661696c61626c65486569676874"></a>

<a id="api-5072657669657743617264506f736974696f6e65724373735661726961626c65732e617661696c61626c655769647468"></a>

<a id="api-5072657669657743617264506f736974696f6e65724373735661726961626c65732e706f736974696f6e6572486569676874"></a>

<a id="api-5072657669657743617264506f736974696f6e65724373735661726961626c65732e706f736974696f6e65725769647468"></a>

<a id="api-5072657669657743617264506f736974696f6e65724373735661726961626c65732e7472616e73666f726d4f726967696e"></a>

| Name | Description |
| --- | --- |
| --anchor-height |  |
| --anchor-width |  |
| --available-height |  |
| --available-width |  |
| --positioner-height |  |
| --positioner-width |  |
| --transform-origin |  |

<a id="api-50726576696577436172642e506f736974696f6e65722e50726f7073"></a>

<a id="previewcardpositionerprops"></a>

<a id="api-50726576696577436172642e506f736974696f6e65722e50726f70732e70726f703a616c69676e"></a>

### Related exported type: PreviewCard.Positioner.Props

Declaration: `packages/solid/build/types/preview-card/positioner/PreviewCardPositioner.d.ts:15`

#### Declaration

```typescript
PreviewCardPositionerProps
```

<a id="api-50726576696577436172642e506f736974696f6e65722e50726f70732e64697361626c65416e63686f72547261636b696e67"></a>

<a id="PreviewCardPositionerProps-disableAnchorTracking"></a>

<a id="api-50726576696577436172642e506f736974696f6e65722e50726f70732e616c69676e"></a>

<a id="PreviewCardPositionerProps-align"></a>

<a id="api-50726576696577436172642e506f736974696f6e65722e50726f70732e616c69676e4f6666736574"></a>

<a id="PreviewCardPositionerProps-alignOffset"></a>

<a id="api-50726576696577436172642e506f736974696f6e65722e50726f70732e73696465"></a>

<a id="PreviewCardPositionerProps-side"></a>

<a id="api-50726576696577436172642e506f736974696f6e65722e50726f70732e736964654f6666736574"></a>

<a id="PreviewCardPositionerProps-sideOffset"></a>

<a id="api-50726576696577436172642e506f736974696f6e65722e50726f70732e6172726f7750616464696e67"></a>

<a id="PreviewCardPositionerProps-arrowPadding"></a>

<a id="api-50726576696577436172642e506f736974696f6e65722e50726f70732e616e63686f72"></a>

<a id="PreviewCardPositionerProps-anchor"></a>

<a id="api-50726576696577436172642e506f736974696f6e65722e50726f70732e636f6c6c6973696f6e41766f6964616e6365"></a>

<a id="PreviewCardPositionerProps-collisionAvoidance"></a>

<a id="api-50726576696577436172642e506f736974696f6e65722e50726f70732e636f6c6c6973696f6e426f756e64617279"></a>

<a id="PreviewCardPositionerProps-collisionBoundary"></a>

<a id="api-50726576696577436172642e506f736974696f6e65722e50726f70732e636f6c6c6973696f6e50616464696e67"></a>

<a id="PreviewCardPositionerProps-collisionPadding"></a>

<a id="api-50726576696577436172642e506f736974696f6e65722e50726f70732e737469636b79"></a>

<a id="PreviewCardPositionerProps-sticky"></a>

<a id="api-50726576696577436172642e506f736974696f6e65722e50726f70732e706f736974696f6e4d6574686f64"></a>

<a id="PreviewCardPositionerProps-positionMethod"></a>

<a id="api-50726576696577436172642e506f736974696f6e65722e50726f70732e636c617373"></a>

<a id="PreviewCardPositionerProps-class"></a>

<a id="api-50726576696577436172642e506f736974696f6e65722e50726f70732e7374796c65"></a>

<a id="PreviewCardPositionerProps-style"></a>

<a id="api-50726576696577436172642e506f736974696f6e65722e50726f70732e72656e646572"></a>

<a id="PreviewCardPositionerProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| disableAnchorTracking | `boolean \| undefined` | No | Unavailable | Disables ancestor-scroll, element-resize and layout-shift observation used for automatic positioning updates. |
| align | `Align \| undefined` | No | Unavailable | Preferred alignment along the anchor’s side. Collision handling can change the resolved alignment. |
| alignOffset | `number \| OffsetFunction \| undefined` | No | Unavailable | Offset along the alignment axis, in pixels. A callback receives anchor and positioner dimensions plus the side and alignment. |
| side | `Side \| undefined` | No | Unavailable | Preferred side of the anchor. Logical inline sides follow the text direction; collision handling can change the resolved side. |
| sideOffset | `number \| OffsetFunction \| undefined` | No | Unavailable | Distance from the anchor along the side axis, in pixels. A callback receives anchor and positioner dimensions plus the side and alignment. |
| arrowPadding | `number \| undefined` | No | Unavailable | Minimum padding in pixels between the arrow and the floating element’s edges. |
| anchor | `ReferenceType \| (() => ReferenceType \| null) \| null \| undefined` | No | Unavailable | Positioning reference: an element or virtual reference, or an accessor returning one. A nullish reference falls back to the root’s reference. |
| collisionAvoidance | `{ side?: "flip" \| "shift" \| "none"; align?: "flip" \| "shift" \| "none"; fallbackAxisSide?: "start" \| "end" \| "none"; } \| undefined` | No | Unavailable | Controls flipping or shifting along the side and alignment axes, including fallback placement on the perpendicular axis. |
| collisionBoundary | `Boundary \| "clipping-ancestors" \| undefined` | No | Unavailable | Boundary used to detect overflow. The clipping-ancestors value uses clipping ancestors as the overflow boundary. |
| collisionPadding | `Padding \| undefined` | No | Unavailable | Space in pixels reserved inside the collision boundary, either for all edges or per edge. |
| sticky | `boolean \| undefined` | No | Unavailable | Allows shifting along the side axis without the usual limitShift limiter. |
| positionMethod | `"fixed" \| "absolute" \| undefined` | No | Unavailable | CSS positioning strategy used by the floating element: absolute or fixed. |
| class | `JSX.ClassValue \| ((state: Readonly<PreviewCardPositionerState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PreviewCardPositionerState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PreviewCardPositionerState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-50726576696577436172642e506f736974696f6e65722e5374617465"></a>

<a id="previewcardpositionerstate"></a>

### Related exported type: PreviewCard.Positioner.State

Declaration: `packages/solid/build/types/preview-card/positioner/PreviewCardPositioner.d.ts:14`

#### Declaration

```typescript
PreviewCardPositionerState
```

<a id="api-50726576696577436172642e506f736974696f6e65722e53746174652e6f70656e"></a>

<a id="PreviewCardPositionerState-open"></a>

<a id="api-50726576696577436172642e506f736974696f6e65722e53746174652e616e63686f7248696464656e"></a>

<a id="PreviewCardPositionerState-anchorHidden"></a>

<a id="api-50726576696577436172642e506f736974696f6e65722e53746174652e696e7374616e74"></a>

<a id="PreviewCardPositionerState-instant"></a>

<a id="api-50726576696577436172642e506f736974696f6e65722e53746174652e616c69676e"></a>

<a id="PreviewCardPositionerState-align"></a>

<a id="api-50726576696577436172642e506f736974696f6e65722e53746174652e73696465"></a>

<a id="PreviewCardPositionerState-side"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |
| anchorHidden | `boolean` | Yes | Unavailable |  |
| instant | `"focus" \| "dismiss" \| undefined` | Yes | Unavailable |  |
| align | `Align` | Yes | Unavailable |  |
| side | `Side` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="popup"></a>

### Popup

<a id="api-50726576696577436172642e506f707570"></a>

<a id="previewcardpopup"></a>

<a id="api-50726576696577436172642e506f7075702e2470726f70732e70726f703a616c69676e"></a>

### PreviewCard.Popup

Declaration: `packages/solid/build/types/preview-card/popup/PreviewCardPopup.d.ts:4`

#### Declaration

```typescript
(props: PreviewCardPopup.Props) => JSX.Element
```

<a id="api-50726576696577436172642e506f7075702e2470726f70732e636c617373"></a>

<a id="PreviewCardPopup-class"></a>

<a id="api-50726576696577436172642e506f7075702e2470726f70732e7374796c65"></a>

<a id="PreviewCardPopup-style"></a>

<a id="api-50726576696577436172642e506f7075702e2470726f70732e72656e646572"></a>

<a id="PreviewCardPopup-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<PreviewCardPopupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PreviewCardPopupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PreviewCardPopupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-5072657669657743617264506f70757044617461417474726962757465732e6f70656e"></a>

<a id="api-5072657669657743617264506f70757044617461417474726962757465732e636c6f736564"></a>

<a id="api-50726576696577436172642e506f7075702e64617461417474726962757465732e646174612d616e63686f722d68696464656e"></a>

<a id="api-5072657669657743617264506f70757044617461417474726962757465732e616c69676e"></a>

<a id="api-5072657669657743617264506f70757044617461417474726962757465732e73696465"></a>

<a id="api-5072657669657743617264506f70757044617461417474726962757465732e7374617274696e675374796c65"></a>

<a id="api-5072657669657743617264506f70757044617461417474726962757465732e656e64696e675374796c65"></a>

| Name | Description |
| --- | --- |
| data-open | Present when open is true. |
| data-closed | Present when open is false. |
| data-anchor-hidden | Present when anchorHidden is true. |
| data-align |  |
| data-side |  |
| data-starting-style | Present when transitionStatus is 'starting'. |
| data-ending-style | Present when transitionStatus is 'ending'. |

#### CSS variables

Metadata status: unavailable.

<a id="api-50726576696577436172642e506f7075702e50726f7073"></a>

<a id="previewcardpopupprops"></a>

<a id="api-50726576696577436172642e506f7075702e50726f70732e70726f703a616c69676e"></a>

### Related exported type: PreviewCard.Popup.Props

Declaration: `packages/solid/build/types/preview-card/popup/PreviewCardPopup.d.ts:16`

#### Declaration

```typescript
PreviewCardPopupProps
```

<a id="api-50726576696577436172642e506f7075702e50726f70732e636c617373"></a>

<a id="PreviewCardPopupProps-class"></a>

<a id="api-50726576696577436172642e506f7075702e50726f70732e7374796c65"></a>

<a id="PreviewCardPopupProps-style"></a>

<a id="api-50726576696577436172642e506f7075702e50726f70732e72656e646572"></a>

<a id="PreviewCardPopupProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<PreviewCardPopupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PreviewCardPopupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PreviewCardPopupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-50726576696577436172642e506f7075702e5374617465"></a>

<a id="previewcardpopupstate"></a>

### Related exported type: PreviewCard.Popup.State

Declaration: `packages/solid/build/types/preview-card/popup/PreviewCardPopup.d.ts:15`

#### Declaration

```typescript
PreviewCardPopupState
```

<a id="api-50726576696577436172642e506f7075702e53746174652e6f70656e"></a>

<a id="PreviewCardPopupState-open"></a>

<a id="api-50726576696577436172642e506f7075702e53746174652e696e7374616e74"></a>

<a id="PreviewCardPopupState-instant"></a>

<a id="api-50726576696577436172642e506f7075702e53746174652e7472616e736974696f6e537461747573"></a>

<a id="PreviewCardPopupState-transitionStatus"></a>

<a id="api-50726576696577436172642e506f7075702e53746174652e616c69676e"></a>

<a id="PreviewCardPopupState-align"></a>

<a id="api-50726576696577436172642e506f7075702e53746174652e73696465"></a>

<a id="PreviewCardPopupState-side"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |
| instant | `"focus" \| "dismiss" \| undefined` | Yes | Unavailable |  |
| transitionStatus | `TransitionStatus` | Yes | Unavailable |  |
| align | `Align` | Yes | Unavailable |  |
| side | `Side` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="viewport"></a>

### Viewport

<a id="api-50726576696577436172642e56696577706f7274"></a>

<a id="previewcardviewport"></a>

<a id="api-50726576696577436172642e56696577706f72742e2470726f70732e70726f703a616c69676e"></a>

### PreviewCard.Viewport

Owned current/previous content lifetimes are supplied by the popup foundation.

Declaration: `packages/solid/build/types/preview-card/viewport/PreviewCardViewport.d.ts:3`

#### Declaration

```typescript
(props: PreviewCardViewport.Props) => JSX.Element
```

<a id="api-50726576696577436172642e56696577706f72742e2470726f70732e636c617373"></a>

<a id="PreviewCardViewport-class"></a>

<a id="api-50726576696577436172642e56696577706f72742e2470726f70732e7374796c65"></a>

<a id="PreviewCardViewport-style"></a>

<a id="api-50726576696577436172642e56696577706f72742e2470726f70732e72656e646572"></a>

<a id="PreviewCardViewport-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<PreviewCardViewportState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PreviewCardViewportState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PreviewCardViewportState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-507265766965774361726456696577706f727444617461417474726962757465732e61637469766174696f6e446972656374696f6e"></a>

<a id="api-507265766965774361726456696577706f727444617461417474726962757465732e63757272656e74"></a>

<a id="api-507265766965774361726456696577706f727444617461417474726962757465732e696e7374616e74"></a>

<a id="api-507265766965774361726456696577706f727444617461417474726962757465732e70726576696f7573"></a>

<a id="api-507265766965774361726456696577706f727444617461417474726962757465732e7472616e736974696f6e696e67"></a>

| Name | Description |
| --- | --- |
| data-activation-direction |  |
| data-current |  |
| data-instant |  |
| data-previous |  |
| data-transitioning |  |

#### CSS variables

<a id="api-507265766965774361726456696577706f72744373735661726961626c65732e706f707570486569676874"></a>

<a id="api-507265766965774361726456696577706f72744373735661726961626c65732e706f7075705769647468"></a>

| Name | Description |
| --- | --- |
| --popup-height |  |
| --popup-width |  |

<a id="api-50726576696577436172642e56696577706f72742e50726f7073"></a>

<a id="previewcardviewportprops"></a>

<a id="api-50726576696577436172642e56696577706f72742e50726f70732e70726f703a616c69676e"></a>

### Related exported type: PreviewCard.Viewport.Props

Declaration: `packages/solid/build/types/preview-card/viewport/PreviewCardViewport.d.ts:13`

#### Declaration

```typescript
PreviewCardViewportProps
```

<a id="api-50726576696577436172642e56696577706f72742e50726f70732e636c617373"></a>

<a id="PreviewCardViewportProps-class"></a>

<a id="api-50726576696577436172642e56696577706f72742e50726f70732e7374796c65"></a>

<a id="PreviewCardViewportProps-style"></a>

<a id="api-50726576696577436172642e56696577706f72742e50726f70732e72656e646572"></a>

<a id="PreviewCardViewportProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<PreviewCardViewportState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PreviewCardViewportState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PreviewCardViewportState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-50726576696577436172642e56696577706f72742e5374617465"></a>

<a id="previewcardviewportstate"></a>

### Related exported type: PreviewCard.Viewport.State

Declaration: `packages/solid/build/types/preview-card/viewport/PreviewCardViewport.d.ts:12`

#### Declaration

```typescript
PreviewCardViewportState
```

<a id="api-50726576696577436172642e56696577706f72742e53746174652e61637469766174696f6e446972656374696f6e"></a>

<a id="PreviewCardViewportState-activationDirection"></a>

<a id="api-50726576696577436172642e56696577706f72742e53746174652e696e7374616e74"></a>

<a id="PreviewCardViewportState-instant"></a>

<a id="api-50726576696577436172642e56696577706f72742e53746174652e7472616e736974696f6e696e67"></a>

<a id="PreviewCardViewportState-transitioning"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| activationDirection | `string \| undefined` | Yes | Unavailable |  |
| instant | `"focus" \| "dismiss" \| undefined` | Yes | Unavailable |  |
| transitioning | `boolean` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

The `Viewport` is optional — reach for it only when a single popup is opened by multiple triggers, its content differs per trigger, and the switch between them is animated. When used, set `width: var(--positioner-width)` and `height: var(--positioner-height)` on the `Positioner` so its box is frozen to the measured size during the transition; otherwise content-driven resizing can make the popup thrash or flip to another side.

<a id="arrow"></a>

### Arrow

<a id="api-50726576696577436172642e4172726f77"></a>

<a id="previewcardarrow"></a>

<a id="api-50726576696577436172642e4172726f772e2470726f70732e70726f703a616c69676e"></a>

### PreviewCard.Arrow

Declaration: `packages/solid/build/types/preview-card/arrow/PreviewCardArrow.d.ts:3`

#### Declaration

```typescript
(props: PreviewCardArrow.Props) => JSX.Element
```

<a id="api-50726576696577436172642e4172726f772e2470726f70732e636c617373"></a>

<a id="PreviewCardArrow-class"></a>

<a id="api-50726576696577436172642e4172726f772e2470726f70732e7374796c65"></a>

<a id="PreviewCardArrow-style"></a>

<a id="api-50726576696577436172642e4172726f772e2470726f70732e72656e646572"></a>

<a id="PreviewCardArrow-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<PreviewCardArrowState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PreviewCardArrowState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PreviewCardArrowState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-50726576696577436172644172726f7744617461417474726962757465732e6f70656e"></a>

<a id="api-50726576696577436172644172726f7744617461417474726962757465732e636c6f736564"></a>

<a id="api-50726576696577436172644172726f7744617461417474726962757465732e756e63656e7465726564"></a>

<a id="api-50726576696577436172642e4172726f772e64617461417474726962757465732e646174612d616e63686f722d68696464656e"></a>

<a id="api-50726576696577436172644172726f7744617461417474726962757465732e616c69676e"></a>

<a id="api-50726576696577436172644172726f7744617461417474726962757465732e73696465"></a>

| Name | Description |
| --- | --- |
| data-open | Present when open is true. |
| data-closed | Present when open is false. |
| data-uncentered |  |
| data-anchor-hidden | Present when anchorHidden is true. |
| data-align |  |
| data-side |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-50726576696577436172642e4172726f772e50726f7073"></a>

<a id="previewcardarrowprops"></a>

<a id="api-50726576696577436172642e4172726f772e50726f70732e70726f703a616c69676e"></a>

### Related exported type: PreviewCard.Arrow.Props

Declaration: `packages/solid/build/types/preview-card/arrow/PreviewCardArrow.d.ts:14`

#### Declaration

```typescript
PreviewCardArrowProps
```

<a id="api-50726576696577436172642e4172726f772e50726f70732e636c617373"></a>

<a id="PreviewCardArrowProps-class"></a>

<a id="api-50726576696577436172642e4172726f772e50726f70732e7374796c65"></a>

<a id="PreviewCardArrowProps-style"></a>

<a id="api-50726576696577436172642e4172726f772e50726f70732e72656e646572"></a>

<a id="PreviewCardArrowProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<PreviewCardArrowState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<PreviewCardArrowState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, PreviewCardArrowState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-50726576696577436172642e4172726f772e5374617465"></a>

<a id="previewcardarrowstate"></a>

### Related exported type: PreviewCard.Arrow.State

Declaration: `packages/solid/build/types/preview-card/arrow/PreviewCardArrow.d.ts:13`

#### Declaration

```typescript
PreviewCardArrowState
```

<a id="api-50726576696577436172642e4172726f772e53746174652e6f70656e"></a>

<a id="PreviewCardArrowState-open"></a>

<a id="api-50726576696577436172642e4172726f772e53746174652e756e63656e7465726564"></a>

<a id="PreviewCardArrowState-uncentered"></a>

<a id="api-50726576696577436172642e4172726f772e53746174652e616c69676e"></a>

<a id="PreviewCardArrowState-align"></a>

<a id="api-50726576696577436172642e4172726f772e53746174652e73696465"></a>

<a id="PreviewCardArrowState-side"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | Yes | Unavailable |  |
| uncentered | `boolean` | Yes | Unavailable |  |
| align | `Align` | Yes | Unavailable |  |
| side | `Side` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="createhandle"></a>

## createHandle

<a id="api-50726576696577436172642e63726561746548616e646c65"></a>

<a id="previewcardcreatehandle"></a>

### PreviewCard.createHandle

Declaration: `packages/solid/build/types/preview-card/store/PreviewCardHandle.d.ts:10`

#### Declaration

```typescript
<Payload = unknown>() => PreviewCardHandle<Payload>
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

#### Return value

```typescript
PreviewCardHandle<Payload>
```

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `(triggerId: string) => void` | Yes | Unavailable |  |
| close | `() => void` | Yes | Unavailable |  |
| isOpen | `boolean` | Yes | Unavailable |  |
| fallbackStore | `PreviewCardHandleStore<Payload>` | Yes | Unavailable |  |
| componentName | `any` | Yes | Unavailable |  |
| throwOnMissingTrigger | `any` | Yes | Unavailable |  |
| attached | `any` | Yes | Unavailable |  |
| current | `any` | Yes | Unavailable |  |
| version | `any` | Yes | Unavailable |  |
| warning | `any` | Yes | Unavailable |  |
| attachedStore | `PreviewCardStore<Payload> \| null` | Yes | Unavailable |  |
| store | `PreviewCardHandleStore<Payload>` | Yes | Unavailable |  |
| serverStore | `PreviewCardHandleStore<Payload>` | Yes | Unavailable |  |
| attachStore | `(store: PreviewCardStore<Payload>) => () => void` | Yes | Unavailable |  |
| activate | `any` | Yes | Unavailable |  |
| openByTrigger | `(id: string \| null \| undefined) => void` | Yes | Unavailable |  |
| closePopup | `() => void` | Yes | Unavailable |  |

[//]: # "@exclude-table-of-contents"

<a id="handle"></a>

### Handle

<a id="api-50726576696577436172642e48616e646c65"></a>

<a id="previewcardhandle"></a>

### PreviewCard.Handle

Associates detached links with the last attached living PreviewCard.Root.

Declaration: `packages/solid/build/types/preview-card/store/PreviewCardHandle.d.ts:4`

#### Declaration

```typescript
PreviewCardHandle<Payload>
```

<a id="api-50726576696577436172642e48616e646c652e6f70656e"></a>

<a id="PreviewCardHandle-open"></a>

<a id="api-50726576696577436172642e48616e646c652e6163746976617465"></a>

<a id="PreviewCardHandle-activate"></a>

<a id="api-50726576696577436172642e48616e646c652e61747461636853746f7265"></a>

<a id="PreviewCardHandle-attachStore"></a>

<a id="api-50726576696577436172642e48616e646c652e6174746163686564"></a>

<a id="PreviewCardHandle-attached"></a>

<a id="api-50726576696577436172642e48616e646c652e617474616368656453746f7265"></a>

<a id="PreviewCardHandle-attachedStore"></a>

<a id="api-50726576696577436172642e48616e646c652e636c6f7365"></a>

<a id="PreviewCardHandle-close"></a>

<a id="api-50726576696577436172642e48616e646c652e636c6f7365506f707570"></a>

<a id="PreviewCardHandle-closePopup"></a>

<a id="api-50726576696577436172642e48616e646c652e636f6d706f6e656e744e616d65"></a>

<a id="PreviewCardHandle-componentName"></a>

<a id="api-50726576696577436172642e48616e646c652e63757272656e74"></a>

<a id="PreviewCardHandle-current"></a>

<a id="api-50726576696577436172642e48616e646c652e66616c6c6261636b53746f7265"></a>

<a id="PreviewCardHandle-fallbackStore"></a>

<a id="api-50726576696577436172642e48616e646c652e69734f70656e"></a>

<a id="PreviewCardHandle-isOpen"></a>

<a id="api-50726576696577436172642e48616e646c652e6f70656e427954726967676572"></a>

<a id="PreviewCardHandle-openByTrigger"></a>

<a id="api-50726576696577436172642e48616e646c652e73657276657253746f7265"></a>

<a id="PreviewCardHandle-serverStore"></a>

<a id="api-50726576696577436172642e48616e646c652e73746f7265"></a>

<a id="PreviewCardHandle-store"></a>

<a id="api-50726576696577436172642e48616e646c652e7468726f774f6e4d697373696e6754726967676572"></a>

<a id="PreviewCardHandle-throwOnMissingTrigger"></a>

<a id="api-50726576696577436172642e48616e646c652e76657273696f6e"></a>

<a id="PreviewCardHandle-version"></a>

<a id="api-50726576696577436172642e48616e646c652e7761726e696e67"></a>

<a id="PreviewCardHandle-warning"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `(triggerId: string) => void` | Yes | Unavailable |  |
| activate | `any` | Yes | Unavailable |  |
| attachStore | `(store: PreviewCardStore<Payload>) => () => void` | Yes | Unavailable |  |
| attached | `any` | Yes | Unavailable |  |
| attachedStore | `PreviewCardStore<Payload> \| null` | Yes | Unavailable |  |
| close | `() => void` | Yes | Unavailable |  |
| closePopup | `() => void` | Yes | Unavailable |  |
| componentName | `any` | Yes | Unavailable |  |
| current | `any` | Yes | Unavailable |  |
| fallbackStore | `PreviewCardHandleStore<Payload>` | Yes | Unavailable |  |
| isOpen | `boolean` | Yes | Unavailable |  |
| openByTrigger | `(id: string \| null \| undefined) => void` | Yes | Unavailable |  |
| serverStore | `PreviewCardHandleStore<Payload>` | Yes | Unavailable |  |
| store | `PreviewCardHandleStore<Payload>` | Yes | Unavailable |  |
| throwOnMissingTrigger | `any` | Yes | Unavailable |  |
| version | `any` | Yes | Unavailable |  |
| warning | `any` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

