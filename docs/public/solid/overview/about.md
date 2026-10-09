<a id="about-base-ui"></a>

# About Base UI for Solid

A Solid 2 port of the open-source Base UI component library for building accessible user interfaces.

Upstream Base UI, from the creators of Radix, Material UI, and Floating UI, is an unstyled React component library for building accessible user interfaces.
The upstream project focuses on accessibility, performance, and developer experience.
Its goal is to provide a complete set of open-source UI components, with a delightful developer experience, in a sustainable way.

Base UI for Solid is an independent, unofficial Solid 2 port of Base UI. Alpha release 0.0.1. [Project repository](https://github.com/unstyled-solid/base-ui).

This is an alpha release. APIs and behavior may change. This independent, unofficial port is not maintained by the upstream Base UI team and does not claim equivalent browser, device, or screen-reader coverage. Test it in your application before relying on it.

<a id="features"></a>

## Features

<a id="headless"></a>

### Headless

Base UI components are unstyled, don't bundle CSS, and don't prescribe a styling solution.
You retain complete control over your application's CSS layer.
Base UI is compatible with Tailwind, CSS Modules, plain CSS, CSS-in-JS, or any other styling engine you prefer.

<a id="accessible"></a>

### Accessible

Poor accessibility can make your application difficult to navigate for all users, not just for users with disabilities.
Accessibility is a primary focus of upstream Base UI and this port.
Base UI components adhere to [WAI-ARIA design patterns](https://www.w3.org/WAI/ARIA/apg/patterns/). This alpha port does not claim equivalent browser, device, or screen-reader coverage.

<a id="composable"></a>

### Composable

Component APIs are fully open, so you have direct access to each node, you can easily add or remove parts, and you can wrap them however you prefer.

<a id="team"></a>

## Upstream contributors

- **Colm Tuite** @colmtuite
- **Marija Najdova** @marijanajdova
- **Flavien Delangle** @flaviendelangle
- **James Nelson** @atomiksdev
- **Jenna Smith** @jjenzz
- **Michał Dudak** @michaldudak
- **Aarón García** @aarongarciah

<a id="browser-support"></a>

## Upstream browser targets

Upstream React Base UI supports all modern browsers that implement features marked as [Baseline Widely Available](https://web.dev/baseline) at the time of the last major version release.
This means the features we use have been supported across major browsers for at least 30 months, ensuring broad compatibility and stability.

For the upstream browser targets, refer to its [.browserslistrc](https://github.com/mui/base-ui/blob/master/.browserslistrc).

<a id="react-versions"></a>

## Solid version

This port targets Solid 2.0.0-rc.13 and @solidjs/web 2.0.0-rc.13.

<a id="bundler-support"></a>

## Bundler support

The docs and port harness use Vite with @solidjs/vite-plugin.

<a id="community"></a>

## Community

Visit the [Community](/solid/overview/community) page to learn more about ecosystem projects, support channels, and how to stay up to date and contribute.

