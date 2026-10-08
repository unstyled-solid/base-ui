import { resolveApi } from './render.mjs';
export function markdownPage(page, context) {
  const records = new Map((page.sourceNodes ?? page.nodes).map(n => [n.location,n]));
  const cell = value => String(value ?? '').replaceAll('|','\\|').replaceAll('\n',' ');
  function md(n) {
    const children = () => (n.children ?? []).map(md).join('');
    switch(n.type) {
      case 'root': return children();
      case 'sourceModule': return '';
      case 'text': return n.value;
      case 'paragraph': return children()+'\n\n';
      case 'heading': return '#'.repeat(n.depth)+' '+children()+'\n\n';
      case 'code': return '```'+(n.lang ?? '')+'\n'+n.value+'\n```\n\n';
      case 'inlineCode': return '`'+n.value+'`';
      case 'strong': return '**'+children()+'**';
      case 'emphasis': return '*'+children()+'*';
      case 'link': return '['+children()+']('+n.url+')';
      case 'image': return '!['+(n.alt??'')+']('+n.url+')';
      case 'list': return children()+'\n';
      case 'listItem': return '- '+children().trim()+'\n';
      case 'mdxJsxFlowElement': case 'mdxJsxTextElement': {
        const record = records.get(`${page.source}:${n.position?.start?.line??1}:${n.position?.start?.column??1}`);
        if (record?.handler === 'metadata') return '';
        if (record?.handler === 'api') {
          const entry=resolveApi(context.api,record,page,record.attributes);
          if (!entry) return '';
          const props=(entry.props??entry.properties??[]).filter(p=>!p.inheritedDOM&&!p.name.includes(':'));
          return (entry.description??'')+'\n\n| Prop | Type | Description |\n| --- | --- | --- |\n'+props.map(p=>`| ${cell(p.name)} | ${cell(p.type.replace(/import\("[^"]+"\)\./g,''))} | ${cell(p.description)} |`).join('\n')+'\n\n';
        }
        if (record?.handler === 'demo') return `[Interactive example](${page.route})\n\n`;
        return children()+'\n\n';
      }
      default: return children();
    }
  }
  return md(page.ast);
}
