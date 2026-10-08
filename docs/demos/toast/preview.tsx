import { render } from '@solidjs/web';
import entries from './entry';

const params = new URLSearchParams(location.search);
const entry = entries.find((item) => item.id === `toast/${params.get('demo') ?? 'hero'}`)!;
const variant = entry.variants.find((item) => item.id === (params.get('variant') ?? 'css-modules'))!;
render(() => <variant.component />, document.getElementById('app')!);
