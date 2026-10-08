# Utils

- CSP Provider - ([Outline](#csp-provider), [Contents](/solid/utils/csp-provider))
- Direction Provider - ([Outline](#direction-provider), [Contents](/solid/utils/direction-provider))
- mergeProps - ([Outline](#mergeprops), [Contents](/solid/utils/merge-props))
- useRender - ([Outline](#userender), [Contents](/solid/utils/use-render))

## CSP Provider

Configures CSP-related behavior for inline tags rendered by Base UI components.

Outline



- Keywords: Base UI CSP Provider, Content Security Policy, CSP nonce, React CSP, Inline script nonce, Inline style nonce
- Sections:

- Anatomy
- Supplying a nonce
- Disable inline style elements
- Inline style attributes
- API reference
- Exports:

- CSPProvider

- Props: children, disableStyleElements, nonce
- Types: CSPProvider.Props, CSPProvider.State



[Read more](/solid/utils/csp-provider)

## Direction Provider

Enables RTL behavior for Base UI components.

Outline



- Keywords: Base UI Direction Provider, React RTL Context, Text Direction Hook, useDirection Base UI, Headless RTL Components, Internationalization, i18n, Bidirectional Text, Locale Support, Arabic Hebrew Support, LTR RTL Switch
- Sections:

- Anatomy
- API reference

- DirectionProvider
- useDirection
- Exports:

- DirectionProvider

- Props: children, direction
- useDirection
- Types: DirectionProvider.Props, DirectionProvider.State, TextDirection



[Read more](/solid/utils/direction-provider)

## mergeProps

A utility to merge multiple sets of Solid props.

Outline



- Sections:

- How merging works

- Preventing Base UI's default behavior
- Passing a function instead of an object
- API reference

- mergeProps
- mergePropsN
- Exports:

- makeEventPreventable

- Parameters: event
- mergeClassNames

- Parameters: ourClassName, theirClassName
- mergeProps

- Parameters: a, b, c, d, e
- mergePropsN

- Parameters: props



[Read more](/solid/utils/merge-props)

## useRender

Hook for enabling a render prop in custom components.

Outline



- Keywords: Base UI useRender, React Render Prop Hook, Merge Props Helper, Merge Refs Hook, Radix asChild Migration, Component Composition, Props Spreading, Ref Forwarding, Custom Components, asChild Pattern, Slot Pattern
- Sections:

- Examples
- Merging props
- Merging refs
- TypeScript
- Migrating from Radix UI
- Render prop and polymorphism
- API reference
- Exports:

- ComponentRenderFn
- useRender

- Parameters: params
- Types: HTMLProps, UseRenderComponentProps, UseRenderElementProps, UseRenderParameters, UseRenderRenderProp, UseRenderReturnValue, UseRenderState, useRender.ComponentProps, useRender.ElementProps, useRender.Parameters, useRender.RenderProp, useRender.ReturnValue, useRender.State



[Read more](/solid/utils/use-render)

