export function utilityText(value, topic) {
  if (topic === 'use-render') return value
    .replace(/\bHook\b/g, 'Utility').replace(/\bhook\b/g, 'utility')
    .replace(' lets you build custom components', ' (the compatibility alias of createRender) lets you build custom components')
    .replace('The callback version of the ', 'The ')
    .replace(' enables more control of how props are spread', ' callback controls how props are spread')
    .replace('sets of React props', 'sets of Solid props')
    .replace('Radix UI uses an ', 'The upstream React Radix UI library uses an ')
    .replace('In Radix UI, the ', 'In React Radix UI, the ');
  if (topic === 'merge-props') return value
    .replace('sets of React props', 'sets of Solid props')
    .replace('so common React patterns work as expected', 'while preserving live prop reads')
    .replace('For React synthetic events', 'For native DOM events')
    .replace('For non-synthetic events (custom events with primitive/object values)', 'For callbacks with primitive or plain-object arguments')
    .replace('When using the function form of the ', 'When using the ');
  if (topic === 'direction-provider') return value.replace('Use this hook', 'Use this utility');
  return value;
}
