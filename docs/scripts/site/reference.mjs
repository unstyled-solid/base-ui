import { ordering } from '../../../upstream/base-ui/docs/src/utils/typeOrder.mjs';
import ts from 'typescript';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function ordered(rows, section) {
  const order = ordering[section] ?? [];
  const rank = row => { const index = order.indexOf(row.name === 'class' ? 'className' : row.name); const rest = order.indexOf('__EVERYTHING_ELSE__'); return index >= 0 ? index : rest >= 0 ? rest : order.length; };
  return [...rows].sort((a,b) => rank(a)-rank(b));
}
// Remove import qualifiers only for display; nested optional/undefined and Solid
// RemoveAttribute semantics remain intact in the expanded declaration.
const cleanType = type => String(type ?? '').replace(/import\("[^"]+"\)\./g,'');
function summaryType(prop) {
  const type = cleanType(prop.type).replace(/\s*\|\s*undefined$/, '');
  if (prop.name === 'style' && /=> StyleValue/.test(type) && type.includes('CSSProperties')) return 'StyleValue | function';
  const ast = ts.createSourceFile('type.ts', `type Value = ${type};`, ts.ScriptTarget.Latest, true);
  const node = ast.statements[0]?.type;
  function short(node) {
    if (!node) return type;
    if (ts.isParenthesizedTypeNode(node)) return short(node.type);
    if (ts.isUnionTypeNode(node)) return [...new Set(node.types.map(short))].join(' | ');
    if (ts.isFunctionTypeNode(node)) return 'function';
    if (ts.isTypeLiteralNode(node)) return 'object';
    if (ts.isTypeReferenceNode(node)) {
      const name = node.typeName.getText(ast);
      if (name === 'ComponentRenderFn') return 'function';
      if (name.startsWith('JSX.')) return name.slice(4);
    }
    return node.getText(ast);
  }
  const brief = short(node);
  return brief.length > 72 ? brief.slice(0,69) + '…' : brief;
}
export function renderReference(entry, attrs = {}, seen = new Set()) {
  if (entry.anchor && seen.has('render:' + entry.anchor)) return '';
  if (entry.anchor) seen.add('render:' + entry.anchor);
  function id(value) {
    if (!value || seen.has('id:' + esc(value))) return '';
    seen.add('id:' + esc(value)); return ` id="${esc(value)}"`;
  }
  const alias = entry.name?.replaceAll('.','');
  const allProps = entry.props?.length ? entry.props : entry.properties ?? [];
  const props = ordered(allProps.filter(prop => !prop.inheritedDOM && !/^(?:prop|attr|on|oncapture|bind):/.test(prop.name)), 'props');
  // Preserve existing deep links without duplicating Props/State tables below
  // every part. State and event details live inside the relevant prop disclosure.
  let anchors = `<span${id(alias?.toLowerCase())}></span>`;
  for (const value of entry.compatibilityAnchors ?? []) anchors += `<span${id(value)}></span>`;
  for (const prop of entry.compatibilityProperties ?? []) anchors += `<span${id(alias+'-'+prop.name)}></span>`;
  for (const prop of entry.parameters ?? []) if (!props.some(row => row.anchor === prop.anchor)) anchors += `<span${id(prop.anchor)}></span><span${id(alias+'-'+prop.name)}></span>`;
  for (const related of entry.related ?? []) {
    anchors += `<span${id(related.anchor)}></span>`;
    anchors += `<span${id(related.name?.replaceAll('.','').toLowerCase())}></span>`;
    for (const value of related.compatibilityAnchors ?? []) anchors += `<span${id(value)}></span>`;
    for (const prop of related.compatibilityProperties ?? []) anchors += `<span${id(related.name?.replaceAll('.','')+'-'+prop.name)}></span>`;
    for (const prop of [...related.properties ?? [], ...related.props ?? []]) anchors += `<span${id(prop.anchor)}></span><span${id(related.name?.replaceAll('.','')+'-'+prop.name)}></span>${related.compatibilityAlias ? `<span${id(related.compatibilityAlias.replaceAll('.','')+'-'+prop.name)}></span>` : ''}`;
  }
  const def = value => typeof value === 'object' && value !== null ? value.status === 'unavailable' ? '—' : value.value : value ?? '—';
  let html = `<section class="ApiReference" data-api-status="generated"${id(entry.anchor)}>${anchors}`;
  if (!attrs.hideDescription && entry.description) html += `<p class="MdP">${esc(entry.description)}</p>`;
  if (props.length && !attrs.hideProps) html += `<div class="ApiTable"><div class="ApiHeader"><span>${entry.kind === 'helper' ? 'Parameter' : entry.kind === 'type' ? 'Property' : 'Prop'}</span><span>Type</span><span>Default</span><span></span></div>${props.map(prop => {
    const full = cleanType(prop.type), value = def(prop.default ?? prop.defaultValue);
    const related = (entry.related ?? []).filter(type => !/(?:\.Props|Props)$/.test(type.name) && (prop.name === 'render' && /State$/.test(type.name) || full.includes(type.name.split('.').at(-1))));
    const declaration = type => type.properties?.length ? `{\n${type.properties.map(p => `  ${p.description ? '/** '+p.description.replaceAll('*/','* /')+' */\n  ' : ''}${p.name}${p.required ? '' : '?'}: ${cleanType(p.type)};`).join('\n')}\n}` : cleanType(type.type);
    return `<details class="ApiRow"${id(prop.anchor)}><summary><span class="ApiName"><span${id(alias+'-'+prop.name)}></span>${esc(prop.name)}${prop.required ? '<sup aria-label="required">*</sup>' : ''}</span><code class="ApiType">${esc(summaryType(prop))}</code><code class="ApiDefault">${esc(value)}</code><span class="ApiChevron" aria-hidden="true">⌄</span></summary><div class="ApiDetails">${prop.description ? `<p>${esc(prop.description)}</p>` : ''}<pre tabindex="0"><code>${esc(full)}</code></pre>${related.map(type => `<p><code>${esc(type.name)}</code></p><pre tabindex="0"><code>${esc(declaration(type))}</code></pre>`).join('')}</div></details>`;
  }).join('')}</div>`;
  for (const [field,title] of [['dataAttributes','Attribute'],['cssVariables','CSS variable']]) {
    const rows = ordered(entry[field] ?? [],field);
    if (!rows.length || field === 'dataAttributes' && attrs.hideDataAttributes || field === 'cssVariables' && attrs.hideCssVariables) continue;
    html += `<div class="ApiTable ApiMetadata"><table><thead><tr><th>${title}</th><th>Description</th></tr></thead><tbody>${rows.map(row => `<tr${id(row.anchor)}><td><code>${esc(row.name)}</code></td><td>${esc(row.description || '—')}</td></tr>`).join('')}</tbody></table></div>`;
  }
  if (entry.kind === 'helper' && entry.returnValue) {
    const returned = entry.returnValue;
    html += `<h4>Return value</h4><pre tabindex="0"><code>${esc(cleanType(returned.type))}</code></pre>`;
    if (returned.properties?.length) html += `<div class="ApiTable">${returned.properties.map(prop => `<details class="ApiRow"${id(prop.anchor)}><summary><span class="ApiName"><span${id(alias+'-'+prop.name)}></span>${esc(prop.name)}</span><code class="ApiType">${esc(summaryType(prop))}</code><span class="ApiDefault"></span><span class="ApiChevron" aria-hidden="true">⌄</span></summary><div class="ApiDetails">${prop.description ? `<p>${esc(prop.description)}</p>` : ''}<pre tabindex="0"><code>${esc(cleanType(prop.type))}</code></pre></div></details>`).join('')}</div>`;
  }
  if (entry.kind !== 'component' && entry.kind !== 'namespace' && entry.type) html += `<details class="ApiTypeDeclaration"><summary>Type declaration</summary><pre tabindex="0"><code>${esc(cleanType(entry.type))}</code></pre></details>`;
  return html + '</section>';
}
