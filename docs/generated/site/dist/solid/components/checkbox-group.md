<a id="checkbox-group"></a>

# Checkbox Group

Provides shared state to a series of checkboxes.

[Open mounted Solid demo: checkbox-group/hero](/solid/components/checkbox-group)

<a id="usage-guidelines"></a>

## Usage guidelines

- **Form controls must have an accessible name**: It can be created using `<label>` elements, or the `Field` and `Fieldset` components. See [Labeling a checkbox group](#labeling-a-checkbox-group) and the [forms guide](/solid/handbook/forms).

<a id="anatomy"></a>

## Anatomy

Checkbox Group is composed together with [Checkbox](/solid/components/checkbox). Import the components and place them together:

```tsx
import { Checkbox } from '@unstyled-solid/base-ui/checkbox';
import { CheckboxGroup } from '@unstyled-solid/base-ui/checkbox-group';
<CheckboxGroup>
  <Checkbox.Root />
</CheckboxGroup>;
```

<a id="examples"></a>

## Examples

<a id="labeling-a-checkbox-group"></a>

### Labeling a checkbox group

Label the group with `aria-labelledby` and a sibling label element:

```tsx
<>
  <div id="protocols-label">Allowed network protocols</div>
  <CheckboxGroup aria-labelledby="protocols-label">{/* ... */}</CheckboxGroup>
</>;
```

An enclosing `<label>` is the simplest labeling pattern for each checkbox:

```tsx
<label>
  <Checkbox.Root value="http" />
  HTTP
</label>;
```

<a id="rendering-as-a-native-button"></a>

### Rendering as a native button

By default, `<Checkbox.Root>` renders a `<span>` element to support enclosing labels. Prefer rendering each checkbox as a native button when using sibling labels (`htmlFor`/`id`).

```tsx
<>
  <div id="protocols-label">Allowed network protocols</div>
  <CheckboxGroup aria-labelledby="protocols-label">
    <div>
      <label for="protocol-http">HTTP</label>

      <Checkbox.Root
        id="protocol-http"
        value="http"
        nativeButton
        render={(renderProps) => <button {...renderProps} />}
      >
        <Checkbox.Indicator />
      </Checkbox.Root>
    </div>
  </CheckboxGroup>
</>;
```

Native buttons with wrapping labels are supported by using the `render` callback to avoid invalid HTML, so the hidden input is placed outside the label:

```tsx
<>
  <div id="protocols-label">Allowed network protocols</div>
  <CheckboxGroup aria-labelledby="protocols-label">
    <Checkbox.Root
      value="http"
      nativeButton
      render={(buttonProps) => (
        <label>
          <button {...buttonProps} />
          HTTP
        </label>
      )}
    />
  </CheckboxGroup>
</>;
```

<a id="form-integration"></a>

### Form integration

Use [Field](/solid/components/field) and [Fieldset](/solid/components/fieldset) for group labeling and form integration:

```tsx
<Form>
  <Field.Root name="allowedNetworkProtocols">
    <Fieldset.Root render={(renderProps) => <CheckboxGroup {...renderProps} />}>
      <Fieldset.Legend>Allowed network protocols</Fieldset.Legend>
      <Field.Item>
        <Field.Label>
          <Checkbox.Root value="http" />
          HTTP
        </Field.Label>
      </Field.Item>
      <Field.Item>
        <Field.Label>
          <Checkbox.Root value="https" />
          HTTPS
        </Field.Label>
      </Field.Item>
      <Field.Item>
        <Field.Label>
          <Checkbox.Root value="ssh" />
          SSH
        </Field.Label>
      </Field.Item>
    </Fieldset.Root>
  </Field.Root>
</Form>;
```

<a id="parent-checkbox"></a>

### Parent checkbox

A checkbox that controls other checkboxes within a `<CheckboxGroup>` can be created:

1. Make `<CheckboxGroup>` a controlled component
2. Pass an array of all the child checkbox values to the `allValues` prop on the `<CheckboxGroup>` component
3. Add the `parent` boolean prop to the parent `<Checkbox.Root>`

The group controls the parent checkbox's [indeterminate](/solid/components/checkbox#CheckboxRoot-indeterminate) state when some, but not all, child checkboxes are checked.

[Open mounted Solid demo: checkbox-group/parent](/solid/components/checkbox-group)

<a id="nested-parent-checkbox"></a>

### Nested parent checkbox

[Open mounted Solid demo: checkbox-group/nested](/solid/components/checkbox-group)

<a id="api-reference"></a>

## API reference

<a id="api-436865636b626f7847726f7570"></a>

<a id="checkboxgroup"></a>

<a id="api-436865636b626f7847726f75702e2470726f70732e70726f703a616c69676e"></a>

### CheckboxGroup

Shared logical selection. Successful form values are projected from registered native inputs.

Declaration: `packages/solid/build/types/checkbox-group/CheckboxGroup.d.ts:18`

#### Declaration

```typescript
(props: CheckboxGroupProps) => JSX.Element
```

<a id="api-436865636b626f7847726f75702e2470726f70732e64656661756c7456616c7565"></a>

<a id="CheckboxGroup-defaultValue"></a>

<a id="api-436865636b626f7847726f75702e2470726f70732e76616c7565"></a>

<a id="CheckboxGroup-value"></a>

<a id="api-436865636b626f7847726f75702e2470726f70732e6f6e56616c75654368616e6765"></a>

<a id="CheckboxGroup-onValueChange"></a>

<a id="api-436865636b626f7847726f75702e2470726f70732e616c6c56616c756573"></a>

<a id="CheckboxGroup-allValues"></a>

<a id="api-436865636b626f7847726f75702e2470726f70732e64697361626c6564"></a>

<a id="CheckboxGroup-disabled"></a>

<a id="api-436865636b626f7847726f75702e2470726f70732e636c617373"></a>

<a id="CheckboxGroup-class"></a>

<a id="api-436865636b626f7847726f75702e2470726f70732e7374796c65"></a>

<a id="CheckboxGroup-style"></a>

<a id="api-436865636b626f7847726f75702e2470726f70732e72656e646572"></a>

<a id="CheckboxGroup-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultValue | `readonly string[] \| undefined` | No | [] |  |
| value | `readonly string[] \| undefined` | No | Unavailable |  |
| onValueChange | `((value: string[], details: CheckboxGroupChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| allValues | `readonly string[] \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<CheckboxGroupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<CheckboxGroupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, CheckboxGroupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-436865636b626f7847726f757044617461417474726962757465732e64697361626c6564"></a>

| Name | Description |
| --- | --- |
| data-disabled |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-436865636b626f7847726f75702e50726f7073"></a>

<a id="checkboxgroupprops"></a>

<a id="api-436865636b626f7847726f75702e50726f70732e70726f703a616c69676e"></a>

### Related exported type: CheckboxGroup.Props

Declaration: `packages/solid/build/types/checkbox-group/CheckboxGroup.d.ts:20`

#### Declaration

```typescript
CheckboxGroupProps
```

<a id="api-436865636b626f7847726f75702e50726f70732e64656661756c7456616c7565"></a>

<a id="CheckboxGroupProps-defaultValue"></a>

<a id="api-436865636b626f7847726f75702e50726f70732e76616c7565"></a>

<a id="CheckboxGroupProps-value"></a>

<a id="api-436865636b626f7847726f75702e50726f70732e6f6e56616c75654368616e6765"></a>

<a id="CheckboxGroupProps-onValueChange"></a>

<a id="api-436865636b626f7847726f75702e50726f70732e616c6c56616c756573"></a>

<a id="CheckboxGroupProps-allValues"></a>

<a id="api-436865636b626f7847726f75702e50726f70732e64697361626c6564"></a>

<a id="CheckboxGroupProps-disabled"></a>

<a id="api-436865636b626f7847726f75702e50726f70732e636c617373"></a>

<a id="CheckboxGroupProps-class"></a>

<a id="api-436865636b626f7847726f75702e50726f70732e7374796c65"></a>

<a id="CheckboxGroupProps-style"></a>

<a id="api-436865636b626f7847726f75702e50726f70732e72656e646572"></a>

<a id="CheckboxGroupProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultValue | `readonly string[] \| undefined` | No | Unavailable |  |
| value | `readonly string[] \| undefined` | No | Unavailable |  |
| onValueChange | `((value: string[], details: CheckboxGroupChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| allValues | `readonly string[] \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<CheckboxGroupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<CheckboxGroupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, CheckboxGroupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436865636b626f7847726f75702e5374617465"></a>

<a id="checkboxgroupstate"></a>

### Related exported type: CheckboxGroup.State

Declaration: `packages/solid/build/types/checkbox-group/CheckboxGroup.d.ts:21`

#### Declaration

```typescript
CheckboxGroupState
```

<a id="api-436865636b626f7847726f75702e53746174652e6469727479"></a>

<a id="CheckboxGroupState-dirty"></a>

<a id="api-436865636b626f7847726f75702e53746174652e66696c6c6564"></a>

<a id="CheckboxGroupState-filled"></a>

<a id="api-436865636b626f7847726f75702e53746174652e666f6375736564"></a>

<a id="CheckboxGroupState-focused"></a>

<a id="api-436865636b626f7847726f75702e53746174652e746f7563686564"></a>

<a id="CheckboxGroupState-touched"></a>

<a id="api-436865636b626f7847726f75702e53746174652e64697361626c6564"></a>

<a id="CheckboxGroupState-disabled"></a>

<a id="api-436865636b626f7847726f75702e53746174652e76616c6964"></a>

<a id="CheckboxGroupState-valid"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| dirty | `boolean` | Yes | Unavailable |  |
| filled | `boolean` | Yes | Unavailable |  |
| focused | `boolean` | Yes | Unavailable |  |
| touched | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |
| valid | `boolean \| null` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436865636b626f7847726f75702e4368616e67654576656e74526561736f6e"></a>

<a id="checkboxgroupchangeeventreason"></a>

### Related exported type: CheckboxGroup.ChangeEventReason

Declaration: `packages/solid/build/types/checkbox-group/CheckboxGroup.d.ts:22`

#### Declaration

```typescript
"none"
```

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436865636b626f7847726f75702e4368616e67654576656e7444657461696c73"></a>

<a id="checkboxgroupchangeeventdetails"></a>

### Related exported type: CheckboxGroup.ChangeEventDetails

Declaration: `packages/solid/build/types/checkbox-group/CheckboxGroup.d.ts:23`

#### Declaration

```typescript
{ reason: "none"; event: Event; cancel(): void; allowPropagation(): void; isCanceled: boolean; isPropagationAllowed: boolean; trigger: Element | undefined; }
```

<a id="api-436865636b626f7847726f75702e4368616e67654576656e7444657461696c732e616c6c6f7750726f7061676174696f6e"></a>

<a id="CheckboxGroupChangeEventDetails-allowPropagation"></a>

<a id="api-436865636b626f7847726f75702e4368616e67654576656e7444657461696c732e63616e63656c"></a>

<a id="CheckboxGroupChangeEventDetails-cancel"></a>

<a id="api-436865636b626f7847726f75702e4368616e67654576656e7444657461696c732e6576656e74"></a>

<a id="CheckboxGroupChangeEventDetails-event"></a>

<a id="api-436865636b626f7847726f75702e4368616e67654576656e7444657461696c732e697343616e63656c6564"></a>

<a id="CheckboxGroupChangeEventDetails-isCanceled"></a>

<a id="api-436865636b626f7847726f75702e4368616e67654576656e7444657461696c732e697350726f7061676174696f6e416c6c6f776564"></a>

<a id="CheckboxGroupChangeEventDetails-isPropagationAllowed"></a>

<a id="api-436865636b626f7847726f75702e4368616e67654576656e7444657461696c732e726561736f6e"></a>

<a id="CheckboxGroupChangeEventDetails-reason"></a>

<a id="api-436865636b626f7847726f75702e4368616e67654576656e7444657461696c732e74726967676572"></a>

<a id="CheckboxGroupChangeEventDetails-trigger"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| allowPropagation | `() => void` | Yes | Unavailable | Marks this change transaction as allowing propagation. |
| cancel | `() => void` | Yes | Unavailable | Cancels the Base UI change transaction; separate from the DOM event’s preventDefault() and preventBaseUIHandler(). |
| event | `Event` | Yes | Unavailable | Native DOM event associated with the change. Programmatic changes can use a Base UI-created Event. |
| isCanceled | `boolean` | Yes | Unavailable | Whether cancel() has been called for this change transaction. |
| isPropagationAllowed | `boolean` | Yes | Unavailable | Whether allowPropagation() has been called for this change transaction. |
| reason | `"none"` | Yes | Unavailable | Reason for the requested change; it discriminates the native event type. |
| trigger | `Element \| undefined` | Yes | Unavailable | Trigger element associated with this change, when available. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436865636b626f7847726f757050726f7073"></a>

<a id="api-436865636b626f7847726f757050726f70732e70726f703a616c69676e"></a>

### Related exported type: CheckboxGroupProps

Declaration: `packages/solid/build/types/checkbox-group/CheckboxGroup.d.ts:8`

#### Declaration

```typescript
CheckboxGroupProps
```

<a id="api-436865636b626f7847726f757050726f70732e64656661756c7456616c7565"></a>

<a id="api-436865636b626f7847726f757050726f70732e76616c7565"></a>

<a id="api-436865636b626f7847726f757050726f70732e6f6e56616c75654368616e6765"></a>

<a id="api-436865636b626f7847726f757050726f70732e616c6c56616c756573"></a>

<a id="api-436865636b626f7847726f757050726f70732e64697361626c6564"></a>

<a id="api-436865636b626f7847726f757050726f70732e636c617373"></a>

<a id="api-436865636b626f7847726f757050726f70732e7374796c65"></a>

<a id="api-436865636b626f7847726f757050726f70732e72656e646572"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| defaultValue | `readonly string[] \| undefined` | No | Unavailable |  |
| value | `readonly string[] \| undefined` | No | Unavailable |  |
| onValueChange | `((value: string[], details: CheckboxGroupChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| allValues | `readonly string[] \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<CheckboxGroupState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<CheckboxGroupState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<WithBaseUIEvent<JSX.HTMLAttributes<HTMLElement>>, CheckboxGroupState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-436865636b626f7847726f75705374617465"></a>

### Related exported type: CheckboxGroupState

Declaration: `packages/solid/build/types/checkbox-group/CheckboxGroup.d.ts:5`

#### Declaration

```typescript
CheckboxGroupState
```

<a id="api-436865636b626f7847726f757053746174652e6469727479"></a>

<a id="api-436865636b626f7847726f757053746174652e66696c6c6564"></a>

<a id="api-436865636b626f7847726f757053746174652e666f6375736564"></a>

<a id="api-436865636b626f7847726f757053746174652e746f7563686564"></a>

<a id="api-436865636b626f7847726f757053746174652e64697361626c6564"></a>

<a id="api-436865636b626f7847726f757053746174652e76616c6964"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| dirty | `boolean` | Yes | Unavailable |  |
| filled | `boolean` | Yes | Unavailable |  |
| focused | `boolean` | Yes | Unavailable |  |
| touched | `boolean` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |
| valid | `boolean \| null` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

