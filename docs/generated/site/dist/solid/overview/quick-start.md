# Quick start

A quick guide to getting started with Base UI.



## Install the library

Install Base UI using a package manager.

In this pnpm workspace, install the private `baseui-solid2` package and its pinned Solid 2 peers:

```sh
rtk pnpm add baseui-solid2@workspace:*
rtk pnpm add solid-js@2.0.0-rc.13 @solidjs/web@2.0.0-rc.13
rtk pnpm add -D vite@8.3.2 @solidjs/vite-plugin@3.0.0-next.47 @solidjs/compiler@2.0.0-rc.13 @solidjs/babel-plugin@2.0.0-rc.13
```

Configure the Solid Vite plugin and TypeScript JSX source:

```ts
import { defineConfig } from 'vite';
import solid from '@solidjs/vite-plugin';
export default defineConfig({ plugins: [solid({ compiler: 'babel' })] });
```

```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "@solidjs/web"
  }
}
```

All components are included in a single workspace package. Tree-shaking is checked against packed consumers during distribution qualification.

## Set up

### Portals

Base UI uses portals for components that render popups, such as Dialog and Popover.
To make portaled components always appear on top of the entire page, add the following style to your application layout root:

```tsx
<body>
  <div class="root">{children}</div>
</body>;
```

```css
.root {
  isolation: isolate;
}
```

This style creates a separate stacking context for your application's `.root` element.
This way, popups always appear above the page contents, and any `z-index` property in your styles won't interfere with them.

### iOS 26+ Safari

Starting with iOS 26, Safari allows content beneath the UI chrome to be visible. Backdrops such as those used by dialogs must use `position: absolute` instead of `position: fixed` to cover the entire visual viewport. For this to work after the page is scrolled, the following style must be added to your global styles:

```css
body {
  position: relative;
}
```

## Assemble a component

This demo shows you how to import a [Popover](/solid/components/popover) component, assemble its parts, and apply styles.
There are examples for both Tailwind and CSS Modules below, but since Base UI is unstyled, you can use CSS-in-JS, plain CSS, or any other styling solution you prefer.

[Interactive example](/solid/overview/quick-start)

## Pre-styled components

[shadcn/ui](https://ui.shadcn.com/) provides pre-styled Solid components with higher-level abstractions built on upstream Base UI.

Take a look at the [Community](/solid/overview/community) page to see more styled libraries in the upstream ecosystem.

## Working with LLMs

For those of you working with LLMs, each docs page has a "View as Markdown" link at the top, which can be shared with AI chat assistants to help them understand Base UI concepts and component APIs.

Additionally, there is an ["llms.txt"](/llms.txt) link in the "Handbook" section of the navigation sidebar, which you can feed to AI chat assistants to help them navigate the docs.

## Next steps

This walkthrough outlines the basics of putting together a Base UI component.
Continue to the [Handbook](/solid/handbook/styling) section for broader guidance on topics like styling, animation, and composition, or explore the [components](/solid/components/accordion).

