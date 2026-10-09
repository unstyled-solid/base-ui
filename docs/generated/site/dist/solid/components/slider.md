<a id="slider"></a>

# Slider

An easily stylable range input.

[Open mounted Solid demo: slider/hero](/solid/components/slider)

<a id="usage-guidelines"></a>

## Usage guidelines

- **Form controls must have an accessible name**: Prefer `<Slider.Label>`, or provide an `aria-label` on each `<Slider.Thumb>` when no visible label is rendered. See [Labeling a slider](#labeling-a-slider) and the [forms guide](/solid/handbook/forms).

<a id="anatomy"></a>

## Anatomy

Import the component and assemble its parts:

```tsx
import { Slider } from '@unstyled-solid/base-ui/slider';
<Slider.Root>
  <Slider.Label />
  <Slider.Value />
  <Slider.Control>
    <Slider.Track>
      <Slider.Indicator />
      <Slider.Thumb />
    </Slider.Track>
  </Slider.Control>
</Slider.Root>;
```

<a id="examples"></a>

## Examples

<a id="labeling-a-slider"></a>

### Labeling a slider

A single-thumb slider without a visible label (such as a volume control) can be labeled using `aria-label` on `<Slider.Thumb>`:

```tsx
<Slider.Root>
  <Slider.Control>
    <Slider.Track>
      <Slider.Indicator />

      <Slider.Thumb aria-label="Volume" />
    </Slider.Track>
  </Slider.Control>
</Slider.Root>;
```

A visible label can be created using `<Slider.Label>`:

```tsx
<Slider.Root>
  <Slider.Label>Volume</Slider.Label>
  <Slider.Control>
    <Slider.Track>
      <Slider.Indicator />
      <Slider.Thumb />
    </Slider.Track>
  </Slider.Control>
</Slider.Root>;
```

For a multi-thumb range slider with a visible label, add `aria-label` on each `<Slider.Thumb>` to distinguish them:

```tsx
<Slider.Root defaultValue={[25, 75]}>
  <Slider.Label>Price range</Slider.Label>
  <Slider.Control>
    <Slider.Track>
      <Slider.Indicator />

      <Slider.Thumb index={0} aria-label="Minimum price" />
      <Slider.Thumb index={1} aria-label="Maximum price" />
    </Slider.Track>
  </Slider.Control>
</Slider.Root>;
```

<a id="range-slider"></a>

### Range slider

To create a range slider:

1. Pass an array of values and place a `<Slider.Thumb>` for each value in the array
2. Additionally for server-side rendering, specify a numeric `index` for each thumb that corresponds to the index of its value in the value array

Thumbs can be configured to behave differently when they collide during pointer interactions using the `thumbCollisionBehavior` prop on `<Slider.Root>`.

[Open mounted Solid demo: slider/range-slider](/solid/components/slider)

<a id="steps"></a>

### Steps

Use the `step` prop to snap the value to multiples of a given increment, and `largeStep` to control the increment when using Page Up/Page Down or Shift + Arrow Up/Arrow Down.

[Open mounted Solid demo: slider/steps](/solid/components/slider)

<a id="marks"></a>

### Marks

Render your own tick marks, positioning each mark along the track as a percentage of the value range.

[Open mounted Solid demo: slider/marks](/solid/components/slider)

Marks are independent of the value's granularity—pair them with the [`step`](#steps) prop to snap the thumb to each mark.

<a id="thumb-alignment"></a>

### Thumb alignment

Set `thumbAlignment="edge"` to inset the thumb such that its edge aligns with the edge of the control when the value is at `min` or `max`, without overflowing the control like the default `"center"` alignment.

A client-only alternative `thumbAlignment="edge-client-only"` can be used to reduce bundle size but only renders after hydration.

[Open mounted Solid demo: slider/edge-alignment](/solid/components/slider)

<a id="vertical"></a>

### Vertical

Set `orientation="vertical"` on `<Slider.Root>` to build a vertical slider.

[Open mounted Solid demo: slider/vertical](/solid/components/slider)

<a id="form-integration"></a>

### Form integration

To use a slider in a form, pass the slider `name` to `<Slider.Root>`:

```tsx
<Form>
  <Slider.Root name="volume">
    <Slider.Label>Volume</Slider.Label>
    <Slider.Control>
      <Slider.Track>
        <Slider.Indicator />
        <Slider.Thumb />
      </Slider.Track>
    </Slider.Control>
  </Slider.Root>
</Form>;
```

For grouped multi-thumb range sliders in forms, [Fieldset](/solid/components/fieldset) can provide the shared visible label while each thumb keeps its own `aria-label`:

```tsx
<Field.Root>
  <Fieldset.Root
    render={(renderProps) => (
      <Slider.Root {...renderProps} defaultValue={[25, 75]} />
    )}
  >
    <Fieldset.Legend>Price range</Fieldset.Legend>

    <Slider.Control>
      <Slider.Track>
        <Slider.Indicator />

        <Slider.Thumb index={0} aria-label="Minimum price" />
        <Slider.Thumb index={1} aria-label="Maximum price" />
      </Slider.Track>
    </Slider.Control>
  </Fieldset.Root>
</Field.Root>;
```

<a id="api-reference"></a>

## API reference

<a id="root"></a>

### Root

<a id="api-536c696465722e526f6f74"></a>

<a id="sliderroot"></a>

<a id="api-536c696465722e526f6f742e2470726f70732e70726f703a616c69676e"></a>

### Slider.Root

Groups the slider parts. Values are normalized without mutating consumer arrays.

Declaration: `packages/solid/build/types/slider/root/SliderRoot.d.ts:6`

#### Declaration

```typescript
<Value extends number | readonly number[] = number | readonly number[]>(props: SliderRootProps<Value>) => JSX.Element
```

<a id="api-536c696465722e526f6f742e2470726f70732e6e616d65"></a>

<a id="SliderRoot-name"></a>

<a id="api-536c696465722e526f6f742e2470726f70732e64656661756c7456616c7565"></a>

<a id="SliderRoot-defaultValue"></a>

<a id="api-536c696465722e526f6f742e2470726f70732e76616c7565"></a>

<a id="SliderRoot-value"></a>

<a id="api-536c696465722e526f6f742e2470726f70732e6f6e56616c75654368616e6765"></a>

<a id="SliderRoot-onValueChange"></a>

<a id="api-536c696465722e526f6f742e2470726f70732e6f6e56616c7565436f6d6d6974746564"></a>

<a id="SliderRoot-onValueCommitted"></a>

<a id="api-536c696465722e526f6f742e2470726f70732e666f726d"></a>

<a id="SliderRoot-form"></a>

<a id="api-536c696465722e526f6f742e2470726f70732e6c6f63616c65"></a>

<a id="SliderRoot-locale"></a>

<a id="api-536c696465722e526f6f742e2470726f70732e7468756d62416c69676e6d656e74"></a>

<a id="SliderRoot-thumbAlignment"></a>

<a id="api-536c696465722e526f6f742e2470726f70732e7468756d62436f6c6c6973696f6e4265686176696f72"></a>

<a id="SliderRoot-thumbCollisionBehavior"></a>

<a id="api-536c696465722e526f6f742e2470726f70732e73746570"></a>

<a id="SliderRoot-step"></a>

<a id="api-536c696465722e526f6f742e2470726f70732e6c6172676553746570"></a>

<a id="SliderRoot-largeStep"></a>

<a id="api-536c696465722e526f6f742e2470726f70732e6d696e53746570734265747765656e56616c756573"></a>

<a id="SliderRoot-minStepsBetweenValues"></a>

<a id="api-536c696465722e526f6f742e2470726f70732e6d696e"></a>

<a id="SliderRoot-min"></a>

<a id="api-536c696465722e526f6f742e2470726f70732e6d6178"></a>

<a id="SliderRoot-max"></a>

<a id="api-536c696465722e526f6f742e2470726f70732e666f726d6174"></a>

<a id="SliderRoot-format"></a>

<a id="api-536c696465722e526f6f742e2470726f70732e64697361626c6564"></a>

<a id="SliderRoot-disabled"></a>

<a id="api-536c696465722e526f6f742e2470726f70732e6f7269656e746174696f6e"></a>

<a id="SliderRoot-orientation"></a>

<a id="api-536c696465722e526f6f742e2470726f70732e636c617373"></a>

<a id="SliderRoot-class"></a>

<a id="api-536c696465722e526f6f742e2470726f70732e7374796c65"></a>

<a id="SliderRoot-style"></a>

<a id="api-536c696465722e526f6f742e2470726f70732e72656e646572"></a>

<a id="SliderRoot-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| name | `string \| undefined` | No | Unavailable |  |
| defaultValue | `Value \| undefined` | No | Unavailable |  |
| value | `Value \| undefined` | No | Unavailable |  |
| onValueChange | `((value: Value extends number ? number : Value, details: SliderRootChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| onValueCommitted | `((value: Value extends number ? number : Value, details: SliderRootCommitEventDetails) => void) \| undefined` | No | Unavailable |  |
| form | `string \| undefined` | No | Unavailable |  |
| locale | `Intl.LocalesArgument` | No | Unavailable |  |
| thumbAlignment | `"center" \| "edge" \| "edge-client-only" \| undefined` | No | 'center' |  |
| thumbCollisionBehavior | `"push" \| "none" \| "swap" \| undefined` | No | 'push' |  |
| step | `number \| undefined` | No | 1 |  |
| largeStep | `number \| undefined` | No | 10 |  |
| minStepsBetweenValues | `number \| undefined` | No | 0 |  |
| min | `number \| undefined` | No | 0 |  |
| max | `number \| undefined` | No | 100 |  |
| format | `Intl.NumberFormatOptions \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| orientation | `"horizontal" \| "vertical" \| undefined` | No | 'horizontal' |  |
| class | `JSX.ClassValue \| ((state: Readonly<SliderRootState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SliderRootState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLElement>, SliderRootState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-536c69646572526f6f7444617461417474726962757465732e6472616767696e67"></a>

<a id="api-536c69646572526f6f7444617461417474726962757465732e6f7269656e746174696f6e"></a>

<a id="api-536c69646572526f6f7444617461417474726962757465732e64697361626c6564"></a>

<a id="api-536c69646572526f6f7444617461417474726962757465732e76616c6964"></a>

<a id="api-536c69646572526f6f7444617461417474726962757465732e696e76616c6964"></a>

<a id="api-536c69646572526f6f7444617461417474726962757465732e6469727479"></a>

<a id="api-536c69646572526f6f7444617461417474726962757465732e746f7563686564"></a>

<a id="api-536c69646572526f6f7444617461417474726962757465732e666f6375736564"></a>

| Name | Description |
| --- | --- |
| data-dragging |  |
| data-orientation |  |
| data-disabled |  |
| data-valid |  |
| data-invalid |  |
| data-dirty |  |
| data-touched |  |
| data-focused |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-536c696465722e526f6f742e50726f7073"></a>

<a id="sliderrootprops"></a>

<a id="api-536c696465722e526f6f742e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Slider.Root.Props

Declaration: `packages/solid/build/types/slider/root/SliderRoot.d.ts:45`

#### Declaration

```typescript
Props<Value>
```

<a id="api-536c696465722e526f6f742e50726f70732e6e616d65"></a>

<a id="SliderRootProps-name"></a>

<a id="api-536c696465722e526f6f742e50726f70732e64656661756c7456616c7565"></a>

<a id="SliderRootProps-defaultValue"></a>

<a id="api-536c696465722e526f6f742e50726f70732e76616c7565"></a>

<a id="SliderRootProps-value"></a>

<a id="api-536c696465722e526f6f742e50726f70732e6f6e56616c75654368616e6765"></a>

<a id="SliderRootProps-onValueChange"></a>

<a id="api-536c696465722e526f6f742e50726f70732e6f6e56616c7565436f6d6d6974746564"></a>

<a id="SliderRootProps-onValueCommitted"></a>

<a id="api-536c696465722e526f6f742e50726f70732e666f726d"></a>

<a id="SliderRootProps-form"></a>

<a id="api-536c696465722e526f6f742e50726f70732e6c6f63616c65"></a>

<a id="SliderRootProps-locale"></a>

<a id="api-536c696465722e526f6f742e50726f70732e7468756d62416c69676e6d656e74"></a>

<a id="SliderRootProps-thumbAlignment"></a>

<a id="api-536c696465722e526f6f742e50726f70732e7468756d62436f6c6c6973696f6e4265686176696f72"></a>

<a id="SliderRootProps-thumbCollisionBehavior"></a>

<a id="api-536c696465722e526f6f742e50726f70732e73746570"></a>

<a id="SliderRootProps-step"></a>

<a id="api-536c696465722e526f6f742e50726f70732e6c6172676553746570"></a>

<a id="SliderRootProps-largeStep"></a>

<a id="api-536c696465722e526f6f742e50726f70732e6d696e53746570734265747765656e56616c756573"></a>

<a id="SliderRootProps-minStepsBetweenValues"></a>

<a id="api-536c696465722e526f6f742e50726f70732e6d696e"></a>

<a id="SliderRootProps-min"></a>

<a id="api-536c696465722e526f6f742e50726f70732e6d6178"></a>

<a id="SliderRootProps-max"></a>

<a id="api-536c696465722e526f6f742e50726f70732e666f726d6174"></a>

<a id="SliderRootProps-format"></a>

<a id="api-536c696465722e526f6f742e50726f70732e64697361626c6564"></a>

<a id="SliderRootProps-disabled"></a>

<a id="api-536c696465722e526f6f742e50726f70732e6f7269656e746174696f6e"></a>

<a id="SliderRootProps-orientation"></a>

<a id="api-536c696465722e526f6f742e50726f70732e636c617373"></a>

<a id="SliderRootProps-class"></a>

<a id="api-536c696465722e526f6f742e50726f70732e7374796c65"></a>

<a id="SliderRootProps-style"></a>

<a id="api-536c696465722e526f6f742e50726f70732e72656e646572"></a>

<a id="SliderRootProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| name | `string \| undefined` | No | Unavailable |  |
| defaultValue | `Value \| undefined` | No | Unavailable |  |
| value | `Value \| undefined` | No | Unavailable |  |
| onValueChange | `((value: Value extends number ? number : Value, details: SliderRootChangeEventDetails) => void) \| undefined` | No | Unavailable |  |
| onValueCommitted | `((value: Value extends number ? number : Value, details: SliderRootCommitEventDetails) => void) \| undefined` | No | Unavailable |  |
| form | `string \| undefined` | No | Unavailable |  |
| locale | `Intl.LocalesArgument` | No | Unavailable |  |
| thumbAlignment | `"center" \| "edge" \| "edge-client-only" \| undefined` | No | Unavailable |  |
| thumbCollisionBehavior | `"push" \| "none" \| "swap" \| undefined` | No | Unavailable |  |
| step | `number \| undefined` | No | Unavailable |  |
| largeStep | `number \| undefined` | No | Unavailable |  |
| minStepsBetweenValues | `number \| undefined` | No | Unavailable |  |
| min | `number \| undefined` | No | Unavailable |  |
| max | `number \| undefined` | No | Unavailable |  |
| format | `Intl.NumberFormatOptions \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| orientation | `"horizontal" \| "vertical" \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<SliderRootState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SliderRootState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLElement>, SliderRootState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-536c696465722e526f6f742e5374617465"></a>

<a id="sliderrootstate"></a>

### Related exported type: Slider.Root.State

Declaration: `packages/solid/build/types/slider/root/SliderRoot.d.ts:44`

#### Declaration

```typescript
SliderRootState
```

<a id="api-536c696465722e526f6f742e53746174652e6163746976655468756d62496e646578"></a>

<a id="SliderRootState-activeThumbIndex"></a>

<a id="api-536c696465722e526f6f742e53746174652e6469727479"></a>

<a id="SliderRootState-dirty"></a>

<a id="api-536c696465722e526f6f742e53746174652e6472616767696e67"></a>

<a id="SliderRootState-dragging"></a>

<a id="api-536c696465722e526f6f742e53746174652e66696c6c6564"></a>

<a id="SliderRootState-filled"></a>

<a id="api-536c696465722e526f6f742e53746174652e666f6375736564"></a>

<a id="SliderRootState-focused"></a>

<a id="api-536c696465722e526f6f742e53746174652e746f7563686564"></a>

<a id="SliderRootState-touched"></a>

<a id="api-536c696465722e526f6f742e53746174652e76616c756573"></a>

<a id="SliderRootState-values"></a>

<a id="api-536c696465722e526f6f742e53746174652e73746570"></a>

<a id="SliderRootState-step"></a>

<a id="api-536c696465722e526f6f742e53746174652e6d696e53746570734265747765656e56616c756573"></a>

<a id="SliderRootState-minStepsBetweenValues"></a>

<a id="api-536c696465722e526f6f742e53746174652e6d696e"></a>

<a id="SliderRootState-min"></a>

<a id="api-536c696465722e526f6f742e53746174652e6d6178"></a>

<a id="SliderRootState-max"></a>

<a id="api-536c696465722e526f6f742e53746174652e64697361626c6564"></a>

<a id="SliderRootState-disabled"></a>

<a id="api-536c696465722e526f6f742e53746174652e76616c6964"></a>

<a id="SliderRootState-valid"></a>

<a id="api-536c696465722e526f6f742e53746174652e6f7269656e746174696f6e"></a>

<a id="SliderRootState-orientation"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| activeThumbIndex | `number` | Yes | Unavailable |  |
| dirty | `boolean` | Yes | Unavailable |  |
| dragging | `boolean` | Yes | Unavailable |  |
| filled | `boolean` | Yes | Unavailable |  |
| focused | `boolean` | Yes | Unavailable |  |
| touched | `boolean` | Yes | Unavailable |  |
| values | `readonly number[]` | Yes | Unavailable |  |
| step | `number` | Yes | Unavailable |  |
| minStepsBetweenValues | `number` | Yes | Unavailable |  |
| min | `number` | Yes | Unavailable |  |
| max | `number` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |
| valid | `boolean \| null` | Yes | Unavailable |  |
| orientation | `"horizontal" \| "vertical"` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-536c696465722e526f6f742e4368616e67654576656e74526561736f6e"></a>

<a id="sliderrootchangeeventreason"></a>

### Related exported type: Slider.Root.ChangeEventReason

Declaration: `packages/solid/build/types/slider/root/SliderRoot.d.ts:46`

#### Declaration

```typescript
SliderRootChangeEventReason
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-536c696465722e526f6f742e4368616e67654576656e7444657461696c73"></a>

<a id="sliderrootchangeeventdetails"></a>

### Related exported type: Slider.Root.ChangeEventDetails

Declaration: `packages/solid/build/types/slider/root/SliderRoot.d.ts:47`

#### Declaration

```typescript
SliderRootChangeEventDetails
```

<a id="api-536c696465722e526f6f742e4368616e67654576656e7444657461696c732e6163746976655468756d62496e646578"></a>

<a id="SliderRootChangeEventDetails-activeThumbIndex"></a>

<a id="api-536c696465722e526f6f742e4368616e67654576656e7444657461696c732e616c6c6f7750726f7061676174696f6e"></a>

<a id="SliderRootChangeEventDetails-allowPropagation"></a>

<a id="api-536c696465722e526f6f742e4368616e67654576656e7444657461696c732e63616e63656c"></a>

<a id="SliderRootChangeEventDetails-cancel"></a>

<a id="api-536c696465722e526f6f742e4368616e67654576656e7444657461696c732e6576656e74"></a>

<a id="SliderRootChangeEventDetails-event"></a>

<a id="api-536c696465722e526f6f742e4368616e67654576656e7444657461696c732e697343616e63656c6564"></a>

<a id="SliderRootChangeEventDetails-isCanceled"></a>

<a id="api-536c696465722e526f6f742e4368616e67654576656e7444657461696c732e697350726f7061676174696f6e416c6c6f776564"></a>

<a id="SliderRootChangeEventDetails-isPropagationAllowed"></a>

<a id="api-536c696465722e526f6f742e4368616e67654576656e7444657461696c732e726561736f6e"></a>

<a id="SliderRootChangeEventDetails-reason"></a>

<a id="api-536c696465722e526f6f742e4368616e67654576656e7444657461696c732e74726967676572"></a>

<a id="SliderRootChangeEventDetails-trigger"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| activeThumbIndex | `number` | Yes | Unavailable |  |
| allowPropagation | `() => void` | Yes | Unavailable | Marks this change transaction as allowing propagation. |
| cancel | `() => void` | Yes | Unavailable | Cancels the Base UI change transaction; separate from the DOM event’s preventDefault() and preventBaseUIHandler(). |
| event | `PointerEvent \| MouseEvent \| Event \| InputEvent \| KeyboardEvent \| TouchEvent` | Yes | Unavailable | Native DOM event associated with the change. Programmatic changes can use a Base UI-created Event. |
| isCanceled | `boolean` | Yes | Unavailable | Whether cancel() has been called for this change transaction. |
| isPropagationAllowed | `boolean` | Yes | Unavailable | Whether allowPropagation() has been called for this change transaction. |
| reason | `"none" \| "drag" \| "track-press" \| "input-change" \| "keyboard"` | Yes | Unavailable | Reason for the requested change; it discriminates the native event type. |
| trigger | `Element \| undefined` | Yes | Unavailable | Trigger element associated with this change, when available. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-536c696465722e526f6f742e436f6d6d69744576656e74526561736f6e"></a>

<a id="sliderrootcommiteventreason"></a>

### Related exported type: Slider.Root.CommitEventReason

Declaration: `packages/solid/build/types/slider/root/SliderRoot.d.ts:48`

#### Declaration

```typescript
SliderRootChangeEventReason
```

Inherited DOM attributes: `__@iterator@106`, `anchor`, `at`, `big`, `blink`, `bold`, `charAt`, `charCodeAt`, `codePointAt`, `concat`, `endsWith`, `fixed`, `fontcolor`, `fontsize`, `includes`, `indexOf`, `isWellFormed`, `italics`, `lastIndexOf`, `length`, `link`, `localeCompare`, `match`, `matchAll`, `normalize`, `padEnd`, `padStart`, `repeat`, `replace`, `replaceAll`, `search`, `slice`, `small`, `split`, `startsWith`, `strike`, `sub`, `substr`, `substring`, `sup`, `toLocaleLowerCase`, `toLocaleUpperCase`, `toLowerCase`, `toString`, `toUpperCase`, `toWellFormed`, `trim`, `trimEnd`, `trimLeft`, `trimRight`, `trimStart`, `valueOf`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-536c696465722e526f6f742e436f6d6d69744576656e7444657461696c73"></a>

<a id="sliderrootcommiteventdetails"></a>

### Related exported type: Slider.Root.CommitEventDetails

Declaration: `packages/solid/build/types/slider/root/SliderRoot.d.ts:49`

#### Declaration

```typescript
SliderRootCommitEventDetails
```

<a id="api-536c696465722e526f6f742e436f6d6d69744576656e7444657461696c732e6576656e74"></a>

<a id="SliderRootCommitEventDetails-event"></a>

<a id="api-536c696465722e526f6f742e436f6d6d69744576656e7444657461696c732e726561736f6e"></a>

<a id="SliderRootCommitEventDetails-reason"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| event | `PointerEvent \| MouseEvent \| Event \| InputEvent \| KeyboardEvent \| TouchEvent` | Yes | Unavailable | Native DOM event associated with the change. Programmatic changes can use a Base UI-created Event. |
| reason | `"none" \| "drag" \| "track-press" \| "input-change" \| "keyboard"` | Yes | Unavailable | Reason for the requested change; it discriminates the native event type. |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="label"></a>

### Label

<a id="api-536c696465722e4c6162656c"></a>

<a id="sliderlabel"></a>

<a id="api-536c696465722e4c6162656c2e2470726f70732e70726f703a616c69676e"></a>

### Slider.Label

Declaration: `packages/solid/build/types/slider/label/SliderLabel.d.ts:4`

#### Declaration

```typescript
(props: SliderLabelProps) => JSX.Element
```

<a id="api-536c696465722e4c6162656c2e2470726f70732e636c617373"></a>

<a id="SliderLabel-class"></a>

<a id="api-536c696465722e4c6162656c2e2470726f70732e7374796c65"></a>

<a id="SliderLabel-style"></a>

<a id="api-536c696465722e4c6162656c2e2470726f70732e72656e646572"></a>

<a id="SliderLabel-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<SliderRootState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SliderRootState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLElement>, SliderRootState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-536c696465722e4c6162656c2e50726f7073"></a>

<a id="sliderlabelprops"></a>

<a id="api-536c696465722e4c6162656c2e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Slider.Label.Props

Declaration: `packages/solid/build/types/slider/label/SliderLabel.d.ts:10`

#### Declaration

```typescript
SliderLabelProps
```

<a id="api-536c696465722e4c6162656c2e50726f70732e636c617373"></a>

<a id="SliderLabelProps-class"></a>

<a id="api-536c696465722e4c6162656c2e50726f70732e7374796c65"></a>

<a id="SliderLabelProps-style"></a>

<a id="api-536c696465722e4c6162656c2e50726f70732e72656e646572"></a>

<a id="SliderLabelProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<SliderRootState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SliderRootState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLElement>, SliderRootState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-536c696465722e4c6162656c2e5374617465"></a>

<a id="sliderlabelstate"></a>

### Related exported type: Slider.Label.State

Declaration: `packages/solid/build/types/slider/label/SliderLabel.d.ts:9`

#### Declaration

```typescript
SliderRootState
```

<a id="api-536c696465722e4c6162656c2e53746174652e6163746976655468756d62496e646578"></a>

<a id="SliderLabelState-activeThumbIndex"></a>

<a id="api-536c696465722e4c6162656c2e53746174652e6469727479"></a>

<a id="SliderLabelState-dirty"></a>

<a id="api-536c696465722e4c6162656c2e53746174652e6472616767696e67"></a>

<a id="SliderLabelState-dragging"></a>

<a id="api-536c696465722e4c6162656c2e53746174652e66696c6c6564"></a>

<a id="SliderLabelState-filled"></a>

<a id="api-536c696465722e4c6162656c2e53746174652e666f6375736564"></a>

<a id="SliderLabelState-focused"></a>

<a id="api-536c696465722e4c6162656c2e53746174652e746f7563686564"></a>

<a id="SliderLabelState-touched"></a>

<a id="api-536c696465722e4c6162656c2e53746174652e76616c756573"></a>

<a id="SliderLabelState-values"></a>

<a id="api-536c696465722e4c6162656c2e53746174652e73746570"></a>

<a id="SliderLabelState-step"></a>

<a id="api-536c696465722e4c6162656c2e53746174652e6d696e53746570734265747765656e56616c756573"></a>

<a id="SliderLabelState-minStepsBetweenValues"></a>

<a id="api-536c696465722e4c6162656c2e53746174652e6d696e"></a>

<a id="SliderLabelState-min"></a>

<a id="api-536c696465722e4c6162656c2e53746174652e6d6178"></a>

<a id="SliderLabelState-max"></a>

<a id="api-536c696465722e4c6162656c2e53746174652e64697361626c6564"></a>

<a id="SliderLabelState-disabled"></a>

<a id="api-536c696465722e4c6162656c2e53746174652e76616c6964"></a>

<a id="SliderLabelState-valid"></a>

<a id="api-536c696465722e4c6162656c2e53746174652e6f7269656e746174696f6e"></a>

<a id="SliderLabelState-orientation"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| activeThumbIndex | `number` | Yes | Unavailable |  |
| dirty | `boolean` | Yes | Unavailable |  |
| dragging | `boolean` | Yes | Unavailable |  |
| filled | `boolean` | Yes | Unavailable |  |
| focused | `boolean` | Yes | Unavailable |  |
| touched | `boolean` | Yes | Unavailable |  |
| values | `readonly number[]` | Yes | Unavailable |  |
| step | `number` | Yes | Unavailable |  |
| minStepsBetweenValues | `number` | Yes | Unavailable |  |
| min | `number` | Yes | Unavailable |  |
| max | `number` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |
| valid | `boolean \| null` | Yes | Unavailable |  |
| orientation | `"horizontal" \| "vertical"` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="value"></a>

### Value

<a id="api-536c696465722e56616c7565"></a>

<a id="slidervalue"></a>

<a id="api-536c696465722e56616c75652e2470726f70732e70726f703a64656661756c7456616c7565"></a>

<a id="api-536c696465722e56616c75652e2470726f70732e70726f703a6e616d65"></a>

<a id="api-536c696465722e56616c75652e2470726f70732e70726f703a76616c7565"></a>

### Slider.Value

Declaration: `packages/solid/build/types/slider/value/SliderValue.d.ts:4`

#### Declaration

```typescript
(props: SliderValueProps) => JSX.Element
```

<a id="api-536c696465722e56616c75652e2470726f70732e6368696c6472656e"></a>

<a id="SliderValue-children"></a>

<a id="api-536c696465722e56616c75652e2470726f70732e636c617373"></a>

<a id="SliderValue-class"></a>

<a id="api-536c696465722e56616c75652e2470726f70732e7374796c65"></a>

<a id="SliderValue-style"></a>

<a id="api-536c696465722e56616c75652e2470726f70732e72656e646572"></a>

<a id="SliderValue-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | `((formattedValues: readonly string[], values: readonly number[]) => JSX.Element) \| null \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<SliderValueState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SliderValueState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLElement>, SliderValueState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `for`, `form`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:defaultValue`, `prop:name`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-536c6964657256616c756544617461417474726962757465732e6472616767696e67"></a>

<a id="api-536c6964657256616c756544617461417474726962757465732e6f7269656e746174696f6e"></a>

<a id="api-536c6964657256616c756544617461417474726962757465732e64697361626c6564"></a>

<a id="api-536c6964657256616c756544617461417474726962757465732e76616c6964"></a>

<a id="api-536c6964657256616c756544617461417474726962757465732e696e76616c6964"></a>

<a id="api-536c6964657256616c756544617461417474726962757465732e6469727479"></a>

<a id="api-536c6964657256616c756544617461417474726962757465732e746f7563686564"></a>

<a id="api-536c6964657256616c756544617461417474726962757465732e666f6375736564"></a>

| Name | Description |
| --- | --- |
| data-dragging |  |
| data-orientation |  |
| data-disabled |  |
| data-valid |  |
| data-invalid |  |
| data-dirty |  |
| data-touched |  |
| data-focused |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-536c696465722e56616c75652e50726f7073"></a>

<a id="slidervalueprops"></a>

<a id="api-536c696465722e56616c75652e50726f70732e70726f703a64656661756c7456616c7565"></a>

<a id="api-536c696465722e56616c75652e50726f70732e70726f703a6e616d65"></a>

<a id="api-536c696465722e56616c75652e50726f70732e70726f703a76616c7565"></a>

### Related exported type: Slider.Value.Props

Declaration: `packages/solid/build/types/slider/value/SliderValue.d.ts:12`

#### Declaration

```typescript
SliderValueProps
```

<a id="api-536c696465722e56616c75652e50726f70732e6368696c6472656e"></a>

<a id="SliderValueProps-children"></a>

<a id="api-536c696465722e56616c75652e50726f70732e636c617373"></a>

<a id="SliderValueProps-class"></a>

<a id="api-536c696465722e56616c75652e50726f70732e7374796c65"></a>

<a id="SliderValueProps-style"></a>

<a id="api-536c696465722e56616c75652e50726f70732e72656e646572"></a>

<a id="SliderValueProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | `((formattedValues: readonly string[], values: readonly number[]) => JSX.Element) \| null \| undefined` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<SliderValueState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SliderValueState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLElement>, SliderValueState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `for`, `form`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `name`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:defaultValue`, `prop:name`, `prop:value`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-536c696465722e56616c75652e5374617465"></a>

<a id="slidervaluestate"></a>

### Related exported type: Slider.Value.State

Declaration: `packages/solid/build/types/slider/value/SliderValue.d.ts:11`

#### Declaration

```typescript
SliderValueState
```

<a id="api-536c696465722e56616c75652e53746174652e6163746976655468756d62496e646578"></a>

<a id="SliderValueState-activeThumbIndex"></a>

<a id="api-536c696465722e56616c75652e53746174652e6469727479"></a>

<a id="SliderValueState-dirty"></a>

<a id="api-536c696465722e56616c75652e53746174652e6472616767696e67"></a>

<a id="SliderValueState-dragging"></a>

<a id="api-536c696465722e56616c75652e53746174652e66696c6c6564"></a>

<a id="SliderValueState-filled"></a>

<a id="api-536c696465722e56616c75652e53746174652e666f6375736564"></a>

<a id="SliderValueState-focused"></a>

<a id="api-536c696465722e56616c75652e53746174652e746f7563686564"></a>

<a id="SliderValueState-touched"></a>

<a id="api-536c696465722e56616c75652e53746174652e76616c756573"></a>

<a id="SliderValueState-values"></a>

<a id="api-536c696465722e56616c75652e53746174652e73746570"></a>

<a id="SliderValueState-step"></a>

<a id="api-536c696465722e56616c75652e53746174652e6d696e53746570734265747765656e56616c756573"></a>

<a id="SliderValueState-minStepsBetweenValues"></a>

<a id="api-536c696465722e56616c75652e53746174652e6d696e"></a>

<a id="SliderValueState-min"></a>

<a id="api-536c696465722e56616c75652e53746174652e6d6178"></a>

<a id="SliderValueState-max"></a>

<a id="api-536c696465722e56616c75652e53746174652e64697361626c6564"></a>

<a id="SliderValueState-disabled"></a>

<a id="api-536c696465722e56616c75652e53746174652e76616c6964"></a>

<a id="SliderValueState-valid"></a>

<a id="api-536c696465722e56616c75652e53746174652e6f7269656e746174696f6e"></a>

<a id="SliderValueState-orientation"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| activeThumbIndex | `number` | Yes | Unavailable |  |
| dirty | `boolean` | Yes | Unavailable |  |
| dragging | `boolean` | Yes | Unavailable |  |
| filled | `boolean` | Yes | Unavailable |  |
| focused | `boolean` | Yes | Unavailable |  |
| touched | `boolean` | Yes | Unavailable |  |
| values | `readonly number[]` | Yes | Unavailable |  |
| step | `number` | Yes | Unavailable |  |
| minStepsBetweenValues | `number` | Yes | Unavailable |  |
| min | `number` | Yes | Unavailable |  |
| max | `number` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |
| valid | `boolean \| null` | Yes | Unavailable |  |
| orientation | `"horizontal" \| "vertical"` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="control"></a>

### Control

<a id="api-536c696465722e436f6e74726f6c"></a>

<a id="slidercontrol"></a>

<a id="api-536c696465722e436f6e74726f6c2e2470726f70732e70726f703a616c69676e"></a>

### Slider.Control

Declaration: `packages/solid/build/types/slider/control/SliderControl.d.ts:4`

#### Declaration

```typescript
(props: SliderControlProps) => JSX.Element
```

<a id="api-536c696465722e436f6e74726f6c2e2470726f70732e636c617373"></a>

<a id="SliderControl-class"></a>

<a id="api-536c696465722e436f6e74726f6c2e2470726f70732e7374796c65"></a>

<a id="SliderControl-style"></a>

<a id="api-536c696465722e436f6e74726f6c2e2470726f70732e72656e646572"></a>

<a id="SliderControl-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<SliderControlState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SliderControlState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLElement>, SliderControlState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-536c69646572436f6e74726f6c44617461417474726962757465732e6472616767696e67"></a>

<a id="api-536c69646572436f6e74726f6c44617461417474726962757465732e6f7269656e746174696f6e"></a>

<a id="api-536c69646572436f6e74726f6c44617461417474726962757465732e64697361626c6564"></a>

<a id="api-536c69646572436f6e74726f6c44617461417474726962757465732e76616c6964"></a>

<a id="api-536c69646572436f6e74726f6c44617461417474726962757465732e696e76616c6964"></a>

<a id="api-536c69646572436f6e74726f6c44617461417474726962757465732e6469727479"></a>

<a id="api-536c69646572436f6e74726f6c44617461417474726962757465732e746f7563686564"></a>

<a id="api-536c69646572436f6e74726f6c44617461417474726962757465732e666f6375736564"></a>

| Name | Description |
| --- | --- |
| data-dragging |  |
| data-orientation |  |
| data-disabled |  |
| data-valid |  |
| data-invalid |  |
| data-dirty |  |
| data-touched |  |
| data-focused |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-536c696465722e436f6e74726f6c2e50726f7073"></a>

<a id="slidercontrolprops"></a>

<a id="api-536c696465722e436f6e74726f6c2e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Slider.Control.Props

Declaration: `packages/solid/build/types/slider/control/SliderControl.d.ts:11`

#### Declaration

```typescript
SliderControlProps
```

<a id="api-536c696465722e436f6e74726f6c2e50726f70732e636c617373"></a>

<a id="SliderControlProps-class"></a>

<a id="api-536c696465722e436f6e74726f6c2e50726f70732e7374796c65"></a>

<a id="SliderControlProps-style"></a>

<a id="api-536c696465722e436f6e74726f6c2e50726f70732e72656e646572"></a>

<a id="SliderControlProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<SliderControlState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SliderControlState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLElement>, SliderControlState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-536c696465722e436f6e74726f6c2e5374617465"></a>

<a id="slidercontrolstate"></a>

### Related exported type: Slider.Control.State

Declaration: `packages/solid/build/types/slider/control/SliderControl.d.ts:10`

#### Declaration

```typescript
SliderControlState
```

<a id="api-536c696465722e436f6e74726f6c2e53746174652e6163746976655468756d62496e646578"></a>

<a id="SliderControlState-activeThumbIndex"></a>

<a id="api-536c696465722e436f6e74726f6c2e53746174652e6469727479"></a>

<a id="SliderControlState-dirty"></a>

<a id="api-536c696465722e436f6e74726f6c2e53746174652e6472616767696e67"></a>

<a id="SliderControlState-dragging"></a>

<a id="api-536c696465722e436f6e74726f6c2e53746174652e66696c6c6564"></a>

<a id="SliderControlState-filled"></a>

<a id="api-536c696465722e436f6e74726f6c2e53746174652e666f6375736564"></a>

<a id="SliderControlState-focused"></a>

<a id="api-536c696465722e436f6e74726f6c2e53746174652e746f7563686564"></a>

<a id="SliderControlState-touched"></a>

<a id="api-536c696465722e436f6e74726f6c2e53746174652e76616c756573"></a>

<a id="SliderControlState-values"></a>

<a id="api-536c696465722e436f6e74726f6c2e53746174652e73746570"></a>

<a id="SliderControlState-step"></a>

<a id="api-536c696465722e436f6e74726f6c2e53746174652e6d696e53746570734265747765656e56616c756573"></a>

<a id="SliderControlState-minStepsBetweenValues"></a>

<a id="api-536c696465722e436f6e74726f6c2e53746174652e6d696e"></a>

<a id="SliderControlState-min"></a>

<a id="api-536c696465722e436f6e74726f6c2e53746174652e6d6178"></a>

<a id="SliderControlState-max"></a>

<a id="api-536c696465722e436f6e74726f6c2e53746174652e64697361626c6564"></a>

<a id="SliderControlState-disabled"></a>

<a id="api-536c696465722e436f6e74726f6c2e53746174652e76616c6964"></a>

<a id="SliderControlState-valid"></a>

<a id="api-536c696465722e436f6e74726f6c2e53746174652e6f7269656e746174696f6e"></a>

<a id="SliderControlState-orientation"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| activeThumbIndex | `number` | Yes | Unavailable |  |
| dirty | `boolean` | Yes | Unavailable |  |
| dragging | `boolean` | Yes | Unavailable |  |
| filled | `boolean` | Yes | Unavailable |  |
| focused | `boolean` | Yes | Unavailable |  |
| touched | `boolean` | Yes | Unavailable |  |
| values | `readonly number[]` | Yes | Unavailable |  |
| step | `number` | Yes | Unavailable |  |
| minStepsBetweenValues | `number` | Yes | Unavailable |  |
| min | `number` | Yes | Unavailable |  |
| max | `number` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |
| valid | `boolean \| null` | Yes | Unavailable |  |
| orientation | `"horizontal" \| "vertical"` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="track"></a>

### Track

<a id="api-536c696465722e547261636b"></a>

<a id="slidertrack"></a>

<a id="api-536c696465722e547261636b2e2470726f70732e70726f703a616c69676e"></a>

### Slider.Track

Declaration: `packages/solid/build/types/slider/track/SliderTrack.d.ts:4`

#### Declaration

```typescript
(props: SliderTrackProps) => JSX.Element
```

<a id="api-536c696465722e547261636b2e2470726f70732e636c617373"></a>

<a id="SliderTrack-class"></a>

<a id="api-536c696465722e547261636b2e2470726f70732e7374796c65"></a>

<a id="SliderTrack-style"></a>

<a id="api-536c696465722e547261636b2e2470726f70732e72656e646572"></a>

<a id="SliderTrack-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<SliderTrackState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SliderTrackState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLElement>, SliderTrackState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-536c69646572547261636b44617461417474726962757465732e6472616767696e67"></a>

<a id="api-536c69646572547261636b44617461417474726962757465732e6f7269656e746174696f6e"></a>

<a id="api-536c69646572547261636b44617461417474726962757465732e64697361626c6564"></a>

<a id="api-536c69646572547261636b44617461417474726962757465732e76616c6964"></a>

<a id="api-536c69646572547261636b44617461417474726962757465732e696e76616c6964"></a>

<a id="api-536c69646572547261636b44617461417474726962757465732e6469727479"></a>

<a id="api-536c69646572547261636b44617461417474726962757465732e746f7563686564"></a>

<a id="api-536c69646572547261636b44617461417474726962757465732e666f6375736564"></a>

| Name | Description |
| --- | --- |
| data-dragging |  |
| data-orientation |  |
| data-disabled |  |
| data-valid |  |
| data-invalid |  |
| data-dirty |  |
| data-touched |  |
| data-focused |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-536c696465722e547261636b2e50726f7073"></a>

<a id="slidertrackprops"></a>

<a id="api-536c696465722e547261636b2e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Slider.Track.Props

Declaration: `packages/solid/build/types/slider/track/SliderTrack.d.ts:11`

#### Declaration

```typescript
SliderTrackProps
```

<a id="api-536c696465722e547261636b2e50726f70732e636c617373"></a>

<a id="SliderTrackProps-class"></a>

<a id="api-536c696465722e547261636b2e50726f70732e7374796c65"></a>

<a id="SliderTrackProps-style"></a>

<a id="api-536c696465722e547261636b2e50726f70732e72656e646572"></a>

<a id="SliderTrackProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<SliderTrackState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SliderTrackState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLElement>, SliderTrackState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-536c696465722e547261636b2e5374617465"></a>

<a id="slidertrackstate"></a>

### Related exported type: Slider.Track.State

Declaration: `packages/solid/build/types/slider/track/SliderTrack.d.ts:10`

#### Declaration

```typescript
SliderTrackState
```

<a id="api-536c696465722e547261636b2e53746174652e6163746976655468756d62496e646578"></a>

<a id="SliderTrackState-activeThumbIndex"></a>

<a id="api-536c696465722e547261636b2e53746174652e6469727479"></a>

<a id="SliderTrackState-dirty"></a>

<a id="api-536c696465722e547261636b2e53746174652e6472616767696e67"></a>

<a id="SliderTrackState-dragging"></a>

<a id="api-536c696465722e547261636b2e53746174652e66696c6c6564"></a>

<a id="SliderTrackState-filled"></a>

<a id="api-536c696465722e547261636b2e53746174652e666f6375736564"></a>

<a id="SliderTrackState-focused"></a>

<a id="api-536c696465722e547261636b2e53746174652e746f7563686564"></a>

<a id="SliderTrackState-touched"></a>

<a id="api-536c696465722e547261636b2e53746174652e76616c756573"></a>

<a id="SliderTrackState-values"></a>

<a id="api-536c696465722e547261636b2e53746174652e73746570"></a>

<a id="SliderTrackState-step"></a>

<a id="api-536c696465722e547261636b2e53746174652e6d696e53746570734265747765656e56616c756573"></a>

<a id="SliderTrackState-minStepsBetweenValues"></a>

<a id="api-536c696465722e547261636b2e53746174652e6d696e"></a>

<a id="SliderTrackState-min"></a>

<a id="api-536c696465722e547261636b2e53746174652e6d6178"></a>

<a id="SliderTrackState-max"></a>

<a id="api-536c696465722e547261636b2e53746174652e64697361626c6564"></a>

<a id="SliderTrackState-disabled"></a>

<a id="api-536c696465722e547261636b2e53746174652e76616c6964"></a>

<a id="SliderTrackState-valid"></a>

<a id="api-536c696465722e547261636b2e53746174652e6f7269656e746174696f6e"></a>

<a id="SliderTrackState-orientation"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| activeThumbIndex | `number` | Yes | Unavailable |  |
| dirty | `boolean` | Yes | Unavailable |  |
| dragging | `boolean` | Yes | Unavailable |  |
| filled | `boolean` | Yes | Unavailable |  |
| focused | `boolean` | Yes | Unavailable |  |
| touched | `boolean` | Yes | Unavailable |  |
| values | `readonly number[]` | Yes | Unavailable |  |
| step | `number` | Yes | Unavailable |  |
| minStepsBetweenValues | `number` | Yes | Unavailable |  |
| min | `number` | Yes | Unavailable |  |
| max | `number` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |
| valid | `boolean \| null` | Yes | Unavailable |  |
| orientation | `"horizontal" \| "vertical"` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="indicator"></a>

### Indicator

<a id="api-536c696465722e496e64696361746f72"></a>

<a id="sliderindicator"></a>

<a id="api-536c696465722e496e64696361746f722e2470726f70732e70726f703a616c69676e"></a>

### Slider.Indicator

Declaration: `packages/solid/build/types/slider/indicator/SliderIndicator.d.ts:5`

#### Declaration

```typescript
(props: SliderIndicatorProps) => JSX.Element
```

<a id="api-536c696465722e496e64696361746f722e2470726f70732e636c617373"></a>

<a id="SliderIndicator-class"></a>

<a id="api-536c696465722e496e64696361746f722e2470726f70732e7374796c65"></a>

<a id="SliderIndicator-style"></a>

<a id="api-536c696465722e496e64696361746f722e2470726f70732e72656e646572"></a>

<a id="SliderIndicator-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<SliderIndicatorState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SliderIndicatorState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLElement>, SliderIndicatorState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-536c69646572496e64696361746f7244617461417474726962757465732e6472616767696e67"></a>

<a id="api-536c69646572496e64696361746f7244617461417474726962757465732e6f7269656e746174696f6e"></a>

<a id="api-536c69646572496e64696361746f7244617461417474726962757465732e64697361626c6564"></a>

<a id="api-536c69646572496e64696361746f7244617461417474726962757465732e76616c6964"></a>

<a id="api-536c69646572496e64696361746f7244617461417474726962757465732e696e76616c6964"></a>

<a id="api-536c69646572496e64696361746f7244617461417474726962757465732e6469727479"></a>

<a id="api-536c69646572496e64696361746f7244617461417474726962757465732e746f7563686564"></a>

<a id="api-536c69646572496e64696361746f7244617461417474726962757465732e666f6375736564"></a>

| Name | Description |
| --- | --- |
| data-dragging |  |
| data-orientation |  |
| data-disabled |  |
| data-valid |  |
| data-invalid |  |
| data-dirty |  |
| data-touched |  |
| data-focused |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-536c696465722e496e64696361746f722e50726f7073"></a>

<a id="sliderindicatorprops"></a>

<a id="api-536c696465722e496e64696361746f722e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Slider.Indicator.Props

Declaration: `packages/solid/build/types/slider/indicator/SliderIndicator.d.ts:12`

#### Declaration

```typescript
SliderIndicatorProps
```

<a id="api-536c696465722e496e64696361746f722e50726f70732e636c617373"></a>

<a id="SliderIndicatorProps-class"></a>

<a id="api-536c696465722e496e64696361746f722e50726f70732e7374796c65"></a>

<a id="SliderIndicatorProps-style"></a>

<a id="api-536c696465722e496e64696361746f722e50726f70732e72656e646572"></a>

<a id="SliderIndicatorProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| class | `JSX.ClassValue \| ((state: Readonly<SliderIndicatorState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SliderIndicatorState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLElement>, SliderIndicatorState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onBlur`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocus`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyDown`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-536c696465722e496e64696361746f722e5374617465"></a>

<a id="sliderindicatorstate"></a>

### Related exported type: Slider.Indicator.State

Declaration: `packages/solid/build/types/slider/indicator/SliderIndicator.d.ts:11`

#### Declaration

```typescript
SliderIndicatorState
```

<a id="api-536c696465722e496e64696361746f722e53746174652e6163746976655468756d62496e646578"></a>

<a id="SliderIndicatorState-activeThumbIndex"></a>

<a id="api-536c696465722e496e64696361746f722e53746174652e6469727479"></a>

<a id="SliderIndicatorState-dirty"></a>

<a id="api-536c696465722e496e64696361746f722e53746174652e6472616767696e67"></a>

<a id="SliderIndicatorState-dragging"></a>

<a id="api-536c696465722e496e64696361746f722e53746174652e66696c6c6564"></a>

<a id="SliderIndicatorState-filled"></a>

<a id="api-536c696465722e496e64696361746f722e53746174652e666f6375736564"></a>

<a id="SliderIndicatorState-focused"></a>

<a id="api-536c696465722e496e64696361746f722e53746174652e746f7563686564"></a>

<a id="SliderIndicatorState-touched"></a>

<a id="api-536c696465722e496e64696361746f722e53746174652e76616c756573"></a>

<a id="SliderIndicatorState-values"></a>

<a id="api-536c696465722e496e64696361746f722e53746174652e73746570"></a>

<a id="SliderIndicatorState-step"></a>

<a id="api-536c696465722e496e64696361746f722e53746174652e6d696e53746570734265747765656e56616c756573"></a>

<a id="SliderIndicatorState-minStepsBetweenValues"></a>

<a id="api-536c696465722e496e64696361746f722e53746174652e6d696e"></a>

<a id="SliderIndicatorState-min"></a>

<a id="api-536c696465722e496e64696361746f722e53746174652e6d6178"></a>

<a id="SliderIndicatorState-max"></a>

<a id="api-536c696465722e496e64696361746f722e53746174652e64697361626c6564"></a>

<a id="SliderIndicatorState-disabled"></a>

<a id="api-536c696465722e496e64696361746f722e53746174652e76616c6964"></a>

<a id="SliderIndicatorState-valid"></a>

<a id="api-536c696465722e496e64696361746f722e53746174652e6f7269656e746174696f6e"></a>

<a id="SliderIndicatorState-orientation"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| activeThumbIndex | `number` | Yes | Unavailable |  |
| dirty | `boolean` | Yes | Unavailable |  |
| dragging | `boolean` | Yes | Unavailable |  |
| filled | `boolean` | Yes | Unavailable |  |
| focused | `boolean` | Yes | Unavailable |  |
| touched | `boolean` | Yes | Unavailable |  |
| values | `readonly number[]` | Yes | Unavailable |  |
| step | `number` | Yes | Unavailable |  |
| minStepsBetweenValues | `number` | Yes | Unavailable |  |
| min | `number` | Yes | Unavailable |  |
| max | `number` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |
| valid | `boolean \| null` | Yes | Unavailable |  |
| orientation | `"horizontal" \| "vertical"` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="thumb"></a>

### Thumb

<a id="api-536c696465722e5468756d62"></a>

<a id="sliderthumb"></a>

<a id="api-536c696465722e5468756d622e2470726f70732e70726f703a616c69676e"></a>

### Slider.Thumb

Declaration: `packages/solid/build/types/slider/thumb/SliderThumb.d.ts:4`

#### Declaration

```typescript
(props: SliderThumbProps) => JSX.Element
```

<a id="api-536c696465722e5468756d622e2470726f70732e676574417269614c6162656c"></a>

<a id="SliderThumb-getAriaLabel"></a>

<a id="api-536c696465722e5468756d622e2470726f70732e6765744172696156616c756554657874"></a>

<a id="SliderThumb-getAriaValueText"></a>

<a id="api-536c696465722e5468756d622e2470726f70732e696e646578"></a>

<a id="SliderThumb-index"></a>

<a id="api-536c696465722e5468756d622e2470726f70732e6f6e426c7572"></a>

<a id="SliderThumb-onBlur"></a>

<a id="api-536c696465722e5468756d622e2470726f70732e6f6e466f637573"></a>

<a id="SliderThumb-onFocus"></a>

<a id="api-536c696465722e5468756d622e2470726f70732e6f6e4b6579446f776e"></a>

<a id="SliderThumb-onKeyDown"></a>

<a id="api-536c696465722e5468756d622e2470726f70732e746162496e646578"></a>

<a id="SliderThumb-tabIndex"></a>

<a id="api-536c696465722e5468756d622e2470726f70732e64697361626c6564"></a>

<a id="SliderThumb-disabled"></a>

<a id="api-536c696465722e5468756d622e2470726f70732e696e707574526566"></a>

<a id="SliderThumb-inputRef"></a>

<a id="api-536c696465722e5468756d622e2470726f70732e636c617373"></a>

<a id="SliderThumb-class"></a>

<a id="api-536c696465722e5468756d622e2470726f70732e7374796c65"></a>

<a id="SliderThumb-style"></a>

<a id="api-536c696465722e5468756d622e2470726f70732e72656e646572"></a>

<a id="SliderThumb-render"></a>

#### Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| getAriaLabel | `((index: number) => string) \| null \| undefined` | No | Unavailable |  |
| getAriaValueText | `((formattedValue: string, value: number, index: number) => string) \| null \| undefined` | No | Unavailable |  |
| index | `number \| undefined` | No | Unavailable |  |
| onBlur | `((event: BaseUIEvent<FocusEvent & { currentTarget: HTMLInputElement; target: HTMLInputElement; }>) => void) \| { 0: (data: any, event: BaseUIEvent<FocusEvent & { currentTarget: HTMLInputElement; target: HTMLInputElement; }>) => void; 1: any; } \| undefined` | No | Unavailable |  |
| onFocus | `((event: BaseUIEvent<FocusEvent & { currentTarget: HTMLInputElement; target: HTMLInputElement; }>) => void) \| { 0: (data: any, event: BaseUIEvent<FocusEvent & { currentTarget: HTMLInputElement; target: HTMLInputElement; }>) => void; 1: any; } \| undefined` | No | Unavailable |  |
| onKeyDown | `((event: BaseUIEvent<KeyboardEvent & { currentTarget: HTMLInputElement; target: DOMElement; }>) => void) \| { 0: (data: any, event: BaseUIEvent<KeyboardEvent & { currentTarget: HTMLInputElement; target: DOMElement; }>) => void; 1: any; } \| undefined` | No | Unavailable |  |
| tabIndex | `number \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| inputRef | `JSX.Ref<HTMLInputElement>` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<SliderThumbState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SliderThumbState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLElement>, SliderThumbState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

<a id="api-536c696465725468756d6244617461417474726962757465732e6472616767696e67"></a>

<a id="api-536c696465725468756d6244617461417474726962757465732e6f7269656e746174696f6e"></a>

<a id="api-536c696465725468756d6244617461417474726962757465732e64697361626c6564"></a>

<a id="api-536c696465725468756d6244617461417474726962757465732e76616c6964"></a>

<a id="api-536c696465725468756d6244617461417474726962757465732e696e76616c6964"></a>

<a id="api-536c696465725468756d6244617461417474726962757465732e6469727479"></a>

<a id="api-536c696465725468756d6244617461417474726962757465732e746f7563686564"></a>

<a id="api-536c696465725468756d6244617461417474726962757465732e666f6375736564"></a>

<a id="api-536c696465725468756d6244617461417474726962757465732e696e646578"></a>

| Name | Description |
| --- | --- |
| data-dragging |  |
| data-orientation |  |
| data-disabled |  |
| data-valid |  |
| data-invalid |  |
| data-dirty |  |
| data-touched |  |
| data-focused |  |
| data-index |  |

#### CSS variables

Metadata status: unavailable.

<a id="api-536c696465722e5468756d622e50726f7073"></a>

<a id="sliderthumbprops"></a>

<a id="api-536c696465722e5468756d622e50726f70732e70726f703a616c69676e"></a>

### Related exported type: Slider.Thumb.Props

Declaration: `packages/solid/build/types/slider/thumb/SliderThumb.d.ts:21`

#### Declaration

```typescript
SliderThumbProps
```

<a id="api-536c696465722e5468756d622e50726f70732e676574417269614c6162656c"></a>

<a id="SliderThumbProps-getAriaLabel"></a>

<a id="api-536c696465722e5468756d622e50726f70732e6765744172696156616c756554657874"></a>

<a id="SliderThumbProps-getAriaValueText"></a>

<a id="api-536c696465722e5468756d622e50726f70732e696e646578"></a>

<a id="SliderThumbProps-index"></a>

<a id="api-536c696465722e5468756d622e50726f70732e6f6e426c7572"></a>

<a id="SliderThumbProps-onBlur"></a>

<a id="api-536c696465722e5468756d622e50726f70732e6f6e466f637573"></a>

<a id="SliderThumbProps-onFocus"></a>

<a id="api-536c696465722e5468756d622e50726f70732e6f6e4b6579446f776e"></a>

<a id="SliderThumbProps-onKeyDown"></a>

<a id="api-536c696465722e5468756d622e50726f70732e746162496e646578"></a>

<a id="SliderThumbProps-tabIndex"></a>

<a id="api-536c696465722e5468756d622e50726f70732e64697361626c6564"></a>

<a id="SliderThumbProps-disabled"></a>

<a id="api-536c696465722e5468756d622e50726f70732e696e707574526566"></a>

<a id="SliderThumbProps-inputRef"></a>

<a id="api-536c696465722e5468756d622e50726f70732e636c617373"></a>

<a id="SliderThumbProps-class"></a>

<a id="api-536c696465722e5468756d622e50726f70732e7374796c65"></a>

<a id="SliderThumbProps-style"></a>

<a id="api-536c696465722e5468756d622e50726f70732e72656e646572"></a>

<a id="SliderThumbProps-render"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| getAriaLabel | `((index: number) => string) \| null \| undefined` | No | Unavailable |  |
| getAriaValueText | `((formattedValue: string, value: number, index: number) => string) \| null \| undefined` | No | Unavailable |  |
| index | `number \| undefined` | No | Unavailable |  |
| onBlur | `((event: BaseUIEvent<FocusEvent & { currentTarget: HTMLInputElement; target: HTMLInputElement; }>) => void) \| { 0: (data: any, event: BaseUIEvent<FocusEvent & { currentTarget: HTMLInputElement; target: HTMLInputElement; }>) => void; 1: any; } \| undefined` | No | Unavailable |  |
| onFocus | `((event: BaseUIEvent<FocusEvent & { currentTarget: HTMLInputElement; target: HTMLInputElement; }>) => void) \| { 0: (data: any, event: BaseUIEvent<FocusEvent & { currentTarget: HTMLInputElement; target: HTMLInputElement; }>) => void; 1: any; } \| undefined` | No | Unavailable |  |
| onKeyDown | `((event: BaseUIEvent<KeyboardEvent & { currentTarget: HTMLInputElement; target: DOMElement; }>) => void) \| { 0: (data: any, event: BaseUIEvent<KeyboardEvent & { currentTarget: HTMLInputElement; target: DOMElement; }>) => void; 1: any; } \| undefined` | No | Unavailable |  |
| tabIndex | `number \| undefined` | No | Unavailable |  |
| disabled | `boolean \| undefined` | No | Unavailable |  |
| inputRef | `JSX.Ref<HTMLInputElement>` | No | Unavailable |  |
| class | `JSX.ClassValue \| ((state: Readonly<SliderThumbState>) => ClassValue)` | No | Unavailable | CSS classes for the rendered element. A callback receives the live component state and returns a Solid class value; the result is merged with the component’s classes. |
| style | `string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<SliderThumbState>) => StyleValue)` | No | Unavailable | Inline styles for the rendered element. A callback receives the live component state and returns a Solid style value; the result is merged with the component’s styles. |
| render | `ComponentRenderFn<JSX.HTMLAttributes<HTMLElement>, SliderThumbState> \| undefined` | No | Unavailable | Solid-native callback, not a cloneable pre-created JSX value. |

Inherited DOM attributes: `$ServerOnly`, `$key`, `about`, `accesskey`, `aria-activedescendant`, `aria-atomic`, `aria-autocomplete`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-busy`, `aria-checked`, `aria-colcount`, `aria-colindex`, `aria-colindextext`, `aria-colspan`, `aria-controls`, `aria-current`, `aria-describedby`, `aria-description`, `aria-details`, `aria-disabled`, `aria-dropeffect`, `aria-errormessage`, `aria-expanded`, `aria-flowto`, `aria-grabbed`, `aria-haspopup`, `aria-hidden`, `aria-invalid`, `aria-keyshortcuts`, `aria-label`, `aria-labelledby`, `aria-level`, `aria-live`, `aria-modal`, `aria-multiline`, `aria-multiselectable`, `aria-orientation`, `aria-owns`, `aria-placeholder`, `aria-posinset`, `aria-pressed`, `aria-readonly`, `aria-relevant`, `aria-required`, `aria-roledescription`, `aria-rowcount`, `aria-rowindex`, `aria-rowindextext`, `aria-rowspan`, `aria-selected`, `aria-setsize`, `aria-sort`, `aria-valuemax`, `aria-valuemin`, `aria-valuenow`, `aria-valuetext`, `autocapitalize`, `autocorrect`, `autofocus`, `children`, `contenteditable`, `contextmenu`, `datatype`, `dir`, `draggable`, `elementtiming`, `enterkeyhint`, `exportparts`, `hidden`, `id`, `inert`, `inlist`, `innerHTML`, `innerText`, `inputmode`, `is`, `itemid`, `itemprop`, `itemref`, `itemscope`, `itemtype`, `lang`, `nonce`, `onAbort`, `onAnimationCancel`, `onAnimationEnd`, `onAnimationIteration`, `onAnimationStart`, `onAuxClick`, `onBeforeCopy`, `onBeforeCut`, `onBeforeInput`, `onBeforeMatch`, `onBeforePaste`, `onBeforeToggle`, `onBeforeXRSelect`, `onCanPlay`, `onCanPlayThrough`, `onCancel`, `onChange`, `onClick`, `onClose`, `onCommand`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onContentVisibilityAutoStateChange`, `onContextLost`, `onContextMenu`, `onContextRestored`, `onCopy`, `onCueChange`, `onCut`, `onDblClick`, `onDrag`, `onDragEnd`, `onDragEnter`, `onDragExit`, `onDragLeave`, `onDragOver`, `onDragStart`, `onDrop`, `onDurationChange`, `onEmptied`, `onEnded`, `onError`, `onFocusIn`, `onFocusOut`, `onFormData`, `onFullscreenChange`, `onFullscreenError`, `onGotPointerCapture`, `onInput`, `onInvalid`, `onKeyPress`, `onKeyUp`, `onLoad`, `onLoadStart`, `onLoadedData`, `onLoadedMetadata`, `onLostPointerCapture`, `onMouseDown`, `onMouseEnter`, `onMouseLeave`, `onMouseMove`, `onMouseOut`, `onMouseOver`, `onMouseUp`, `onPaste`, `onPause`, `onPlay`, `onPlaying`, `onPointerCancel`, `onPointerDown`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onPointerOut`, `onPointerOver`, `onPointerRawUpdate`, `onPointerUp`, `onProgress`, `onRateChange`, `onReset`, `onResize`, `onScroll`, `onScrollEnd`, `onScrollSnapChange`, `onScrollSnapChanging`, `onSecurityPolicyViolation`, `onSeeked`, `onSeeking`, `onSelect`, `onSelectStart`, `onSelectionChange`, `onSlotChange`, `onStalled`, `onSubmit`, `onSuspend`, `onTimeUpdate`, `onToggle`, `onTouchCancel`, `onTouchEnd`, `onTouchMove`, `onTouchStart`, `onTransitionCancel`, `onTransitionEnd`, `onTransitionRun`, `onTransitionStart`, `onVolumeChange`, `onWaiting`, `onWheel`, `part`, `popover`, `prefix`, `prop:align`, `property`, `ref`, `resource`, `role`, `slot`, `spellcheck`, `tabindex`, `textContent`, `title`, `translate`, `typeof`, `virtualkeyboardpolicy`, `vocab`, `writingsuggestions`

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

<a id="api-536c696465722e5468756d622e5374617465"></a>

<a id="sliderthumbstate"></a>

### Related exported type: Slider.Thumb.State

Declaration: `packages/solid/build/types/slider/thumb/SliderThumb.d.ts:20`

#### Declaration

```typescript
SliderThumbState
```

<a id="api-536c696465722e5468756d622e53746174652e6163746976655468756d62496e646578"></a>

<a id="SliderThumbState-activeThumbIndex"></a>

<a id="api-536c696465722e5468756d622e53746174652e6469727479"></a>

<a id="SliderThumbState-dirty"></a>

<a id="api-536c696465722e5468756d622e53746174652e6472616767696e67"></a>

<a id="SliderThumbState-dragging"></a>

<a id="api-536c696465722e5468756d622e53746174652e66696c6c6564"></a>

<a id="SliderThumbState-filled"></a>

<a id="api-536c696465722e5468756d622e53746174652e666f6375736564"></a>

<a id="SliderThumbState-focused"></a>

<a id="api-536c696465722e5468756d622e53746174652e746f7563686564"></a>

<a id="SliderThumbState-touched"></a>

<a id="api-536c696465722e5468756d622e53746174652e76616c756573"></a>

<a id="SliderThumbState-values"></a>

<a id="api-536c696465722e5468756d622e53746174652e73746570"></a>

<a id="SliderThumbState-step"></a>

<a id="api-536c696465722e5468756d622e53746174652e6d696e53746570734265747765656e56616c756573"></a>

<a id="SliderThumbState-minStepsBetweenValues"></a>

<a id="api-536c696465722e5468756d622e53746174652e6d696e"></a>

<a id="SliderThumbState-min"></a>

<a id="api-536c696465722e5468756d622e53746174652e6d6178"></a>

<a id="SliderThumbState-max"></a>

<a id="api-536c696465722e5468756d622e53746174652e64697361626c6564"></a>

<a id="SliderThumbState-disabled"></a>

<a id="api-536c696465722e5468756d622e53746174652e76616c6964"></a>

<a id="SliderThumbState-valid"></a>

<a id="api-536c696465722e5468756d622e53746174652e6f7269656e746174696f6e"></a>

<a id="SliderThumbState-orientation"></a>

#### Properties

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| activeThumbIndex | `number` | Yes | Unavailable |  |
| dirty | `boolean` | Yes | Unavailable |  |
| dragging | `boolean` | Yes | Unavailable |  |
| filled | `boolean` | Yes | Unavailable |  |
| focused | `boolean` | Yes | Unavailable |  |
| touched | `boolean` | Yes | Unavailable |  |
| values | `readonly number[]` | Yes | Unavailable |  |
| step | `number` | Yes | Unavailable |  |
| minStepsBetweenValues | `number` | Yes | Unavailable |  |
| min | `number` | Yes | Unavailable |  |
| max | `number` | Yes | Unavailable |  |
| disabled | `boolean` | Yes | Unavailable |  |
| valid | `boolean \| null` | Yes | Unavailable |  |
| orientation | `"horizontal" \| "vertical"` | Yes | Unavailable |  |

#### Data attributes

Metadata status: unavailable.

#### CSS variables

Metadata status: unavailable.

