/** Small CSP-safe lexical highlighter: text nodes preserve every source byte. */
export function highlightSource(code: HTMLElement, source: string): void {
  const doc = code.ownerDocument;
  const fragment = doc.createDocumentFragment();
  const tokens =
    /(?<comment>\/\*[\s\S]*?\*\/|\/\/[^\r\n]*)|(?<string>"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|`(?:\\[\s\S]|[^`\\])*`)|(?<tag>(?<=<\/?)[\w.-]+)|(?<attribute>\b[\w-]+(?=\s*=))|(?<number>\b(?:0x[\da-f]+|\d+(?:\.\d+)?)(?:px|rem|em|ms|s)?\b)|(?<keyword>\b(?:import|export|from|default|function|return|const|let|var|if|else|type|interface|async|await|new|throw|try|catch|finally|for|of|while|switch|case|break|extends|as|satisfies|true|false|null|undefined)\b)/gi;
  let offset = 0;
  for (const match of source.matchAll(tokens)) {
    fragment.append(doc.createTextNode(source.slice(offset, match.index)));
    const span = doc.createElement('span');
    const kind = Object.keys(match.groups!).find(
      (name) => match.groups![name] !== undefined,
    );
    span.className = `SiteToken-${kind}`;
    span.textContent = match[0];
    fragment.append(span);
    offset = match.index! + match[0].length;
  }
  fragment.append(doc.createTextNode(source.slice(offset)));
  code.replaceChildren(fragment);
}
