import { render } from '@solidjs/web';
import entries from './entry';
const query = new URLSearchParams(location.search);
const entry = entries.find((item) => item.id === `combobox/${query.get('demo') ?? 'hero'}`)!;
const Demo = entry.variants.find((item) => item.id === (query.get('variant') ?? 'css-modules'))!.component;
render(() => <Demo />, document.getElementById('demo')!);
