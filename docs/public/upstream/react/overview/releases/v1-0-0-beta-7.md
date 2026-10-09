<a id="v1-0-0-beta-7"></a>

# v1.0.0-beta.7

Nov 27, 2025

<a id="general-changes"></a>

## General changes

- Fix error about `props.ref` access in React <=18 ([#3257](https://github.com/mui/base-ui/pull/3257))
- Prefer non-adaptive anchoring position in `<Positioner>` components and fix `autoFocus` scroll jumps ([#3250](https://github.com/mui/base-ui/pull/3250))
- Make popups' `data-anchor-hidden` state attribute check for anchor presence in layout ([#3267](https://github.com/mui/base-ui/pull/3267))
- Prevent popups from sticking after hover when pressing `<a>` tags inside them ([#3318](https://github.com/mui/base-ui/pull/3318))
- Improve performance when detached triggers are used ([#3277](https://github.com/mui/base-ui/pull/3277))
- Fix iOS VoiceOver voice control accessibility in non-modal popups ([#3340](https://github.com/mui/base-ui/pull/3340))

<a id="alert-dialog"></a>

## Alert Dialog

- Fix trigger registration loop ([#3249](https://github.com/mui/base-ui/pull/3249))
- Fix focus restoration when focused element is hidden with CSS ([#3313](https://github.com/mui/base-ui/pull/3313))

<a id="checkbox-group"></a>

## Checkbox Group

- Fix `aria-describedby` on checkbox group ([#3269](https://github.com/mui/base-ui/pull/3269))

<a id="combobox"></a>

## Combobox

- Revert overload types to ensure typed wrappers work correctly ([#3254](https://github.com/mui/base-ui/pull/3254))
- Fix ignored `filteredItems` instances ([#3272](https://github.com/mui/base-ui/pull/3272))
- Fix loop when passing `undefined` to `items` prop ([#3348](https://github.com/mui/base-ui/pull/3348))

<a id="context-menu"></a>

## Context Menu

- Block mouseup at initial cursor point ([#3274](https://github.com/mui/base-ui/pull/3274))

<a id="dialog"></a>

## Dialog

- Fix trigger registration loop ([#3249](https://github.com/mui/base-ui/pull/3249))
- Fix focus restoration when focused element is hidden with CSS ([#3313](https://github.com/mui/base-ui/pull/3313))

<a id="form"></a>

## Form

- Fix cast `ref` type ([#3324](https://github.com/mui/base-ui/pull/3324))

<a id="menu"></a>

## Menu

- Fix trigger registration loop ([#3249](https://github.com/mui/base-ui/pull/3249))
- Do not pass `key` to the rendered element ([#3255](https://github.com/mui/base-ui/pull/3255))
- Fix nested dialog from closing on <kbd>Shift+Tab</kbd> ([#3346](https://github.com/mui/base-ui/pull/3346))
- Ensure submenu triggers participate in composite list ([#3344](https://github.com/mui/base-ui/pull/3344))

<a id="navigation-menu"></a>

## Navigation Menu

- Fix Safari 18 issue where `<Positioner>` width may be set to 0 on hover ([#3309](https://github.com/mui/base-ui/pull/3309))

<a id="number-field"></a>

## Number Field

- Fix literal space handling with symbols ([#3334](https://github.com/mui/base-ui/pull/3334))

<a id="popover"></a>

## Popover

- Fix trigger registration loop ([#3249](https://github.com/mui/base-ui/pull/3249))
- Do not pass `key` to the rendered element ([#3255](https://github.com/mui/base-ui/pull/3255))
- Fix focus restoration when focused element is hidden with CSS ([#3313](https://github.com/mui/base-ui/pull/3313))

<a id="select"></a>

## Select

- Revert overload types to ensure typed wrappers work correctly ([#3254](https://github.com/mui/base-ui/pull/3254))

<a id="slider"></a>

## Slider

- Fix extra `onValueCommitted` calls ([#3312](https://github.com/mui/base-ui/pull/3312))
- Fix cast `ref` type ([#3324](https://github.com/mui/base-ui/pull/3324))

<a id="tooltip"></a>

## Tooltip

- Fix trigger registration loop ([#3249](https://github.com/mui/base-ui/pull/3249))

