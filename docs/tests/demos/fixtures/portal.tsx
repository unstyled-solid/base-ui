import { Portal } from '@solidjs/web';
export default function PortalFixture() {
  return <Portal><div data-demo-fixture-portal="">Owned portal</div></Portal>;
}
