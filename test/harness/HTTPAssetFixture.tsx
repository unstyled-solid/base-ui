import { lazy, Loading } from 'solid-js';

const Part = lazy(() => import('./HTTPLazyPart.fixture'));
export function HTTPAssetFixture(props: { label: string }) {
  return <Loading fallback="asset pending"><Part label={props.label} /></Loading>;
}
