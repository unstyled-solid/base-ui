# CSP Provider

Configures CSP-related behavior for inline tags rendered by Base UI components.



## Anatomy

Import the component and wrap it around your app:

```tsx
import { CSPProvider } from 'baseui-solid2/csp-provider';
<CSPProvider nonce="...">{/* Your app or a group of components */}</CSPProvider>;
```

Some Base UI components render inline `<style>` or `<script>` tags for functionality such as removing scrollbars or pre-hydration behavior. Under a strict Content Security Policy (CSP), these tags may be blocked unless they include a matching [nonce](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/nonce) attribute.

`CSPProvider` allows configuring this behavior globally for all Base UI components within its tree.

## Supplying a nonce

If you enforce a CSP that blocks inline tags by default, configure your server to:

- Generate a random nonce per request
- Include it in your CSP header (via `style-src-elem`/`script-src`)
- Pass the same nonce into `CSPProvider` during rendering

```ts
const nonce = crypto.randomUUID();
// Example CSP header
const csp = [
  `default-src 'self'`,
  `script-src 'self' 'nonce-${nonce}'`,
  `style-src-elem 'self' 'nonce-${nonce}'`,
].join('; ');
```

Then:

```tsx
import { CSPProvider } from 'baseui-solid2/csp-provider';
function App(props: { nonce: string }) {
  return <CSPProvider nonce={props.nonce}>{/* ... */}</CSPProvider>;
}
```

This will ensure that all inline `<style>` and `<script>` tags rendered by Base UI components include the correct nonce attribute, allowing them to function under your CSP.

## Disable inline style elements

You can avoid supplying a `nonce` if you disable inline `<style>` elements entirely and rely on external stylesheets only. The relevant components are `<ScrollArea.Viewport>` and `<Select.Popup>` or `<Select.List>` when `alignItemWithTrigger` is enabled, which inject a style tag to disable native scrollbars.

```html
<style>
  .base-ui-disable-scrollbar {
    scrollbar-width: none;
  }
  .base-ui-disable-scrollbar::-webkit-scrollbar {
    display: none;
  }
</style>
```

Specify `disableStyleElements` to remove these tags:

```tsx
<CSPProvider disableStyleElements>{/* ... */}</CSPProvider>;
```

`<script>` tags across all components are opt-in, so they are not affected by this prop and don't have their own disable flag. A `nonce` is required if any component uses inline scripts.

## Inline style attributes

`CSPProvider` covers inline `<style>` and `<script>` tags rendered as elements, but it does not cover inline style attributes (for example, `<div style="...">`). The `style-src-attr` directive in CSP governs inline style attributes encountered when parsing HTML from server pre-rendered components (it does not affect client-side JavaScript that sets styles).

In CSP, `style-src` applies to both `<style>` elements and `style=""` attributes. If you only want to control `<style>` elements, use `style-src-elem` instead.

If your CSP blocks inline style *attributes* in addition to *elements*, you have a few options:

- Relax your CSP by adding `'unsafe-inline'` to the `style-src-attr` directive (or using only `style-src-elem` instead of `style-src`). Style attributes specifically pose a less severe security risk than style elements, but this approach may not be acceptable in high-security environments.
- Render the affected components only on the client, so that no inline styles are present in the initial HTML.
- Manually unset inline styles and specify them in your CSS instead. Any component can have its inline styles unset, such as `<ScrollArea.Viewport style={{ overflow: undefined  }}>`. Note that you'll need to ensure you vet upgrades for any new inline styles added by Base UI components.

## API reference



| Prop | Type | Description |
| --- | --- | --- |
| disableStyleElements | boolean \| undefined |  |
| nonce | string \| undefined |  |
| children | JSX.Element |  |

