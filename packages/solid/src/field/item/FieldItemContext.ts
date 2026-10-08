// The shared Item scope is foundation-owned so field-aware controls do not depend
// on a public component and never allocate a competing context instance.
export { FieldItemContext, useFieldItemContext } from '../../internals/field-core';
