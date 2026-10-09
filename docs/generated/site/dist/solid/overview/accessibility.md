<a id="accessibility"></a>

# Accessibility

Learn how to make the most of Base UI's accessibility features and guidelines.

Accessibility is a top priority for Base UI.
Base UI components handle many complex accessibility details including ARIA attributes, role attributes, pointer interactions, keyboard navigation, and focus management.
The goal is to provide an accessible user experience out of the box, with intuitive APIs for configuration.

This page highlights some of the key accessibility features of Base UI, as well as some ways you need to augment the library, to ensure that your application is accessible to everyone.

Base UI for Solid is an independent, unofficial Solid 2 port of Base UI. Alpha release 0.0.2. [Project repository](https://github.com/unstyled-solid/base-ui).

This is an alpha release. APIs and behavior may change. This independent, unofficial port is not maintained by the upstream Base UI team and does not claim equivalent browser, device, or screen-reader coverage. Test it in your application before relying on it.

<a id="keyboard-navigation"></a>

## Keyboard navigation

Base UI components adhere to the [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) to provide basic keyboard accessibility out of the box.
This is critical for users who have difficulty using a pointer device, but it's also important for users who prefer navigating with a keyboard or other input mode.

Many components provide support for arrow keys, alphanumeric keys, <kbd>Home</kbd>, <kbd>End</kbd>, <kbd>Enter</kbd>, and <kbd>Esc</kbd>.

<a id="focus-management"></a>

## Focus management

Base UI components manage focus automatically following a user interaction.
Additionally, some components provide props like `initialFocus` and `finalFocus`, to configure focus management.

While Base UI components manage focus, it's the developer's responsibility to visually indicate focus.
This is typically handled by styling the `:focus` or `:focus-visible` CSS pseudo-classes.
WCAG provides [guidelines on focus appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance).

<a id="color-contrast"></a>

## Color contrast

When styling elements, it's important to meet the minimum requirements for color contrast between each foreground element and its corresponding background element.
Unless your application has strict requirements around compliance with current standards, consider adhering to [APCA](https://apcacontrast.com/).

<a id="accessible-labels"></a>

## Accessible labels

Base UI provides components like Form, Input, Field, Fieldset to automatically associate form controls. Additionally, you can use the native HTML `<label>` element to provide context to corresponding inputs.

Most applications present custom controls that require accessible names provided by markup features such as `alt`, `aria-label`, or `aria-labelledby`.
WAI-ARIA provides guidelines on [providing accessible names](https://www.w3.org/TR/wai-aria-1.2/#namecalculation) to custom controls.

<a id="testing"></a>

## Testing

Upstream React Base UI describes broad accessibility testing. This alpha Solid port does not claim the same browser, device, or screen-reader coverage; test your application in its intended environments.

