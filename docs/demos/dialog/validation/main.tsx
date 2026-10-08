import { render } from '@solidjs/web';
import demos from '../entry';

const params = new URLSearchParams(location.search);
const entry = demos.find(item => item.id === `dialog/${params.get('demo') ?? 'hero'}`);
const variant = entry?.variants.find(item => item.id === (params.get('variant') ?? 'css-modules'));
if (!variant) throw new Error('Unknown dialog demo variant');
const Component = variant.component;
render(() => <Component />, document.getElementById('app')!);
