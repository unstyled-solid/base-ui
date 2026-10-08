/** Executed in the browser. Preserve natural DOM, including hidden controls and portal/focus guards. */
export function observe() {
  // Keep identity across checkpoints/reopens; do not hide regenerated IDs by restarting numbering.
  const ids = window.__qualification.generatedIds ??= new Map();
  const generated = (value) => /^(base-ui-|_r_|:r)/.test(value);
  const id = (value) => {
    if (!generated(value)) return value;
    if (!ids.has(value)) ids.set(value, `generated-${ids.size + 1}`);
    return ids.get(value);
  };
  for (const element of document.querySelectorAll('[id]')) id(element.id);
  const referenceAttributes = new Set(['id', 'for', 'aria-controls', 'aria-describedby',
    'aria-labelledby', 'aria-activedescendant', 'aria-owns', 'aria-details', 'aria-errormessage']);
  function attrs(element) {
    return Object.fromEntries([...element.attributes].map(({ name, value }) => {
      if (referenceAttributes.has(name)) value = value.split(' ').map(id).join(' ');
      if (name === 'style') {
        // CSS declaration order is serialization, not a behavioral difference. Retain every value/priority.
        value = [...element.style].sort().map((property) =>
          `${property}:${element.style.getPropertyValue(property)}${element.style.getPropertyPriority(property) ? '!important' : ''}`).join(';');
      }
      return [name, value];
    }).sort(([a], [b]) => a.localeCompare(b)));
  }
  function tree(node) {
    // Compiler comment markers and Vite module scripts are not rendered component DOM.
    if (node.nodeType === Node.COMMENT_NODE) {
      return /^[!$#/@]*$/.test(node.textContent) ? null : { comment: node.textContent };
    }
    if (node.nodeType === Node.TEXT_NODE) return node.textContent === '' ? null : node.textContent;
    if (!(node instanceof Element) || node.tagName === 'SCRIPT') return null;
    const result = { tag: node.localName, attrs: attrs(node), children: [...node.childNodes].map(tree).filter((child) => child !== null) };
    if (node instanceof HTMLInputElement) {
      result.control = { value: node.value, checked: node.checked, indeterminate: node.indeterminate,
        validity: { valid: node.validity.valid, valueMissing: node.validity.valueMissing } };
    } else if (node instanceof HTMLSelectElement || node instanceof HTMLTextAreaElement) {
      result.control = { value: node.value };
    }
    return result;
  }
  const focus = document.activeElement;
  return {
    dom: tree(document.body),
    document: { html: attrs(document.documentElement) },
    focus: focus instanceof Element ? { tag: focus.localName, id: id(focus.id), testId: focus.getAttribute('data-testid') } : null,
    forms: [...document.forms].map((form) => [...new FormData(form).entries()]),
    callbacks: window.__qualification.log,
  };
}

export function differences(expected, actual, path = '$', output = []) {
  if (Object.is(expected, actual)) return output;
  if (expected === null || actual === null || typeof expected !== 'object' || typeof actual !== 'object'
    || Array.isArray(expected) !== Array.isArray(actual)) {
    output.push({ path, react: expected, solid: actual });
    return output;
  }
  for (const key of new Set([...Object.keys(expected), ...Object.keys(actual)])) {
    differences(expected[key], actual[key], `${path}.${key}`, output);
  }
  return output;
}
