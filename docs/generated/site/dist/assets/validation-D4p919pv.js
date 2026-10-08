var e=`import { render } from '@solidjs/web';
import demos from './entry';

const params = new URLSearchParams(location.search);
const entry = demos.find((demo) => demo.id === \`select/\${params.get('demo')}\`)!;
const Demo = entry.variants.find((variant) => variant.id === params.get('variant'))!.component;
render(() => <Demo />, document.getElementById('root')!);
`;export{e as default};