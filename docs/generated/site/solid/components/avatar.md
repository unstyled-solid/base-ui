# Avatar

An easily stylable avatar component.



[Interactive example](/solid/components/avatar)

## Anatomy

Import the component and assemble its parts:

```tsx
import { Avatar } from 'baseui-solid2/avatar';
<Avatar.Root>
  <Avatar.Image src="" />
  <Avatar.Fallback>LT</Avatar.Fallback>
</Avatar.Root>;
```

## Optimized and lazy-loaded images

By default, `<Avatar.Image>` preloads `src` and renders the image only once it has loaded. This doesn't compose with image optimizers such as `next/image`, which serve a different URL than the raw `src`, or with `loading="lazy"`.

Add the `keepMounted` prop to render the image element right away and let it load in place. Only the image that is actually displayed is requested:

```jsx
import Image from 'next/image';

<Avatar.Root>
  <Avatar.Fallback>LT</Avatar.Fallback>
  <Avatar.Image
    keepMounted
    render={<Image src="/avatar.png" width={32} height={32} alt="" />}
  />
</Avatar.Root>;
```

### Stacking

With `keepMounted`, the image and the fallback are both present until the image loads. The image is hidden from assistive technology until then, so the fallback provides the accessible name on its own.

Stack the two in the same box, and place `<Avatar.Image>` after `<Avatar.Fallback>`. Both are positioned, so whichever comes later in the DOM paints on top. The fallback then shows through until the image covers it.

A loading image paints nothing, so the fallback shows through on its own. An image that failed to load paints a broken-image icon on top of it. Hide the image in either state with the `data-loading` and `data-error` attributes:

```css
.Root {
  position: relative;
}

.Image,
.Fallback {
  position: absolute;
  inset: 0;
}

.Image[data-loading],
.Image[data-error] {
  visibility: hidden;
}
```

Avoid `display: none` here: an element without a box never intersects the viewport, so `loading="lazy"` would never fetch the image. `visibility` and `opacity` both keep lazy loading working.

### Server rendering

With `keepMounted`, the image is part of the server-rendered HTML and starts loading before hydration. So is the fallback, which stays visible until hydration resolves the loading status. A cached image is displayed immediately, without an enter animation.

## API reference

### Root

Displays a user's profile picture, initials, or fallback icon. Renders a `<span>`.

| Prop | Type | Description |
| --- | --- | --- |
| class | JSX.ClassValue \| ((state: Readonly<AvatarRootState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AvatarRootState>) => StyleValue) |  |
| render | ComponentRenderFn<JSX.HTMLAttributes<HTMLSpanElement> & JSX.Properties<HTMLSpanElement>, AvatarRootState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Image

The avatar image. Renders an `<img>` after preloading, or in place with keepMounted.

| Prop | Type | Description |
| --- | --- | --- |
| crossOrigin | JSX.RemoveAttribute \| JSX.HTMLCrossorigin | Source-compatible alias of Solid's `crossorigin`. |
| onLoadingStatusChange | ((status: ImageLoadingStatus) => void) \| undefined |  |
| referrerPolicy | JSX.RemoveAttribute \| JSX.HTMLReferrerPolicy | Source-compatible alias of Solid's `referrerpolicy`. |
| srcSet | string \| JSX.RemoveAttribute | Source-compatible alias of Solid's `srcset`. |
| class | JSX.ClassValue \| ((state: Readonly<AvatarImageState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AvatarImageState>) => StyleValue) |  |
| keepMounted | boolean \| undefined | Load in place and retain the image element, including when loading or failed. |
| render | ComponentRenderFn<JSX.ImgHTMLAttributes<HTMLImageElement> & JSX.Properties<HTMLImageElement>, AvatarImageState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

### Fallback

Shown while the image is unavailable. Renders a `<span>`.

| Prop | Type | Description |
| --- | --- | --- |
| delay | number \| undefined | Delay before showing the fallback, in milliseconds. |
| class | JSX.ClassValue \| ((state: Readonly<AvatarFallbackState>) => ClassValue) |  |
| style | string \| JSX.CSSProperties \| JSX.RemoveAttribute \| ((state: Readonly<AvatarFallbackState>) => StyleValue) |  |
| render | ComponentRenderFn<JSX.HTMLAttributes<HTMLSpanElement> & JSX.Properties<HTMLSpanElement>, AvatarFallbackState> \| undefined | Solid-native callback, not a cloneable pre-created JSX value. |

## Additional types



| Prop | Type | Description |
| --- | --- | --- |


