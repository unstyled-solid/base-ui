import { expectType } from '../../test';
import { Toolbar, type ToolbarRootItemMetadata, type ToolbarRootOrientation } from './index';
import { useToolbarRootContext, type ToolbarRootContext } from './root/ToolbarRootContext';
import { useToolbarGroupContext, type ToolbarGroupContext } from './group/ToolbarGroupContext';

function HostConsumer() {
  expectType<ToolbarRootContext, ReturnType<typeof required>>(required());
  expectType<ToolbarRootContext | null, ReturnType<typeof optional>>(optional());
  expectType<ToolbarGroupContext | null, ReturnType<typeof useToolbarGroupContext>>(useToolbarGroupContext());
  return null;
}
function required() { return useToolbarRootContext(); }
function optional() { return useToolbarRootContext(true); }

const metadata: ToolbarRootItemMetadata = { disabled: true, focusableWhenDisabled: false };
expectType<boolean, typeof metadata.disabled>(metadata.disabled);
const orientation: ToolbarRootOrientation = 'vertical';
<Toolbar.Root orientation={orientation} ref={(node) => expectType<HTMLDivElement, typeof node>(node)}>
  <HostConsumer />
  <Toolbar.Group ref={(node) => expectType<HTMLDivElement, typeof node>(node)}>
    <Toolbar.Button ref={(node) => expectType<HTMLButtonElement, typeof node>(node)} onClick={(event) => {
      expectType<EventTarget & HTMLButtonElement, typeof event.currentTarget>(event.currentTarget);
      event.preventBaseUIHandler();
    }} />
    <Toolbar.Input defaultValue="text" ref={(node) => expectType<HTMLInputElement, typeof node>(node)} />
    <Toolbar.Link href="#target" ref={(node) => expectType<HTMLAnchorElement, typeof node>(node)} />
  </Toolbar.Group>
  <Toolbar.Separator ref={(node) => expectType<HTMLDivElement, typeof node>(node)} />
</Toolbar.Root>;
// @ts-expect-error Source metadata requires the disabled-focusability distinction.
const incompleteMetadata: ToolbarRootItemMetadata = { disabled: false };
// @ts-expect-error Toolbar orientation cannot be a two-dimensional composite.
<Toolbar.Root orientation="both" />;
void incompleteMetadata;
