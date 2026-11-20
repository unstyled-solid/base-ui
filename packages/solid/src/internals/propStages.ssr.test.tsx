import { createRoot, createUniqueId, merge } from 'solid-js';
import { renderToString } from '@solidjs/web';
import { expect, it } from 'vitest';
import { Field } from '../field';
import { Menu } from '../menu';
import { createMenuItem } from '../menu/item/createMenuItem';
import { createCheckboxGroupParent } from '../checkbox-group/useCheckboxGroupParent';
import { createSwipeDismiss } from '../utils/createSwipeDismiss';
import { getInlineRectTriggerProps } from '../utils/popups/inlineRect';
import { createButton } from './use-button/useButton';
import { CompositeList } from './composite';
import { createCompositeRoot } from './composite/root/CompositeRoot';
import { useFieldRootContext } from './field-root-context/FieldRootContext';
import { useLabelableContext } from './labelable-provider/LabelableContext';
import { getStateAttributesProps } from './getStateAttributesProps';
import { readStageProps } from './propStages.fixture';

type Stage = (external: Record<string, any>) => object;
const stages: Record<string, () => Stage> = {
  getButtonProps: () => createButton().getButtonProps,
  getRootProps: () => createCompositeRoot({}).getRootProps,
  getItemProps: () => createMenuItem({}).getItemProps,
  getValidationProps: () => {
    const field = useFieldRootContext(false);
    return (external) => field.validation.getValidationProps(false, external);
  },
  getDescriptionProps: () => useLabelableContext()!.getDescriptionProps,
  getParentProps: () => createCheckboxGroupParent({ value: ['a'], allValues: ['a', 'b'] }).getParentProps,
  getChildProps: () => {
    const parent = createCheckboxGroupParent({ value: ['a'], allValues: ['a', 'b'] });
    return () => parent.getChildProps('a');
  },
  getPointerProps: () => createSwipeDismiss({ enabled: true, directions: ['down'], elementRef: () => null, movementCssVars: { x: '--x', y: '--y' } }).getPointerProps,
  getTouchProps: () => createSwipeDismiss({ enabled: true, directions: ['down'], elementRef: () => null, movementCssVars: { x: '--x', y: '--y' } }).getTouchProps,
  getInlineRectTriggerProps: () => () => getInlineRectTriggerProps({ current: undefined }, false),
  getStateAttributesProps: () => () => getStateAttributesProps({ disabled: true, orientation: 'vertical' }),
};

function stageMarkup(setup: () => Stage, calls: number) {
  function Probe() {
    return createRoot(() => {
      const stage = setup();
      const external = Object.freeze({ id: 'external', title: 'title', 'aria-describedby': 'description' });
      const before = createUniqueId();
      for (let index = 0; index < calls; index += 1) readStageProps(stage(external), 2);
      const after = createUniqueId();
      return <output data-before={before} data-after={after} />;
    });
  }
  return renderToString(() => <Field.Root invalid><Menu.Root><CompositeList><Probe /></CompositeList></Menu.Root></Field.Root>, { renderId: 'stage-purity' });
}

for (const [name, setup] of Object.entries(stages)) {
  it(`${name} calls and returned getters allocate no hydration slots`, () => {
    const baseline = stageMarkup(setup, 0);
    expect(stageMarkup(setup, 2)).toBe(baseline);
    expect(stageMarkup(setup, 20)).toBe(baseline);
  });
}

it('the purity oracle detects the original function-source merge allocation', () => {
  const impure = () => (external: object) => merge(external, () => ({ type: 'button' }));
  expect(stageMarkup(impure, 2)).not.toBe(stageMarkup(impure, 0));
});
